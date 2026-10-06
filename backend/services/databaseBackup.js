const fs = require('fs').promises;
const { createWriteStream } = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { once } = require('events');
const { pipeline } = require('stream/promises');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const sequelize = require('../config/database');

let backupInProgress = false;
const backupStatus = {
  enabled: false,
  running: false,
  configurationMessage: 'La sauvegarde planifiée n’a pas été configurée.',
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastError: null,
};

function createBackupFile(destination) {
  const { host, port, username, password, database } = sequelize.config;
  const dump = spawn(process.env.MYSQLDUMP_PATH || 'mysqldump', [
    `--host=${host}`,
    `--port=${port}`,
    `--user=${username}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    '--databases',
    database,
  ], {
    env: { ...process.env, MYSQL_PWD: password },
    windowsHide: true,
  });

  let stderr = '';
  dump.stderr.setEncoding('utf8');
  dump.stderr.on('data', (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-16000);
  });

  return Promise.all([
    pipeline(dump.stdout, createWriteStream(destination, { flags: 'wx' })),
    once(dump, 'close'),
  ]).then(([, [exitCode, signal]]) => {
    if (exitCode !== 0) {
      throw new Error(`mysqldump a échoué (${signal || exitCode}) : ${stderr.trim() || 'erreur inconnue'}`);
    }
  }).catch((error) => {
    dump.kill();
    if (error.code === 'ENOENT') {
      throw new Error('mysqldump est introuvable. Installez les outils client MySQL ou définissez MYSQLDUMP_PATH.', {
        cause: error,
      });
    }
    throw error;
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
    console.warn('Sauvegarde MySQL ignorée : une sauvegarde précédente est toujours en cours.');
    return;
  }

  backupInProgress = true;
  backupStatus.running = true;
  backupStatus.lastAttemptAt = new Date().toISOString();
  backupStatus.lastError = null;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `zenwallet-backup-${timestamp}.sql`;
  const backupPath = path.join(os.tmpdir(), filename);

  try {
    await createBackupFile(backupPath);
    const result = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: `Sauvegarde MySQL Zenwallet - ${timestamp}`,
      text: 'La sauvegarde de la base de données MySQL est jointe à ce message.',
      attachments: [{ filename, path: backupPath }],
    });
    console.log(`Sauvegarde MySQL envoyée à ${recipient}.`);
    backupStatus.lastSuccessAt = new Date().toISOString();
    return result;
  } catch (error) {
    backupStatus.lastError = 'Échec de la dernière sauvegarde ; consultez les journaux du backend.';
    throw error;
  } finally {
    try {
      await fs.unlink(backupPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Impossible de supprimer le fichier temporaire de sauvegarde :', error);
      }
    }
    backupInProgress = false;
    backupStatus.running = false;
  }
}

function startDatabaseBackupSchedule() {
  const mailConfiguration = getMailConfiguration();

  if (mailConfiguration.missingVariables) {
    backupStatus.enabled = false;
    backupStatus.configurationMessage = `Configuration incomplète : ${mailConfiguration.missingVariables.join(', ')}.`;
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

  backupStatus.enabled = true;
  backupStatus.configurationMessage = null;
  console.log(`Sauvegarde MySQL planifiée (${expression}, fuseau ${timezone}).`);
  return task;
}

function getDatabaseBackupStatus() {
  return { ...backupStatus };
}

module.exports = {
  createBackupFile,
  getMailConfiguration,
  sendDatabaseBackup,
  startDatabaseBackupSchedule,
  getDatabaseBackupStatus,
};
