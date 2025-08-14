# 🏢 CRM WIN ZE GAME

Application CRM moderne pour gérer vos prospects et clients.

## 🚀 Démarrage rapide

```bash
# Lancer l'application complète
./launch-crm.sh

# Ou lancer séparément
cd frontend && npm run dev  # Frontend (port 3002)
cd backend && npm run dev   # Backend (port 3003)
```

## 📁 Structure du projet

### 🎨 **Frontend** (`frontend/`)
- **React + TypeScript** - Interface utilisateur
- **Material-UI** - Design moderne
- **Port 3002** - http://localhost:3002

### 🔧 **Backend** (`backend/`)
- **Node.js + Express** - API REST
- **PostgreSQL** - Base de données
- **Port 3003** - http://localhost:3003

## 📄 Fichiers principaux

### 🚀 **Lancement**
- `launch-crm.sh` - Lance l'application complète
- `CRM.desktop` - Lanceur pour le menu système
- `cleanup.sh` - Nettoie les dépendances

### 🗄️ **Base de données** (`backend/`)
- `setup-db.sh` - Configure la base de données
- `schema_complet.sql` - Crée une nouvelle base
- `migration_unifiee.sql` - Met à jour une base existante
- `nettoyer-complet.sh` - Nettoie les anciens fichiers

### ⚙️ **Configuration**
- `.gitignore` - Exclut les fichiers non nécessaires
- `.env.example` - Exemple de configuration
- `backend/.env` - Configuration de la base de données

## 🎯 Utilisation

### **Base de données**
```bash
cd backend
./setup-db.sh nouveau     # Nouvelle installation
./setup-db.sh migration   # Migration existante
./setup-db.sh test        # Test connexion
./setup-db.sh stats       # Statistiques
```

### **Nettoyage**
```bash
./cleanup.sh size         # Voir taille des dépendances
./cleanup.sh full         # Nettoyer + réinstaller
```

### **Lancement**
```bash
./launch-crm.sh           # Application complète
```

## 🛠️ Technologies

- **Frontend** : React 19, TypeScript, Material-UI, Vite
- **Backend** : Node.js, Express, TypeScript, PostgreSQL
- **Base de données** : PostgreSQL avec triggers et vues

## 📊 Fonctionnalités

- ✅ Gestion des prospects (CRUD)
- ✅ Tableau de bord avec statistiques
- ✅ Carte géographique des prospects
- ✅ Filtrage et recherche
- ✅ Gestion des statuts et étapes
- ✅ Interface responsive

## 🔧 Dépannage

### **Base de données**
```bash
cd backend
./setup-db.sh test        # Tester la connexion
```

### **Dépendances**
```bash
./cleanup.sh full         # Réinstaller les dépendances
```

### **Ports utilisés**
```bash
pkill -f "vite"          # Arrêter le frontend
pkill -f "ts-node"       # Arrêter le backend
```

## 📝 Notes

- **Base de données** : PostgreSQL requis
- **Ports** : 3002 (frontend), 3003 (backend)
- **Node.js** : Version 18+ recommandée 