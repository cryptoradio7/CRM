#!/bin/bash

echo "📝 Création du fichier .env..."

cat > .env << EOF
# Configuration de la base de données PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=crm_db
DB_PASSWORD=
DB_PORT=5432

# Configuration du serveur
PORT=3001
NODE_ENV=development
EOF

echo "✅ Fichier .env créé !"
echo "📋 Contenu :"
cat .env 