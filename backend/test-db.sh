#!/bin/bash

echo "🔍 Test de connexion à la base de données..."

# Test 1: Connexion directe sans mot de passe
echo "📊 Test 1: Connexion directe..."
psql -h localhost -U postgres -d crm_db -c "SELECT version();" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Connexion directe réussie !"
    echo "📋 Structure de la table prospects :"
    psql -h localhost -U postgres -d crm_db -c "\d prospects"
    echo ""
    echo "📊 Données actuelles :"
    psql -h localhost -U postgres -d crm_db -c "SELECT id, nom, prenom, email FROM prospects LIMIT 3;"
else
    echo "❌ Connexion directe échouée"
fi

echo ""
echo "🔍 Test 2: Connexion avec sudo..."
sudo -u postgres psql -d crm_db -c "SELECT version();" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Connexion sudo réussie !"
    echo "📋 Structure de la table prospects :"
    sudo -u postgres psql -d crm_db -c "\d prospects"
else
    echo "❌ Connexion sudo échouée"
fi 