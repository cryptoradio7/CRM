#!/bin/bash

echo "🔄 Mise à jour de la base de données CRM..."

# Vérifier si la table existe
echo "📊 Vérification de la structure actuelle..."
sudo -u postgres psql -d crm_db -c "\d prospects" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Table prospects existe"
    
    # Vérifier si la colonne created_at existe
    echo "🔍 Vérification de la colonne created_at..."
    sudo -u postgres psql -d crm_db -c "SELECT column_name FROM information_schema.columns WHERE table_name='prospects' AND column_name='created_at';" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Colonne created_at existe déjà"
    else
        echo "📝 Ajout de la colonne created_at..."
        sudo -u postgres psql -d crm_db -c "ALTER TABLE prospects ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
        sudo -u postgres psql -d crm_db -c "UPDATE prospects SET created_at = date_creation WHERE created_at IS NULL;"
    fi
    
    # Vérifier si la colonne region existe
    echo "🔍 Vérification de la colonne region..."
    sudo -u postgres psql -d crm_db -c "SELECT column_name FROM information_schema.columns WHERE table_name='prospects' AND column_name='region';" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Colonne region existe déjà"
    else
        echo "📝 Ajout de la colonne region..."
        sudo -u postgres psql -d crm_db -c "ALTER TABLE prospects ADD COLUMN region VARCHAR(100);"
        sudo -u postgres psql -d crm_db -c "UPDATE prospects SET region = ville WHERE region IS NULL;"
    fi
    
    echo "✅ Mise à jour terminée !"
    echo "📊 Structure finale :"
    sudo -u postgres psql -d crm_db -c "\d prospects"
    
else
    echo "❌ Table prospects n'existe pas, création complète..."
    sudo -u postgres psql -d crm_db -f database.sql
fi 