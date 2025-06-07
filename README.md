# 💰 Zenwallet

**Zenwallet** est une application web de gestion de budget personnel. Elle permet aux utilisateurs de suivre leurs revenus et dépenses, de définir un budget mensuel, d’analyser leurs finances et de mieux contrôler leur solde en temps réel.

---

## 🎯 Objectifs pédagogiques

Ce projet a été réalisé dans le cadre du module 3DVP pour mettre en pratique :

- Le développement **fullstack** (Vue.js + Express.js + MySQL)
- Les concepts **DevOps** : CI/CD, linting, tests
- Le déploiement continu sur **Render**

---

## 🔧 Technologies utilisées

| Stack        | Détails                        |
|--------------|--------------------------------|
| **Frontend** | Vue.js 3 + Vite + Tailwind CSS |
| **Backend**  | Express.js (Node.js)           |
| **BDD**      | MySQL (via Sequelize ORM)      |
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
git clone https://github.com/votre-utilisateur/Zenwallet.git
cd Zenwallet
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx nodemon app.js
```

> ⚠️ Assurez-vous que MySQL est démarré et que la base `Zenwallet` existe.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Démo en ligne

🔗 [Lien Render (démo déployée)](https://Zenwallet-app.onrender.com)

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

- Prénom Nom – [GitHub](https://github.com/votre-utilisateur)
