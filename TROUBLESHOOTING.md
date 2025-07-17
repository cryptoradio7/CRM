# 🔧 Guide de Dépannage - CRM WIN ZE GAME

## Problèmes Courants et Solutions

### 1. Erreur "column created_at does not exist"

**Problème :** La base de données n'a pas le bon schéma.

**Solution :**
```bash
cd backend
./reset-db.sh
```

### 2. Erreur "Failed to resolve import Header"

**Problème :** Le fichier Header.tsx est manquant ou corrompu.

**Solution :** Le fichier existe déjà, redémarrez le serveur frontend :
```bash
cd frontend
pkill -f "vite"
npm run dev
```

### 3. Erreur "Could not read package.json"

**Problème :** Vous essayez de lancer npm depuis le mauvais répertoire.

**Solution :** Utilisez les scripts de démarrage :
```bash
# Pour démarrer l'application complète
./start-app.sh

# Ou séparément :
cd backend && npm run dev
cd frontend && npm run dev
```

### 4. Problème de connexion à PostgreSQL

**Problème :** PostgreSQL n'est pas démarré ou mal configuré.

**Solution :**
```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql

# Vérifier le statut
sudo systemctl status postgresql

# Créer l'utilisateur si nécessaire
sudo -u postgres createuser --interactive
```

### 5. Ports déjà utilisés

**Problème :** Les ports 3001 ou 5173 sont déjà utilisés.

**Solution :**
```bash
# Tuer les processus existants
pkill -f "ts-node"
pkill -f "vite"

# Ou changer les ports dans les fichiers de configuration
```

## Démarrage Rapide

1. **Réinitialiser la base de données :**
   ```bash
   cd backend
   ./reset-db.sh
   ```

2. **Démarrer l'application :**
   ```bash
   ./start-app.sh
   ```

3. **Accéder à l'application :**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Structure du Projet

```
CRM/
├── backend/          # Serveur Node.js + Express
├── frontend/         # Application React + TypeScript
├── start-app.sh      # Script de démarrage
└── TROUBLESHOOTING.md
```

## Commandes Utiles

```bash
# Arrêter tous les processus
pkill -f "ts-node"
pkill -f "vite"

# Vérifier les processus en cours
ps aux | grep -E "(ts-node|vite)"

# Nettoyer les modules node
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
``` 