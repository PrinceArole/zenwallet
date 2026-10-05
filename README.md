# 💰 Zenwallet

**Zenwallet** est une application web de gestion de budget personnel. Elle permet aux utilisateurs de suivre leurs revenus et dépenses, de définir un budget mensuel, d’analyser leurs finances et de mieux contrôler leur solde en temps réel.

---

## 🎯 Objectifs pédagogiques

Ce projet a été réalisé dans le cadre du module 3DVP pour mettre en pratique :

- Le développement **fullstack** (Vue.js + Express.js + SQLite)
- Les concepts **DevOps** : CI/CD, linting, tests
- Le déploiement continu sur **Render**

---

## 🔧 Technologies utilisées

| Stack        | Détails                        |
|--------------|--------------------------------|
| **Frontend** | Vue.js 3 + Vite + Tailwind CSS |
| **Backend**  | Express.js (Node.js)           |
| **BDD**      | SQLite (via Sequelize ORM)     |
| **CI/CD**    | GitHub Actions + Render        |
| **Tests**    | Jest (ou à ajouter)            |
| **Lint**     | ESLint                         |

---

## ✅ Fonctionnalités principales

- Définir un **budget mensuel**
- Ajouter, modifier, supprimer ses **revenus** et **dépenses**
- Suivre son **solde disponible en temps réel**
- Visualiser des **statistiques de dépenses** :
  - Par catégorie
  - Par mois
  - Par type
- Ajouter des **tags personnalisés** (ex : “Urgent”, “Récurrent”)
- Filtrer les mouvements **par période personnalisée**

---

## 🚀 Lancer le projet en local

### 1. Cloner le dépôt

```bash
git clone https://github.com/PrinceArole/zenwalle.git
cd Zenwallet
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx nodemon app.js
```

> SQLite est utilisé automatiquement : le fichier `backend/database.sqlite` est créé au démarrage.

#### Comptes utilisateurs

Crée un secret de session aléatoire pour `JWT_SECRET` dans `backend/.env` (au moins 32 caractères), puis règle `FRONTEND_ORIGIN` sur l’adresse exacte du frontend déployé, par exemple `https://zenwallet-app.onrender.com` (sans chemin `/api`). Le backend ajoute la table des utilisateurs et les colonnes `user_id` aux revenus, dépenses et budgets. Les données historiques sans propriétaire sont attribuées au premier compte créé ; les nouveaux enregistrements sont séparés par compte. Les mots de passe sont stockés sous forme hachée et les sessions utilisent un cookie HttpOnly.

Pour générer un secret avec Node.js : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. En local, le frontend utilise `http://localhost:5000/api` par défaut. En production, configure l’URL complète de ton backend, avec le suffixe `/api` (par exemple `https://mon-backend.example.com/api`), dans `frontend/public/runtime-config.js` (`window.ZENWALLET_CONFIG.apiBaseUrl`). Ce fichier est chargé par le navigateur avant l’application : tu peux changer l’adresse sans rebâtir le bundle frontend. En alternative, configure `VITE_API_URL` dans l’environnement de build du frontend (cette méthode nécessite un nouveau build). Sur le backend, renseigne `FRONTEND_ORIGIN` avec l’origine exacte du frontend, sans chemin `/api` ; plusieurs origines peuvent être séparées par des virgules.

Pour supprimer toutes les données et recréer les tables de la base, lancez depuis `backend` :

```bash
npm run db:reset
```

#### Sauvegarde SQLite par courriel

Le backend peut envoyer automatiquement une copie cohérente de la base en pièce jointe. Configurez dans `backend/.env` les variables `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION` et `MAIL_FROM_ADDRESS` (voir `backend/.env.example`). Par défaut, la sauvegarde est envoyée à l’adresse `MAIL_FROM_ADDRESS`; définissez `BACKUP_EMAIL_TO` pour choisir une autre adresse. L’envoi est planifié chaque jour à minuit, heure de Paris. Modifiez `BACKUP_CRON` pour changer l’horaire et `BACKUP_TIMEZONE` pour changer le fuseau horaire. Avec Gmail, utilisez `smtp.gmail.com`, le port `587`, `MAIL_ENCRYPTION=tls` et un mot de passe d’application Google dans `MAIL_PASSWORD`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Démo en ligne

🔗 [Lien Render (démo déployée)](https://zenwallet-app.onrender.com)

---

## 📂 Structure du projet

```
Zenwallet/
├── backend/       # Express.js + Sequelize
├── frontend/      # Vue.js + Tailwind
└── .github/       # CI GitHub Actions
```

---

## ⚙️ CI/CD

- Linting automatique avec ESLint
- Déclenchement automatique des tests et du déploiement sur chaque `push` sur `main`

---


## 👨‍💻 Auteur

- Prénom Nom – [GitHub](https://github.com/PrinceArole)
