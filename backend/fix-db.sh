#!/bin/bash

echo "🔧 Correction de la base de données CRM..."
echo "📊 Ajout de la colonne region et mise à jour des données..."

# Variables de base de données (à adapter selon votre configuration)
DB_USER="postgres"
DB_NAME="crm_db"
DB_HOST="localhost"
DB_PORT="5432"

# Exécuter le script SQL
echo "🚀 Exécution du script SQL..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f fix-database.sql

if [ $? -eq 0 ]; then
    echo "✅ Correction terminée avec succès !"
    echo "📊 Vérification des données mises à jour..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, nom, prenom, ville, region FROM prospects;"
else
    echo "❌ Erreur lors de la correction de la base de données"
    exit 1
fi 