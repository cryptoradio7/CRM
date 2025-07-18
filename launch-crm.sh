#!/bin/bash

# Définir le répertoire de base
CRM_DIR="/home/egx/Bureau/APPS/CRM"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Démarrage de l'application CRM...${NC}"

# Fonction pour arrêter tous les processus
cleanup() {
    echo -e "${YELLOW}🛑 Arrêt des processus...${NC}"
    pkill -f "ts-node" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "node.*backend" 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Aller dans le répertoire CRM
cd "$CRM_DIR"

# Vérifier si les dépendances sont installées
echo -e "${BLUE}📦 Vérification des dépendances...${NC}"

# Backend
if [ ! -d "$CRM_DIR/backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
    cd "$CRM_DIR/backend"
    npm install
    cd "$CRM_DIR"
fi

# Frontend
if [ ! -d "$CRM_DIR/frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
    cd "$CRM_DIR/frontend"
    npm install
    cd "$CRM_DIR"
fi

# Vérifier si le backend est déjà en cours d'exécution
if curl -s http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend déjà en cours d'exécution sur le port 3003${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${GREEN}🔧 Démarrage du backend...${NC}"
    cd "$CRM_DIR/backend"
    npm run dev &
    BACKEND_PID=$!
    cd "$CRM_DIR"
    BACKEND_RUNNING=false
    
    # Attendre que le backend démarre
    echo -e "${BLUE}⏳ Attente du démarrage du backend...${NC}"
    sleep 5

    # Vérifier si le backend est démarré
    if ! curl -s http://localhost:3003 > /dev/null; then
        echo -e "${YELLOW}⏳ Le backend prend plus de temps à démarrer, attente supplémentaire...${NC}"
        sleep 5
    fi
fi

# Vérifier si le frontend est déjà en cours d'exécution
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend déjà en cours d'exécution sur le port 3002${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${GREEN}🎨 Démarrage du frontend...${NC}"
    cd "$CRM_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!
    cd "$CRM_DIR"
    FRONTEND_RUNNING=false
    
    # Attendre que le frontend démarre
    echo -e "${BLUE}⏳ Attente du démarrage du frontend...${NC}"
    sleep 3
fi

# Ouvrir le navigateur
echo -e "${GREEN}🌐 Ouverture du navigateur...${NC}"
sleep 2

# Essayer différents navigateurs
if command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:3002 &
elif command -v firefox &> /dev/null; then
    firefox http://localhost:3002 &
elif command -v chromium-browser &> /dev/null; then
    chromium-browser http://localhost:3002 &
else
    xdg-open http://localhost:3002 &
fi

echo -e "${GREEN}✅ Application CRM démarrée avec succès!${NC}"
echo -e "${BLUE}📊 Backend: ${GREEN}http://localhost:3003${NC}"
echo -e "${BLUE}🎨 Frontend: ${GREEN}http://localhost:3002${NC}"
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter l'application${NC}"

# Si les services étaient déjà en cours d'exécution, ne pas attendre
if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${BLUE}ℹ️  Les services étaient déjà en cours d'exécution. Appuyez sur Ctrl+C pour arrêter.${NC}"
    # Attendre indéfiniment
    while true; do
        sleep 1
    done
else
    # Attendre que les processus se terminent
    wait
fi 