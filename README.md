# 🏢 CRM WIN ZE GAME - Agile Vizion

Une application CRM moderne et complète construite avec React + TypeScript pour le frontend et Node.js + Express + TypeScript pour le backend, utilisant PostgreSQL comme base de données.

## 🚀 Fonctionnalités

### 📊 Gestion des Prospects
- **CRUD complet** : Créer, Lire, Mettre à jour, Supprimer les prospects
- **Tableau de bord** : Statistiques en temps réel avec métriques détaillées
- **Liste interactive** : Tableau avec tri, filtrage et édition en ligne
- **Formulaire avancé** : Création et modification avec validation
- **Carte géographique** : Visualisation des prospects sur une carte interactive
- **Actions de suivi** : Système d'étapes de suivi (à contacter, LinkedIn envoyé, email envoyé, etc.)

### 🎨 Interface Utilisateur
- **Design moderne** : Material-UI avec thème personnalisé
- **Navigation intuitive** : Menu responsive avec indicateurs visuels
- **Responsive** : Interface adaptée mobile, tablette et desktop
- **Thème cohérent** : Couleurs et typographie professionnelles

### 🔧 Fonctionnalités Avancées
- **Gestion des statuts** : Prospects, Clients, N/A avec couleurs distinctives
- **Types d'entreprise** : Catégorisation des prospects par secteur
- **Régions** : Organisation géographique des prospects
- **Notes et commentaires** : Suivi détaillé des interactions
- **Recherche et filtres** : Navigation rapide dans les données

## 🛠️ Technologies utilisées

### Frontend
- **React 19** avec TypeScript
- **Material-UI (MUI)** pour l'interface
- **React Router DOM** pour la navigation
- **React Leaflet** pour les cartes
- **Axios** pour les appels API
- **Vite** pour le build et le développement

### Backend
- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **PostgreSQL** pour la base de données
- **CORS** pour la sécurité
- **dotenv** pour la configuration

## 🏗️ Architecture Système

### Vue d'ensemble
Le CRM WIN ZE GAME suit une architecture **3-tiers** moderne avec séparation claire des responsabilités :

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Frontend      │ ◄─────────────► │    Backend      │ ◄────────► │   PostgreSQL    │
│   (React)       │                 │   (Node.js)     │            │   Database      │
│   Port: 5173    │                 │   Port: 3001    │            │   Port: 5432    │
└─────────────────┘                 └─────────────────┘            └─────────────────┘
```

### 🎯 Couches de l'Application

#### 1. **Présentation (Frontend)**
- **Framework** : React 19 + TypeScript
- **UI Library** : Material-UI (MUI)
- **Build Tool** : Vite
- **Routing** : React Router DOM
- **Maps** : React Leaflet + Leaflet
- **HTTP Client** : Axios

**Responsabilités :**
- Interface utilisateur responsive
- Gestion des formulaires et validation
- Navigation entre les pages
- Affichage des données avec filtrage/tri
- Visualisation cartographique

#### 2. **Logique Métier (Backend)**
- **Runtime** : Node.js v20.19.4
- **Framework** : Express.js
- **Language** : TypeScript
- **Configuration** : dotenv
- **Sécurité** : CORS

**Responsabilités :**
- API RESTful
- Validation des données
- Logique métier CRM
- Gestion des erreurs
- Sécurité et authentification

#### 3. **Données (Base de données)**
- **SGBD** : PostgreSQL v16.9
- **ORM** : pg (driver natif)
- **Migrations** : Scripts SQL manuels
- **Backup** : Scripts automatisés

**Responsabilités :**
- Persistance des données
- Intégrité référentielle
- Performance des requêtes
- Sauvegarde et récupération

### 🔄 Flux de Données

```
1. Utilisateur interagit avec l'interface React
2. Composant React appelle l'API via Axios
3. Express.js reçoit la requête HTTP
4. Validation et traitement des données
5. Requête SQL vers PostgreSQL
6. Réponse JSON retournée au frontend
7. Mise à jour de l'interface utilisateur
```

### 🛡️ Sécurité et Performance

#### Sécurité
- **CORS** : Protection contre les requêtes cross-origin
- **Validation** : Vérification des données côté serveur
- **SQL Injection** : Protection via paramètres préparés
- **XSS** : Échappement automatique des données

#### Performance
- **Hot Module Replacement** : Développement rapide
- **Lazy Loading** : Chargement à la demande
- **Optimisation des requêtes** : Index sur les colonnes clés
- **Compression** : Réduction de la taille des réponses

### 🔧 Configuration et Déploiement

#### Environnements
- **Développement** : Hot reload, logs détaillés
- **Production** : Build optimisé, logs minimaux
- **Test** : Base de données de test séparée

#### Monitoring
- **Logs** : Console et fichiers de log
- **Erreurs** : Gestion centralisée des exceptions
- **Performance** : Métriques de réponse API

## 📁 Structure du projet

```
CRM/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   └── Header.tsx    # Navigation principale
│   │   ├── pages/            # Pages de l'application
│   │   │   ├── Dashboard.tsx     # Tableau de bord
│   │   │   ├── ProspectsList.tsx # Liste des prospects
│   │   │   ├── ProspectForm.tsx  # Formulaire prospect
│   │   │   └── ProspectsMap.tsx  # Carte géographique
│   │   ├── services/         # Services API
│   │   │   └── api.ts        # Client API
│   │   ├── types/            # Types TypeScript
│   │   │   └── index.ts      # Définitions des types
│   │   └── assets/           # Ressources statiques
│   └── package.json
├── backend/                  # API Express
│   ├── src/
│   │   └── server.ts         # Serveur principal
│   ├── database.sql          # Script de base de données
│   ├── *.sql                 # Scripts de migration
│   └── package.json
├── start-app.sh              # Script de démarrage
└── README.md
```

## 🚀 Installation et démarrage

### Prérequis
- **Node.js** v20.19.4 ou supérieur
- **PostgreSQL** v16.9 ou supérieur
- **npm** v10.2.4 ou supérieur

### 1. Cloner le projet
```bash
git clone <repository-url>
cd CRM
```

### 2. Configuration de la base de données

#### ⚠️ **Important : Configuration sans mot de passe**
Cette application est configurée pour fonctionner avec PostgreSQL **sans mot de passe** en mode développement local.

```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql

# Se connecter à PostgreSQL (sans mot de passe)
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE crm_db;

# Se connecter à la base de données
\c crm_db

# Exécuter le script de création des tables
\i backend/database.sql

# Quitter PostgreSQL
\q
```

#### 🔧 **Configuration des variables d'environnement**
Le fichier `.env` du backend doit être configuré comme suit :

```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=crm_db
DB_PASSWORD=          # Laissez vide pour le développement local
DB_PORT=5432
```

### 3. Configuration du backend
```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres de base de données (voir ci-dessus)
```

### 4. Configuration du frontend
```bash
cd frontend

# Installer les dépendances
npm install
```

### 5. Démarrer l'application

#### Option 1 : Script automatique
```bash
# Depuis la racine du projet
./start-app.sh
```

#### Option 2 : Démarrage manuel

**Terminal 1 - Backend (Développement)**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Développement)**
```bash
cd frontend
npm run dev
```

## 🌐 Accès à l'application

### Environnement de Développement
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001/api
- **API Prospects** : http://localhost:3001/api/prospects

### Environnement de Production
- **Frontend** : Build statique servie par un serveur web
- **Backend API** : Port configuré dans les variables d'environnement

## 📊 API Endpoints

### 🔗 **Endpoints Principaux**

#### Prospects
- `GET /api/prospects` - Récupérer tous les prospects
- `GET /api/prospects/:id` - Récupérer un prospect par ID
- `POST /api/prospects` - Créer un nouveau prospect
- `PUT /api/prospects/:id` - Mettre à jour un prospect
- `DELETE /api/prospects/:id` - Supprimer un prospect

#### 📝 **Exemples d'utilisation**

**Récupérer tous les prospects :**
```bash
curl http://localhost:3001/api/prospects
```

**Créer un nouveau prospect :**
```bash
curl -X POST http://localhost:3001/api/prospects \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@email.com",
    "telephone": "0123456789",
    "entreprise": "Entreprise A",
    "type_entreprise": "Startup",
    "statut": "Prospects",
    "region": "Île-de-France",
    "etape_suivi": "à contacter",
    "notes": "Intéressé par nos services",
    "adresse": "123 Rue de la Paix, 75001 Paris",
    "latitude": 48.8566,
    "longitude": 2.3522
  }'
```

**Mettre à jour un prospect :**
```bash
curl -X PUT http://localhost:3001/api/prospects/1 \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "Clients",
    "etape_suivi": "OK"
  }'
```

### Format des données Prospect
```json
{
  "nom": "Jean Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "telephone": "0123456789",
  "entreprise": "Entreprise A",
  "type_entreprise": "Startup",
  "statut": "Prospects",
  "region": "Île-de-France",
  "etape_suivi": "à contacter",
  "notes": "Intéressé par nos services",
  "adresse": "123 Rue de la Paix, 75001 Paris",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

## 🎨 Interface utilisateur

### Pages disponibles
1. **Dashboard** (`/`) - Vue d'ensemble avec statistiques détaillées
2. **Contacts** (`/prospects`) - Liste complète avec actions de suivi
3. **Nouveau Contact** (`/prospects/new`) - Formulaire de création
4. **Modifier Contact** (`/prospects/:id/edit`) - Formulaire de modification
5. **Carte** (`/map`) - Visualisation géographique des prospects

### Fonctionnalités UI
- **Navigation intuitive** avec Material-UI
- **Tableaux responsifs** avec tri et filtrage
- **Formulaires avancés** avec validation
- **Carte interactive** avec marqueurs colorés
- **Actions de suivi** avec dropdown en ligne
- **Design moderne** et professionnel

### Statuts et Couleurs
- **Prospects** : Vert (#4CAF50)
- **Clients** : Bleu (#2196F3)
- **N/A** : Gris (#9E9E9E)

### Actions de Suivi
- à contacter
- linkedin envoyé
- email envoyé
- call effectué
- entretien 1/2/3
- OK
- KO

## 🔧 Scripts disponibles

### Backend

#### 🛠️ **Environnement de Développement**
- `npm run dev` - Démarrer le serveur de développement avec hot reload

#### 🚀 **Environnement de Production**
- `npm run build` - Compiler le projet TypeScript
- `npm start` - Démarrer le serveur de production

### Frontend

#### 🛠️ **Environnement de Développement**
- `npm run dev` - Démarrer le serveur de développement Vite avec hot reload

#### 🚀 **Environnement de Production**
- `npm run build` - Construire pour la production (génère le dossier `dist/`)
- `npm run preview` - Prévisualiser la build de production localement

### Scripts de base de données
- `./reset-db.sh` - Réinitialiser la base de données
- `./setup-db.sh` - Configurer la base de données
- `./test-db.sh` - Tester la connexion

## 📝 Variables d'environnement

### Backend (.env)
```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=crm_db
DB_PASSWORD=          # Laissez vide pour le développement local
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

## 🆘 Dépannage

### Problèmes courants
1. **Erreur "column created_at does not exist"** → Exécuter `./reset-db.sh`
2. **Erreur "Could not read package.json"** → Vérifier le répertoire de travail
3. **Problème de connexion PostgreSQL** → Démarrer le service : `sudo systemctl start postgresql`
4. **Ports déjà utilisés** → Tuer les processus : `pkill -f "ts-node"` et `pkill -f "vite"`

### Commandes utiles
```bash
# Arrêter tous les processus
pkill -f "ts-node"
pkill -f "vite"

# Vérifier les ports
netstat -tulpn | grep :3001
netstat -tulpn | grep :5173

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Consulter le fichier `TROUBLESHOOTING.md`
- Ouvrir une issue sur le repository GitHub
- Vérifier les logs dans `backend.log`

---

**Développé avec ❤️ par Agile Vizion** 