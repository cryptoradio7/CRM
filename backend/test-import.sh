#!/bin/bash

# Script de test pour l'import Lemlist
# Usage: ./test-import.sh

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 TEST D'IMPORT LEMLIST - 100 CONTACTS${NC}"
echo "================================================"

# Vérifier que le fichier JSON existe
if [ ! -f "../all_lemlist_contacts.json" ]; then
    echo -e "${RED}❌ Fichier all_lemlist_contacts.json non trouvé${NC}"
    echo "Placez le fichier dans le répertoire parent du backend"
    exit 1
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
    npm install
fi

# Créer le schéma de base de données
echo -e "${BLUE}🗄️  Création du schéma de base de données...${NC}"
PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -f schema_crm_v2.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schéma créé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création du schéma${NC}"
    exit 1
fi

# Exécuter l'import
echo -e "${BLUE}📥 Début de l'import des données...${NC}"
node import-lemlist-test.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Import terminé avec succès !${NC}"
    echo ""
    echo -e "${YELLOW}📊 Vérification des données importées :${NC}"
    
    # Vérifier le nombre de contacts
    CONTACTS_COUNT=$(PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -t -c "SELECT COUNT(*) FROM contacts;")
    echo -e "👥 Contacts importés : ${GREEN}$CONTACTS_COUNT${NC}"
    
    # Vérifier le nombre d'entreprises
    COMPANIES_COUNT=$(PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -t -c "SELECT COUNT(*) FROM companies;")
    echo -e "🏢 Entreprises importées : ${GREEN}$COMPANIES_COUNT${NC}"
    
    # Vérifier le nombre d'expériences
    EXPERIENCES_COUNT=$(PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -t -c "SELECT COUNT(*) FROM experiences;")
    echo -e "💼 Expériences importées : ${GREEN}$EXPERIENCES_COUNT${NC}"
    
    # Vérifier le nombre de langues
    LANGUAGES_COUNT=$(PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -t -c "SELECT COUNT(*) FROM contact_languages;")
    echo -e "🗣️  Langues importées : ${GREEN}$LANGUAGES_COUNT${NC}"
    
    # Vérifier le nombre de compétences
    SKILLS_COUNT=$(PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -t -c "SELECT COUNT(*) FROM contact_skills;")
    echo -e "🎯 Compétences importées : ${GREEN}$SKILLS_COUNT${NC}"
    
    echo ""
    echo -e "${GREEN}🎉 Test d'import réussi !${NC}"
    echo -e "${BLUE}💡 Vous pouvez maintenant tester l'interface utilisateur${NC}"
    echo -e "${BLUE}🌐 Frontend : http://localhost:3002${NC}"
    echo -e "${BLUE}🔧 Backend : http://localhost:3003${NC}"
    
else
    echo -e "${RED}❌ Erreur lors de l'import${NC}"
    exit 1
fi
