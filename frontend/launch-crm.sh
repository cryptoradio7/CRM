#!/bin/bash

# Script de lancement pour CRM
cd /home/egx/Bureau/APPS/CRM/frontend

# Vérifier si node_modules existe, sinon installer les dépendances
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
fi

# Lancer l'application en mode développement
echo "Lancement de CRM sur le port 3002..."

# Lancer Vite en arrière-plan
npm run dev &
VITE_PID=$!

# Attendre que le serveur soit prêt
echo "Attente du démarrage..."
sleep 5

# Vérifier si le serveur est prêt et ouvrir le navigateur
if curl -s "http://localhost:3002" > /dev/null 2>&1; then
    echo "CRM est prêt sur http://localhost:3002"
    echo "Ouverture du navigateur..."
    xdg-open "http://localhost:3002"
else
    echo "Erreur: CRM n'a pas démarré correctement"
fi

# Attendre que Vite se termine
wait $VITE_PID 