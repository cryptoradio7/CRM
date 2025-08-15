#!/bin/bash

# =====================================================
# SCRIPT DE NETTOYAGE ET RÉINSTALLATION CRM
# =====================================================
# Ce script nettoie les node_modules et réinstalle les dépendances
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

# Obtenir le répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "Nettoyage et réinstallation CRM"
log_info "=============================="

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  clean     - Supprimer tous les node_modules"
    echo "  install   - Réinstaller toutes les dépendances"
    echo "  full      - Nettoyer + réinstaller (recommandé)"
    echo "  size      - Afficher la taille des node_modules"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 full      # Nettoyer et réinstaller"
    echo "  $0 size      # Voir la taille actuelle"
}

# Fonction pour afficher la taille des node_modules
show_size() {
    log_info "Taille des node_modules :"
    echo ""
    
    if [ -d "$SCRIPT_DIR/node_modules" ]; then
        ROOT_SIZE=$(du -sh "$SCRIPT_DIR/node_modules" 2>/dev/null | cut -f1)
        echo "  📦 Root: $ROOT_SIZE"
    else
        echo "  📦 Root: Non installé"
    fi
    
    if [ -d "$SCRIPT_DIR/frontend/node_modules" ]; then
        FRONTEND_SIZE=$(du -sh "$SCRIPT_DIR/frontend/node_modules" 2>/dev/null | cut -f1)
        echo "  🎨 Frontend: $FRONTEND_SIZE"
    else
        echo "  🎨 Frontend: Non installé"
    fi
    
    if [ -d "$SCRIPT_DIR/backend/node_modules" ]; then
        BACKEND_SIZE=$(du -sh "$SCRIPT_DIR/backend/node_modules" 2>/dev/null | cut -f1)
        echo "  🔧 Backend: $BACKEND_SIZE"
    else
        echo "  🔧 Backend: Non installé"
    fi
}

# Fonction pour nettoyer les node_modules
clean_node_modules() {
    log_info "Suppression des node_modules..."
    
    cd "$SCRIPT_DIR"
    
    # Supprimer les node_modules
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        log_success "✅ node_modules root supprimé"
    fi
    
    if [ -d "frontend/node_modules" ]; then
        rm -rf frontend/node_modules
        log_success "✅ node_modules frontend supprimé"
    fi
    
    if [ -d "backend/node_modules" ]; then
        rm -rf backend/node_modules
        log_success "✅ node_modules backend supprimé"
    fi
    
    log_success "Nettoyage terminé !"
}

# Fonction pour installer les dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    cd "$SCRIPT_DIR"
    
    # Installer les dépendances root
    if [ -f "package.json" ]; then
        log_info "Installation des dépendances root..."
        npm install
        log_success "✅ Dépendances root installées"
    fi
    
    # Installer les dépendances frontend
    if [ -f "frontend/package.json" ]; then
        log_info "Installation des dépendances frontend..."
        cd frontend
        npm install
        cd "$SCRIPT_DIR"
        log_success "✅ Dépendances frontend installées"
    fi
    
    # Installer les dépendances backend
    if [ -f "backend/package.json" ]; then
        log_info "Installation des dépendances backend..."
        cd backend
        npm install
        cd "$SCRIPT_DIR"
        log_success "✅ Dépendances backend installées"
    fi
    
    log_success "Installation terminée !"
}

# Script principal
main() {
    # Traiter les arguments
    case "${1:-help}" in
        "clean")
            clean_node_modules
            ;;
        "install")
            install_dependencies
            ;;
        "full")
            clean_node_modules
            install_dependencies
            ;;
        "size")
            show_size
            ;;
        "help"|*)
            show_help
            ;;
    esac
    
    log_success "Script terminé"
}

# Exécuter le script principal
main "$@"


