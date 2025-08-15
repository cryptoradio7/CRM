#!/bin/bash

# =====================================================
# SCRIPT D'APPLICATION DES OPTIMISATIONS CRM
# =====================================================

echo "🚀 Application des optimisations de performance..."

# 1. Vérifier la connexion à la base de données
echo "📊 Vérification de la connexion à PostgreSQL..."
if ! psql -U postgres -d crm_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Impossible de se connecter à la base de données"
    echo "💡 Essayez: sudo -u postgres psql -d crm_db -f optimize_performance.sql"
    exit 1
fi

# 2. Appliquer les optimisations
echo "🔧 Application des optimisations SQL..."
psql -U postgres -d crm_db -f optimize_performance.sql

# 3. Vérifier les performances
echo "📈 Vérification des performances..."
psql -U postgres -d crm_db -c "
SELECT 
  'Table prospects' as table_name,
  n_live_tup as total_rows,
  n_dead_tup as dead_rows,
  round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2) as dead_percentage
FROM pg_stat_user_tables 
WHERE tablename = 'prospects';
"

# 4. Redémarrer le serveur avec les nouvelles optimisations
echo "🔄 Redémarrage du serveur..."
cd /home/egx/Bureau/APPS/CRM/backend
npm run dev &

echo "✅ Optimisations appliquées avec succès!"
echo "📊 Le dashboard devrait maintenant être beaucoup plus rapide"
echo "🔍 Vérifiez les performances sur: http://localhost:3003/api/dashboard/stats"
