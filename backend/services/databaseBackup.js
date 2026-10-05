const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3');
const sequelize = require('../config/database');

let backupInProgress = false;

function createBackupFile(destination) {
  const sourcePath = sequelize.options.storage;

  if (!sourcePath || sourcePath === ':memory:') {
    return Promise.reject(new Error('Le chemin de la base SQLite sur disque est introuvable.'));
  }

  return new Promise((resolve, reject) => {
    const source = new sqlite3.Database(sourcePath, sqlite3.OPEN_READONLY, (openError) => {
      if (openError) {
        source.close(() => reject(openError));
        return;
      }

      const backup = source.backup(destination, (backupError) => {
        if (backupError) {
          closeSource(backupError);
          return;
        }

        const copyNextPage = () => {
          backup.step(-1, (stepError, complete) => {
            if (stepError) {
              closeSource(stepError);
            } else if (!complete) {
              setTimeout(copyNextPage, 100);
            } else {
              backup.finish((finishError) => closeSource(finishError));
            }
          });
        };

        copyNextPage();
      });

      function closeSource(error) {
        source.close((closeError) => {
          if (error) {
            reject(error);
          } else if (closeError) {
            reject(closeError);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

function getMailConfiguration() {
  const requiredVariables = ['MAIL_HOST', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_ADDRESS'];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    return { missingVariables };
  }

  const port = Number(process.env.MAIL_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('MAIL_PORT doit être un port valide entre 1 et 65535.');
  }

  const encryption = (process.env.MAIL_ENCRYPTION || 'tls').toLowerCase();
  if (!['tls', 'ssl'].includes(encryption)) {
    throw new Error('MAIL_ENCRYPTION doit être « tls » (STARTTLS) ou « ssl ».');
  }

  return {
    recipient: process.env.BACKUP_EMAIL_TO || process.env.MAIL_FROM_ADDRESS,
    transport: {
      host: process.env.MAIL_HOST,
      port,
      secure: encryption === 'ssl',
      requireTLS: encryption === 'tls',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    sender: process.env.MAIL_FROM_ADDRESS,
  };
}

async function sendDatabaseBackup(transporter, recipient, sender) {
  if (backupInProgress) {
    console.warn('Sauvegarde SQLite ignorée : une sauvegarde précédente est toujours en cours.');
    return;
  }

  backupInProgress = true;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `zenwallet-backup-${timestamp}.sqlite`;
  const backupPath = path.join(os.tmpdir(), filename);

  try {
    await createBackupFile(backupPath);
    const result = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: `Sauvegarde SQLite Zenwallet - ${timestamp}`,
      text: 'La sauvegarde de la base de données SQLite est jointe à ce message.',
      attachments: [{ filename, path: backupPath }],
    });
    console.log(`Sauvegarde SQLite envoyée à ${recipient}.`);
    return result;
  } finally {
    try {
      await fs.unlink(backupPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Impossible de supprimer le fichier temporaire de sauvegarde :', error);
      }
    }
    backupInProgress = false;
  }
}

function startDatabaseBackupSchedule() {
  const mailConfiguration = getMailConfiguration();

  if (mailConfiguration.missingVariables) {
    console.warn(
      `Sauvegardes par courriel désactivées : configurez ${mailConfiguration.missingVariables.join(', ')}.`
    );
    return null;
  }

  const expression = process.env.BACKUP_CRON || '0 0 * * *';
  const timezone = process.env.BACKUP_TIMEZONE || 'Europe/Paris';
  if (!cron.validate(expression)) {
    throw new Error(`Expression BACKUP_CRON invalide : ${expression}`);
  }

  const transporter = nodemailer.createTransport(mailConfiguration.transport);
  const task = cron.schedule(expression, () => {
    sendDatabaseBackup(
      transporter,
      mailConfiguration.recipient,
      mailConfiguration.sender
    ).catch((error) => {
      console.error('Échec de la sauvegarde ou de son envoi par courriel :', error);
    });
  }, { timezone });

  console.log(`Sauvegarde SQLite planifiée (${expression}, fuseau ${timezone}).`);
  return task;
}

module.exports = {
  createBackupFile,
  getMailConfiguration,
  sendDatabaseBackup,
  startDatabaseBackupSchedule,
};
