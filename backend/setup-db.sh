#!/bin/bash

echo "🔄 Configuration de la base de données CRM..."

# Variables de configuration
DB_NAME="crm_db"
DB_USER="postgres"

# Créer la base de données si elle n'existe pas
echo "📊 Création de la base de données..."
sudo -u postgres createdb $DB_NAME 2>/dev/null || echo "Base de données $DB_NAME existe déjà"

# Exécuter le script SQL
echo "📋 Application du schéma..."
sudo -u postgres psql -d $DB_NAME -f database.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de données configurée avec succès!"
    echo "📊 Données de test insérées"
else
    echo "❌ Erreur lors de la configuration"
    exit 1
fi 