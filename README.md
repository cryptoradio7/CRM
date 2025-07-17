# CRM Application

Une application CRM moderne construite avec React + TypeScript pour le frontend et Node.js + Express + TypeScript pour le backend, utilisant PostgreSQL comme base de données.

## 🚀 Fonctionnalités

- **Gestion des prospects** : CRUD complet (Créer, Lire, Mettre à jour, Supprimer)
- **Interface moderne** : Material-UI pour une expérience utilisateur optimale
- **Navigation intuitive** : React Router pour une navigation fluide
- **API RESTful** : Backend Express avec endpoints complets
- **Base de données** : PostgreSQL pour la persistance des données

## 🛠️ Technologies utilisées

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router DOM
- Vite (build tool)

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- CORS

## 📁 Structure du projet

```
CRM/
├── frontend/          # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   └── types/         # Types TypeScript
│   └── package.json
├── backend/           # API Express
│   ├── src/
│   │   └── server.ts      # Serveur principal
│   ├── database.sql       # Script de base de données
│   └── package.json
└── README.md
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- PostgreSQL
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd CRM
```

### 2. Configuration de la base de données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE crm_db;

# Se connecter à la base de données
\c crm_db

# Exécuter le script de création des tables
\i backend/database.sql
```

### 3. Configuration du backend
```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres de base de données
```

### 4. Configuration du frontend
```bash
cd frontend

# Installer les dépendances
npm install
```

### 5. Démarrer l'application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001/api

## 📊 API Endpoints

### Prospects
- `GET /api/prospects` - Récupérer tous les prospects
- `GET /api/prospects/:id` - Récupérer un prospect par ID
- `POST /api/prospects` - Créer un nouveau prospect
- `PUT /api/prospects/:id` - Mettre à jour un prospect
- `DELETE /api/prospects/:id` - Supprimer un prospect

### Format des données Prospect
```json
{
  "nom": "Jean Dupont",
  "email": "jean.dupont@email.com",
  "telephone": "0123456789",
  "entreprise": "Entreprise A",
  "statut": "Contacté",
  "notes": "Intéressé par nos services"
}
```

## 🎨 Interface utilisateur

### Pages disponibles
1. **Dashboard** (`/`) - Vue d'ensemble avec statistiques
2. **Liste des Prospects** (`/prospects`) - Tableau avec tous les prospects
3. **Nouveau Prospect** (`/prospects/new`) - Formulaire de création
4. **Modifier Prospect** (`/prospects/:id/edit`) - Formulaire de modification

### Fonctionnalités
- Navigation intuitive avec Material-UI
- Tableaux responsifs
- Formulaires avec validation
- Actions CRUD complètes
- Design moderne et professionnel

## 🔧 Scripts disponibles

### Backend
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Compiler le projet TypeScript
- `npm start` - Démarrer le serveur de production

### Frontend
- `npm run dev` - Démarrer le serveur de développement Vite
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser la build de production

## 📝 Variables d'environnement

### Backend (.env)
```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=crm_db
DB_PASSWORD=votre_mot_de_passe
DB_PORT=5432
```

## 🚀 Déploiement

### Backend
1. Compiler le projet : `npm run build`
2. Configurer les variables d'environnement de production
3. Démarrer avec : `npm start`

### Frontend
1. Construire le projet : `npm run build`
2. Servir les fichiers statiques depuis le dossier `dist/`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub. 