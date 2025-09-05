# Architecture Complète du Projet CRM

## 📊 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION CRM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (React.js)                              │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │   │
│  │  │ ProspectsList   │  │   ProspectsMap      │ │   │
│  │  │   - Liste des   │  │   - Carte des       │ │   │
│  │  │     contacts    │  │     prospects       │ │   │
│  │  │   - Filtres     │  │   - Géolocalisation │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │   │
│  │  │  ProspectForm   │  │    Header       │  │     Components      │ │   │
│  │  │  - Ajout/Edit   │  │   - Navigation  │  │   - Réutilisables   │ │   │
│  │  │  - Validation   │  │   - Menu        │  │   - UI/UX           │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │   │
│  │                                                                     │   │
│  │  Port: 3002 (Vite Dev Server)                                      │   │
│  │  Framework: React 18 + TypeScript + Vite                           │   │
│  │  UI: Material-UI (MUI)                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    │ HTTP/HTTPS                            │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BACKEND (Node.js)                                │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    API REST                                 │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │ GET /api/   │ │ POST /api/  │ │ PUT /api/   │           │   │   │
│  │  │  │ prospects   │ │ prospects   │ │ prospects/  │           │   │   │
│  │  │  │ GET /api/   │ │ POST /api/  │ │ :id         │           │   │   │
│  │  │  │ dashboard/  │ │ upload      │ │ DELETE /api/│           │   │   │
│  │  │  │ stats       │ │             │ │ prospects/  │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ │ :id         │           │   │   │
│  │  │                                  └─────────────┘           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  Port: 3003                                                        │   │
│  │  Framework: Node.js + Express + TypeScript                         │   │
│  │  ORM: pg (node-postgres)                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    │ PostgreSQL Protocol                   │
│                                    ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DATABASE (PostgreSQL)                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    TABLE: prospects                          │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │     id      │ │    nom      │ │   prenom    │           │   │   │
│  │  │  │   (SERIAL)  │ │ (VARCHAR)   │ │ (VARCHAR)   │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │    email    │ │  telephone  │ │  entreprise │           │   │   │
│  │  │  │ (VARCHAR)   │ │ (VARCHAR)   │ │ (VARCHAR)   │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │     role    │ │    ville    │ │   region    │           │   │   │
│  │  │  │ (VARCHAR)   │ │ (VARCHAR)   │ │ (VARCHAR)   │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │   statut    │ │   linkedin  │ │   interets  │           │   │   │
│  │  │  │ (VARCHAR)   │ │   (TEXT)    │ │   (TEXT)    │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │   │
│  │  │  │ historique  │ │date_creation│ │etape_suivi │           │   │   │
│  │  │  │   (TEXT)    │ │(TIMESTAMP)  │ │ (VARCHAR)  │           │   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  Database: crm_db                                                   │   │
│  │  User: egx                                                          │   │
│  │  Password: Luxembourg1978                                           │   │
│  │  Port: 5432                                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Technique Détaillée

### Frontend (React.js)
- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **Port** : 3002 (développement)
- **UI Library** : Material-UI (MUI)
- **Routing** : React Router
- **State Management** : React Hooks (useState, useEffect)
- **HTTP Client** : Fetch API

### Backend (Node.js)
- **Runtime** : Node.js
- **Framework** : Express.js
- **Language** : TypeScript
- **Port** : 3003
- **Database Driver** : pg (node-postgres)
- **Environment** : dotenv pour les variables d'environnement

### API Endpoints
```
GET    /api/prospects          - Récupérer tous les prospects
POST   /api/prospects          - Créer un nouveau prospect
GET    /api/prospects/:id      - Récupérer un prospect spécifique
PUT    /api/prospects/:id      - Mettre à jour un prospect
DELETE /api/prospects/:id      - Supprimer un prospect
GET    /api/dashboard/stats    - Statistiques du dashboard
POST   /api/upload             - Upload de fichiers
```

### Database (PostgreSQL)
- **Version** : PostgreSQL
- **Database** : crm_db
- **User** : egx
- **Password** : Luxembourg1978
- **Host** : localhost
- **Port** : 5432

### Contacts Actuels
1. **Daniel MILANO**
   - Email : daniel.milano@houseofentrepreneurship.lu
   - Entreprise : House of Entrepreneurship
   - Ville : LUXEMBOURG
   - Région : Centre

2. **Hélène RODRIGUEZ**
   - Téléphone : 00352268046901
   - Entreprise : Comptable
   - Ville : LUXEMBOURG
   - Région : Centre

## 🚀 Démarrage du Projet

### Backend
```bash
cd backend
npm install
npm run dev
# Serveur accessible sur http://localhost:3003
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Interface accessible sur http://localhost:3002
```

## 📁 Structure des Fichiers
```
CRM/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProspectsList.tsx
│   │   │   ├── ProspectsMap.tsx
│   │   │   └── ProspectForm.tsx
│   │   ├── components/
│   │   └── types/
│   └── package.json
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── .env
│   └── package.json
└── README.md
```

## 🔒 Sécurité
- Variables d'environnement dans `.env` (non commitées)
- Validation des données côté serveur
- Protection contre les injections SQL (pg driver)
- CORS configuré pour le développement

## 📊 Fonctionnalités
- ✅ Gestion des prospects (CRUD)
- ✅ Carte géographique des prospects
- ✅ Filtres et recherche
- ✅ Interface responsive
- ✅ Base de données PostgreSQL
- ✅ API REST complète
