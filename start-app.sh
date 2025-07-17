#!/bin/bash

echo "🚀 Démarrage de l'application CRM WIN ZE GAME..."

# Fonction pour arrêter tous les processus
cleanup() {
    echo "🛑 Arrêt des processus..."
    pkill -f "ts-node" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Démarrer le backend
echo "🔧 Démarrage du backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Attendre un peu que le backend démarre
sleep 3

# Démarrer le frontend
echo "🎨 Démarrage du frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Application démarrée!"
echo "📊 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter l'application"

# Attendre que les processus se terminent
wait $BACKEND_PID $FRONTEND_PID 