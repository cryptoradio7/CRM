#!/bin/bash

# =====================================================
# SCRIPT DE NETTOYAGE COMPLET - CRM
# =====================================================
# Ce script supprime TOUS les anciens fichiers remplacés
# =====================================================

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  sauvegarder  - Sauvegarder tous les anciens fichiers"
    echo "  nettoyer     - Supprimer tous les anciens fichiers"
    echo "  liste        - Lister tous les fichiers qui seront supprimés"
    echo "  help         - Afficher cette aide"
    echo ""
    echo "⚠️  ATTENTION : Ce script supprime définitivement des fichiers !"
    echo "   Assurez-vous d'avoir testé les nouveaux scripts avant de nettoyer."
}

# Fonction pour lister tous les anciens fichiers
list_all_old_files() {
    log_info "Fichiers qui seront supprimés :"
    echo ""
    
    # Fichiers SQL à supprimer
    OLD_SQL_FILES=(
        "add-etape-suivi-column.sql"
        "add-region-column.sql"
        "add-type-entreprise-column.sql"
        "fix-database.sql"
        "rename-prospects-status.sql"
        "update-client-status.sql"
        "update-client-to-clients.sql"
        "update-status-names.sql"
        "database.sql"
    )
    
    # Scripts bash à supprimer
    OLD_BASH_SCRIPTS=(
        "create-env.sh"
        "fix-db.sh"
        "reset-db.sh"
        "test-db.sh"
        "update-db.sh"
    )
    
    echo "📄 Fichiers SQL :"
    for file in "${OLD_SQL_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "  ❌ $file"
        else
            echo "  ✅ $file (déjà supprimé)"
        fi
    done
    
    echo ""
    echo "🔧 Scripts bash :"
    for script in "${OLD_BASH_SCRIPTS[@]}"; do
        if [ -f "$script" ]; then
            echo "  ❌ $script"
        else
            echo "  ✅ $script (déjà supprimé)"
        fi
    done
    
    echo ""
    log_info "Fichiers conservés :"
    echo "  ✅ schema_complet.sql (nouveau)"
    echo "  ✅ migration_unifiee.sql (nouveau)"
    echo "  ✅ setup-db-postgres.sh (nouveau - recommandé)"
    echo "  ✅ setup-db-simple.sh (nouveau)"
    echo "  ✅ setup-db-unifie.sh (nouveau)"
    echo "  ✅ README_OPTIMISATION.md (documentation)"
    echo "  ✅ nettoyer-*.sh (utilitaires)"
}

# Fonction pour sauvegarder tous les anciens fichiers
backup_all_old_files() {
    log_info "Sauvegarde de tous les anciens fichiers..."
    
    BACKUP_DIR="backup_complet_$(date +%Y%m%d_%H%M%S)"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Fichiers SQL à sauvegarder
    OLD_SQL_FILES=(
        "add-etape-suivi-column.sql"
        "add-region-column.sql"
        "add-type-entreprise-column.sql"
        "fix-database.sql"
        "rename-prospects-status.sql"
        "update-client-status.sql"
        "update-client-to-clients.sql"
        "update-status-names.sql"
        "database.sql"
    )
    
    # Scripts bash à sauvegarder
    OLD_BASH_SCRIPTS=(
        "create-env.sh"
        "fix-db.sh"
        "reset-db.sh"
        "test-db.sh"
        "update-db.sh"
    )
    
    BACKUP_COUNT=0
    
    # Sauvegarder les fichiers SQL
    for file in "${OLD_SQL_FILES[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            log_success "Sauvegardé : $file"
            ((BACKUP_COUNT++))
        fi
    done
    
    # Sauvegarder les scripts bash
    for script in "${OLD_BASH_SCRIPTS[@]}"; do
        if [ -f "$script" ]; then
            cp "$script" "$BACKUP_DIR/"
            log_success "Sauvegardé : $script"
            ((BACKUP_COUNT++))
        fi
    done
    
    if [ $BACKUP_COUNT -gt 0 ]; then
        log_success "Sauvegarde terminée dans : $BACKUP_DIR"
        log_info "Nombre de fichiers sauvegardés : $BACKUP_COUNT"
    else
        log_warning "Aucun fichier à sauvegarder"
    fi
}

# Fonction pour nettoyer tous les anciens fichiers
cleanup_all_old_files() {
    log_warning "⚠️  ATTENTION : Cette action est irréversible !"
    echo ""
    read -p "Êtes-vous sûr de vouloir supprimer TOUS les anciens fichiers ? (oui/non) : " confirm
    
    if [[ $confirm =~ ^[Oo][Uu][Ii]$ ]]; then
        log_info "Suppression de tous les anciens fichiers..."
        
        # Fichiers SQL à supprimer
        OLD_SQL_FILES=(
            "add-etape-suivi-column.sql"
            "add-region-column.sql"
            "add-type-entreprise-column.sql"
            "fix-database.sql"
            "rename-prospects-status.sql"
            "update-client-status.sql"
            "update-client-to-clients.sql"
            "update-status-names.sql"
            "database.sql"
        )
        
        # Scripts bash à supprimer
        OLD_BASH_SCRIPTS=(
            "create-env.sh"
            "fix-db.sh"
            "reset-db.sh"
            "test-db.sh"
            "update-db.sh"
        )
        
        DELETED_COUNT=0
        
        # Supprimer les fichiers SQL
        for file in "${OLD_SQL_FILES[@]}"; do
            if [ -f "$file" ]; then
                rm "$file"
                log_success "Supprimé : $file"
                ((DELETED_COUNT++))
            fi
        done
        
        # Supprimer les scripts bash
        for script in "${OLD_BASH_SCRIPTS[@]}"; do
            if [ -f "$script" ]; then
                rm "$script"
                log_success "Supprimé : $script"
                ((DELETED_COUNT++))
            fi
        done
        
        log_success "Nettoyage complet terminé !"
        log_info "Nombre de fichiers supprimés : $DELETED_COUNT"
        
        echo ""
        log_info "Fichiers restants :"
        ls -la *.sql *.sh *.md 2>/dev/null || echo "  Aucun fichier restant"
        
    else
        log_info "Nettoyage annulé"
    fi
}

# Script principal
main() {
    log_info "Script de nettoyage complet CRM"
    log_info "==============================="
    
    # Traiter les arguments
    case "${1:-help}" in
        "sauvegarder")
            backup_all_old_files
            ;;
        "nettoyer")
            cleanup_all_old_files
            ;;
        "liste")
            list_all_old_files
            ;;
        "help"|*)
            show_help
            ;;
    esac
    
    log_success "Script terminé"
}

# Exécuter le script principal
main "$@"
