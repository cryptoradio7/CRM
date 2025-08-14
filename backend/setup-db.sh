#!/bin/bash

# =====================================================
# SCRIPT POUR BASE DE DONNÉES AVEC UTILISATEUR POSTGRES
# =====================================================
# Utilise l'utilisateur postgres par défaut
# =====================================================

# Configuration
DB_NAME="crm_db"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="egx"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Script CRM - Utilisateur postgres"
echo "================================================"

# Vérifier PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} PostgreSQL n'est pas installé"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} PostgreSQL détecté"

# Fonction pour créer la base de données
create_db() {
    echo -e "${BLUE}[INFO]${NC} Création de la base de données..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo -e "${BLUE}[INFO]${NC} Base de données existe déjà"
}

# Fonction pour exécuter le schéma
setup_schema() {
    echo -e "${BLUE}[INFO]${NC} Configuration du schéma..."
    if [ -f "schema_complet.sql" ]; then
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema_complet.sql
        echo -e "${GREEN}[SUCCESS]${NC} Schéma configuré"
    else
        echo -e "${RED}[ERROR]${NC} Fichier schema_complet.sql non trouvé"
        exit 1
    fi
}

# Fonction pour migrer
migrate_db() {
    echo -e "${BLUE}[INFO]${NC} Migration de la base de données..."
    if [ -f "migration_unifiee.sql" ]; then
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_unifiee.sql
        echo -e "${GREEN}[SUCCESS]${NC} Migration terminée"
    else
        echo -e "${RED}[ERROR]${NC} Fichier migration_unifiee.sql non trouvé"
        exit 1
    fi
}

# Fonction pour tester
test_db() {
    echo -e "${BLUE}[INFO]${NC} Test de connexion..."
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}[SUCCESS]${NC} Connexion réussie"
    else
        echo -e "${RED}[ERROR]${NC} Connexion échouée"
        exit 1
    fi
}

# Fonction pour afficher les stats
show_stats() {
    echo -e "${BLUE}[INFO]${NC} Statistiques :"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
    SELECT 
        'Total prospects' as metric, COUNT(*) as value
    FROM prospects
    UNION ALL
    SELECT 
        'Clients' as metric, COUNT(*) as value
    FROM prospects 
    WHERE statut = 'Client'
    UNION ALL
    SELECT 
        'Prospects à contacter' as metric, COUNT(*) as value
    FROM prospects 
    WHERE statut = 'Prospect à contacter';"
}

# Traitement des arguments
case "${1:-help}" in
    "nouveau")
        create_db
        setup_schema
        test_db
        show_stats
        ;;
    "migration")
        test_db
        migrate_db
        show_stats
        ;;
    "test")
        test_db
        ;;
    "stats")
        test_db
        show_stats
        ;;
    "help"|*)
        echo "Usage: $0 [COMMANDE]"
        echo ""
        echo "Commandes :"
        echo "  nouveau   - Nouvelle installation"
        echo "  migration - Migration existante"
        echo "  test      - Test connexion"
        echo "  stats     - Afficher statistiques"
        echo "  help      - Cette aide"
        echo ""
        echo "Note : Utilise l'utilisateur 'postgres' par défaut"
        ;;
esac

echo -e "${GREEN}[SUCCESS]${NC} Script terminé"
