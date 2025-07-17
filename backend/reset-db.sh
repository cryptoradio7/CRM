#!/bin/bash

echo "🔄 Réinitialisation de la base de données CRM..."

# Variables de configuration (ajustez selon votre configuration)
DB_NAME="crm_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Demander le mot de passe PostgreSQL
echo "Entrez le mot de passe PostgreSQL pour l'utilisateur $DB_USER:"
read -s DB_PASSWORD

# Créer la base de données si elle n'existe pas
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Base de données $DB_NAME existe déjà ou erreur de création"

# Exécuter le script SQL
echo "📊 Application du schéma de base de données..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de données réinitialisée avec succès!"
    echo "📋 Données de test insérées"
else
    echo "❌ Erreur lors de la réinitialisation de la base de données"
    exit 1
fi 