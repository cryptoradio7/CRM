import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as DatabaseIcon,
  Api as ApiIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  description: string;
}

interface ApiEndpoint {
  method: string;
  path: string;
  fullUrl: string;
  description: string;
  parameters?: string[];
  response: string;
  exampleRequest?: string;
  exampleResponse?: string;
  useCase: string;
}

const SystemDashboard = () => {
  const [loading, setLoading] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Database schema definition
  const databaseColumns: DatabaseColumn[] = [
    {
      name: 'id',
      type: 'SERIAL PRIMARY KEY',
      nullable: false,
      default: 'AUTO_INCREMENT',
      description: 'Identifiant unique du prospect'
    },
    {
      name: 'nom',
      type: 'VARCHAR(255)',
      nullable: false,
      default: null,
      description: 'Nom de famille du prospect'
    },
    {
      name: 'prenom',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Prénom du prospect'
    },
    {
      name: 'email',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Adresse email du prospect'
    },
    {
      name: 'telephone',
      type: 'VARCHAR(50)',
      nullable: true,
      default: null,
      description: 'Numéro de téléphone'
    },
    {
      name: 'entreprise',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom de l\'entreprise'
    },
    {
      name: 'role',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Poste occupé dans l\'entreprise'
    },
    {
      name: 'ville',
      type: 'VARCHAR(100)',
      nullable: true,
      default: null,
      description: 'Ville de résidence'
    },
    {
      name: 'region',
      type: 'VARCHAR(100)',
      nullable: true,
      default: null,
      description: 'Région (calculée automatiquement)'
    },
    {
      name: 'type_entreprise',
      type: 'VARCHAR(100)',
      nullable: true,
      default: null,
      description: 'Type d\'entreprise (PME, Startup, etc.)'
    },
    {
      name: 'etape_suivi',
      type: 'VARCHAR(32)',
      nullable: true,
      default: "'à contacter'",
      description: 'Étape de suivi actuelle'
    },
    {
      name: 'linkedin',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'URL du profil LinkedIn'
    },
    {
      name: 'interets',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'Centres d\'intérêt du prospect'
    },
    {
      name: 'historique',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'Historique des interactions'
    },
    {
      name: 'date_creation',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de création du prospect'
    }
  ];

  // API endpoints definition with full URLs and detailed examples
  const apiEndpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/',
      fullUrl: 'http://localhost:3003/',
      description: 'Vérification de l\'état de l\'API - Health Check',
      response: '{ "message": "API CRM Backend - Fonctionnel!" }',
      exampleRequest: 'curl http://localhost:3003/',
      exampleResponse: '{"message":"API CRM Backend - Fonctionnel!"}',
      useCase: 'Vérifier que l\'API est en ligne et fonctionnelle'
    },
    {
      method: 'GET',
      path: '/api/prospects',
      fullUrl: 'http://localhost:3003/api/prospects',
      description: 'Récupérer tous les prospects avec pagination et tri par date de création',
      parameters: [
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'éléments par page (défaut: 20)'
      ],
      response: 'Object avec prospects[] et pagination{} - Liste paginée des prospects',
      exampleRequest: 'curl "http://localhost:3003/api/prospects?page=1&limit=20"',
      exampleResponse: '{"prospects":[{"id":1,"nom":"Dupont",...}],"pagination":{"page":1,"limit":20,"totalCount":50,"totalPages":3}}',
      useCase: 'Charger la liste paginée des prospects dans l\'interface'
    },
    {
      method: 'GET',
      path: '/api/prospects/filter',
      fullUrl: 'http://localhost:3003/api/prospects/filter',
      description: 'Filtrer les prospects avec critères multiples et pagination avancée',
      parameters: [
        'categorie_poste (optional) - Filtrer par catégorie de poste',
        'taille_entreprise (optional) - Filtrer par taille d\'entreprise',
        'secteur (optional) - Filtrer par secteur d\'activité',
        'pays (optional) - Filtrer par pays',
        'etape_suivi (optional) - Filtrer par étape de suivi',
        'search (optional) - Recherche textuelle globale (nom, entreprise, email)',
        'nom_complet (optional) - Recherche spécifique par nom complet',
        'libelle_poste (optional) - Recherche par libellé de poste',
        'entreprise (optional) - Recherche par entreprise',
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'éléments par page (défaut: 20)'
      ],
      response: 'Object avec prospects[], pagination{} et filters{} - Résultats filtrés et paginés',
      exampleRequest: 'curl "http://localhost:3003/api/prospects/filter?categorie_poste=Directeur&taille_entreprise=PME&search=tech"',
      exampleResponse: '{"prospects":[{"id":1,"nom":"Dupont",...}],"pagination":{"page":1,"limit":20,"totalCount":5},"filters":{"categorie_poste":"Directeur","taille_entreprise":"PME","search":"tech"}}',
      useCase: 'Filtrage avancé des prospects avec critères multiples et recherche textuelle'
    },
    {
      method: 'GET',
      path: '/api/prospects/:id',
      fullUrl: 'http://localhost:3003/api/prospects/1',
      description: 'Récupérer un prospect spécifique par son ID',
      parameters: ['id (number) - ID unique du prospect'],
      response: 'Prospect | 404 si non trouvé',
      exampleRequest: 'curl http://localhost:3003/api/prospects/1',
      exampleResponse: '{"id":1,"nom":"Dupont","prenom":"Jean",...}',
      useCase: 'Afficher les détails d\'un prospect pour édition'
    },
    {
      method: 'POST',
      path: '/api/prospects',
      fullUrl: 'http://localhost:3003/api/prospects',
      description: 'Créer un nouveau prospect en base de données',
      parameters: [
        'nom (required) - Nom de famille',
        'prenom (optional) - Prénom',
        'email (optional) - Adresse email',
        'telephone (optional) - Numéro de téléphone',
        'entreprise (optional) - Nom de l\'entreprise',
        'typeEntreprise (optional) - Type d\'entreprise',
        'role (optional) - Poste occupé',
        'ville (optional) - Ville de résidence',
        'linkedin (optional) - URL LinkedIn',
        'interets (optional) - Centres d\'intérêt',
        'historique (optional) - Historique des interactions',
        'etapeSuivi (optional) - Étape de suivi actuelle'
      ],
      response: 'Prospect (201) | 400 si nom manquant | 500 en cas d\'erreur',
      exampleRequest: `curl -X POST http://localhost:3003/api/prospects \\
  -H "Content-Type: application/json" \\
  -d '{"nom":"Dupont","prenom":"Jean","email":"jean@email.com"}'`,
      exampleResponse: '{"id":10,"nom":"Dupont","prenom":"Jean","email":"jean@email.com",...}',
      useCase: 'Ajouter un nouveau prospect via le formulaire'
    },
    {
      method: 'PUT',
      path: '/api/prospects/:id',
      fullUrl: 'http://localhost:3003/api/prospects/1',
      description: 'Mettre à jour un prospect existant',
      parameters: ['id (number) - ID du prospect à modifier', 'Tous les champs du prospect à mettre à jour'],
      response: 'Prospect mis à jour | 404 si non trouvé | 500 en cas d\'erreur',
      exampleRequest: `curl -X PUT http://localhost:3003/api/prospects/1 \\
  -H "Content-Type: application/json" \\
  -d '{"nom":"Dupont","prenom":"Jean-Pierre","etape_suivi":"OK"}'`,
      exampleResponse: '{"id":1,"nom":"Dupont","prenom":"Jean-Pierre","etape_suivi":"OK",...}',
      useCase: 'Modifier les informations d\'un prospect existant'
    },
    {
      method: 'DELETE',
      path: '/api/prospects/:id',
      fullUrl: 'http://localhost:3003/api/prospects/1',
      description: 'Supprimer définitivement un prospect',
      parameters: ['id (number) - ID du prospect à supprimer'],
      response: '{ "message": "Prospect supprimé avec succès" } | 404 si non trouvé | 500 en cas d\'erreur',
      exampleRequest: 'curl -X DELETE http://localhost:3003/api/prospects/1',
      exampleResponse: '{"message":"Prospect supprimé avec succès"}',
      useCase: 'Supprimer un prospect de la base de données'
    },
    {
      method: 'GET',
      path: '/api/dashboard/stats',
      fullUrl: 'http://localhost:3003/api/dashboard/stats',
      description: 'Récupérer les statistiques complètes pour le dashboard',
      response: 'DashboardStats - Métriques, répartitions et tendances',
      exampleRequest: 'curl http://localhost:3003/api/dashboard/stats',
      exampleResponse: '{"metrics":{"totalProspects":25,"activeProspects":15,...},"statusDistribution":[...]}',
      useCase: 'Alimenter le dashboard avec les statistiques en temps réel'
    },
    {
      method: 'GET',
      path: '/api/types-entreprise',
      fullUrl: 'http://localhost:3003/api/types-entreprise',
      description: 'Récupérer la liste des types d\'entreprise disponibles',
      response: 'Array<TypeEntreprise> - Liste des types d\'entreprise actifs',
      exampleRequest: 'curl http://localhost:3003/api/types-entreprise',
      exampleResponse: '[{"id":1,"nom":"PME","actif":true},{"id":2,"nom":"Startup","actif":true}]',
      useCase: 'Peupler les options du formulaire de création de prospect'
    },
    {
      method: 'POST',
      path: '/api/fix-database',
      fullUrl: 'http://localhost:3003/api/fix-database',
      description: 'Corriger et optimiser la base de données (endpoint temporaire)',
      response: '{ "message": "Base de données corrigée avec succès", "data": Array<Prospect> }',
      exampleRequest: 'curl -X POST http://localhost:3003/api/fix-database',
      exampleResponse: '{"message":"Base de données corrigée avec succès","data":[...]}',
      useCase: 'Maintenance et correction des données en cas de problème'
    },
    {
      method: 'GET',
      path: '/api/notes',
      fullUrl: 'http://localhost:3003/api/notes',
      description: 'Récupérer le contenu du bloc notes depuis la base de données',
      response: '{ "content": "string" } - Contenu HTML du bloc notes',
      exampleRequest: 'curl http://localhost:3003/api/notes',
      exampleResponse: '{"content":"<span style=\\"font-size: 12.8px;\\">je suis tres heureux car cela marche</span>"}',
      useCase: 'Synchronisation du bloc notes au chargement de la page'
    },
    {
      method: 'POST',
      path: '/api/notes',
      fullUrl: 'http://localhost:3003/api/notes',
      description: 'Sauvegarder le contenu du bloc notes en base de données',
      parameters: [
        'content (required) - Contenu HTML du bloc notes à sauvegarder'
      ],
      response: '{ "success": true } | 400 si contenu vide | 500 en cas d\'erreur',
      exampleRequest: `curl -X POST http://localhost:3003/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{"content":"<span style=\\"font-size: 12.8px;\\">Nouveau contenu du bloc notes</span>"}'`,
      exampleResponse: '{"success":true}',
      useCase: 'Sauvegarde automatique du bloc notes (système hybride localStorage + DB)'
    }
  ];

  // Database views with detailed explanations
  const databaseViews = [
    {
      name: 'v_prospects_par_region',
      description: 'Vue des prospects groupés par région avec compteurs automatiques',
      detailedDescription: 'Cette vue calcule automatiquement le nombre total de prospects par région, ainsi que la répartition entre contacts conclus et à contacter. Elle est utilisée pour alimenter les graphiques du dashboard et fournir des statistiques géographiques en temps réel.',
      columns: ['region', 'nombre_prospects', 'conclus', 'a_contacter'],
      sqlQuery: `CREATE OR REPLACE VIEW v_prospects_par_region AS
SELECT region, COUNT(*) as nombre_prospects, 
       COUNT(CASE WHEN etape_suivi = 'OK' THEN 1 END) as conclus,
       COUNT(CASE WHEN etape_suivi = 'à contacter' THEN 1 END) as a_contacter
FROM prospects 
GROUP BY region 
ORDER BY nombre_prospects DESC;`,
      useCase: 'Dashboard - Statistiques géographiques, rapports régionaux, analyse de répartition',
      performance: 'Optimisé avec index sur la colonne region'
    },
    {
      name: 'v_prospects_a_contacter',
      description: 'Vue des prospects à contacter triés par priorité',
      detailedDescription: 'Cette vue filtre automatiquement les prospects ayant l\'étape "à contacter" et les trie par date de création (plus anciens en premier). Elle fournit une liste prête à l\'emploi pour le suivi commercial.',
      columns: ['id', 'nom', 'prenom', 'email', 'telephone', 'entreprise', 'ville', 'region', 'date_creation'],
      sqlQuery: `CREATE OR REPLACE VIEW v_prospects_a_contacter AS
SELECT id, nom, prenom, email, telephone, entreprise, ville, region, date_creation
FROM prospects 
WHERE etape_suivi = 'à contacter' 
ORDER BY date_creation ASC;`,
      useCase: 'Liste de suivi commercial, rappels automatiques, prioritisation des contacts',
      performance: 'Optimisé avec index sur etape_suivi et date_creation'
    }
  ];

  const databaseIndexes = [
    { 
      name: 'idx_prospects_region', 
      column: 'region', 
      description: 'Index sur la région pour les requêtes géographiques',
      detailedDescription: 'Optimise les recherches et regroupements par région. Crucial pour les statistiques géographiques et la vue v_prospects_par_region.',
      impact: 'Rend les statistiques régionales instantanées',
      sqlQuery: 'CREATE INDEX idx_prospects_region ON prospects(region);'
    },
    { 
      name: 'idx_prospects_date_creation', 
      column: 'date_creation', 
      description: 'Index sur la date de création pour le tri chronologique',
      detailedDescription: 'Accélère le tri par date de création, utilisé dans la liste principale des prospects et la vue v_prospects_a_contacter.',
      impact: 'Tri par date 50x plus rapide',
      sqlQuery: 'CREATE INDEX idx_prospects_date_creation ON prospects(date_creation);'
    },
    { 
      name: 'idx_prospects_email', 
      column: 'email', 
      description: 'Index sur l\'email pour les recherches instantanées',
      detailedDescription: 'Permet des recherches ultra-rapides par adresse email. Essentiel pour éviter les doublons et les recherches de contacts.',
      impact: 'Recherche par email en moins de 1ms',
      sqlQuery: 'CREATE INDEX idx_prospects_email ON prospects(email);'
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'info';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes('PRIMARY KEY')) return 'error';
    if (type.includes('VARCHAR')) return 'primary';
    if (type.includes('TEXT')) return 'secondary';
    if (type.includes('TIMESTAMP')) return 'info';
    if (type.includes('SERIAL')) return 'warning';
    return 'default';
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Chargement du tableau de bord système...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: '#4CAF50', fontWeight: 700 }}>
        📊 Tableau de Bord Système CRM - Documentation Complète
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Documentation technique complète</strong> - Ce tableau de bord présente l'architecture complète de votre système CRM : 
          structure de base de données, endpoints API avec URLs complètes, vues optimisées et index de performance.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Database Schema */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DatabaseIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                🗄️ Structure de la Base de Données
              </Typography>
            </Box>
            
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Tables :</strong> prospects ({databaseColumns.length} colonnes) + notes (4 colonnes) - PostgreSQL
              </Typography>
            </Alert>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Colonne</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Nullable</strong></TableCell>
                    <TableCell><strong>Défaut</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {databaseColumns.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                          {column.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={column.type} 
                          size="small" 
                          color={getTypeColor(column.type) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={column.nullable ? 'Oui' : 'Non'} 
                          size="small" 
                          color={column.nullable ? 'default' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {column.default || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {column.description}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Fonctionnalités automatiques :</strong> ID auto-incrémenté, calcul automatique de la région, 
                horodatage automatique, validation des contraintes.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Table Notes */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                📝 Table Notes (Bloc Notes)
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Table :</strong> notes - Stockage du contenu du bloc notes avec système hybride localStorage + DB
              </Typography>
            </Alert>

            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Colonne</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Nullable</strong></TableCell>
                    <TableCell><strong>Défaut</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        id
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="SERIAL PRIMARY KEY" 
                        size="small" 
                        color="warning"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Non" 
                        size="small" 
                        color="error"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        AUTO_INCREMENT
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Identifiant unique de la note
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        content
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="TEXT" 
                        size="small" 
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Oui" 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        null
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Contenu HTML du bloc notes
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        created_at
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="TIMESTAMP WITH TIME ZONE" 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Oui" 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        CURRENT_TIMESTAMP
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Date de création de la note
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        updated_at
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="TIMESTAMP WITH TIME ZONE" 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Oui" 
                        size="small" 
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        CURRENT_TIMESTAMP
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        Date de dernière modification
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Système hybride :</strong> Sauvegarde automatique localStorage (instantané) + base de données (persistance), 
                synchronisation au chargement, récupération en cas de perte du cache.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ApiIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                🔌 Endpoints API - URLs Complètes
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Base URL :</strong> http://localhost:3003 - {apiEndpoints.length} endpoints disponibles
              </Typography>
            </Alert>

            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>🆕 Nouveau :</strong> API de filtrage avancée `/api/prospects/filter` avec 10+ paramètres de recherche et pagination intelligente
              </Typography>
            </Alert>

            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {apiEndpoints.map((endpoint, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Chip 
                        label={endpoint.method} 
                        size="small" 
                        color={getMethodColor(endpoint.method) as any}
                        sx={{ mr: 2, minWidth: 60 }}
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                        {endpoint.path}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(endpoint.fullUrl);
                        }}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        <strong>URL Complète :</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TextField 
                          value={endpoint.fullUrl} 
                          size="small" 
                          fullWidth 
                          InputProps={{ 
                            readOnly: true, 
                            sx: { fontFamily: 'monospace', fontSize: '0.8rem' } 
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(endpoint.fullUrl)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Description :</strong> {endpoint.description}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Cas d'usage :</strong> {endpoint.useCase}
                    </Typography>

                    {endpoint.parameters && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Paramètres:
                        </Typography>
                        <List dense>
                          {endpoint.parameters.map((param, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <CodeIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={param} 
                                primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Exemple de requête:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {endpoint.exampleRequest}
                      </Box>
                    </Box>

                    <Typography variant="body2">
                      <strong>Réponse :</strong> 
                      <Chip 
                        label={endpoint.response} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1, fontFamily: 'monospace' }}
                      />
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Database Views and Indexes */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Database Views */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ViewIcon sx={{ mr: 1, color: '#4CAF50' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  👁️ Vues de Base de Données
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Les vues sont des <strong>tables virtuelles</strong> qui pré-calculent et optimisent les requêtes complexes.
                </Typography>
              </Alert>

              {databaseViews.map((view, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {view.name}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      {view.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {view.detailedDescription}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Cas d'usage:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {view.useCase}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Performance:
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {view.performance}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Colonnes disponibles:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {view.columns.map((column, idx) => (
                          <Chip 
                            key={idx} 
                            label={column} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Requête SQL:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.7rem', overflow: 'auto' }}>
                        {view.sqlQuery}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* Database Indexes */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ mr: 1, color: '#4CAF50' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ⚡ Index de Performance
                </Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Les index accélèrent les requêtes de <strong>10x à 100x</strong> selon le type d'opération.
                </Typography>
              </Alert>

              {databaseIndexes.map((index, idx) => (
                <Accordion key={idx} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {index.name}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      {index.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {index.detailedDescription}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Impact sur les performances:
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        {index.impact}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Colonne indexée:
                      </Typography>
                      <Chip 
                        label={index.column} 
                        size="small" 
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Commande SQL:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {index.sqlQuery}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Nouvelles Fonctionnalités */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                🆕 Nouvelles Fonctionnalités - API de Filtrage Avancée
              </Typography>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1">
                <strong>Filtrage Multi-Critères :</strong> La nouvelle API `/api/prospects/filter` permet de filtrer les prospects selon 10+ critères différents avec pagination intelligente.
              </Typography>
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#4CAF50' }}>
                  🔍 Recherche Textuelle
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>search</strong> - Recherche globale (nom, entreprise, email)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>nom_complet</strong> - Recherche par nom complet
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>entreprise</strong> - Recherche par entreprise
                </Typography>
                <Typography variant="body2">
                  • <strong>libelle_poste</strong> - Recherche par poste
                </Typography>
              </Box>

              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#4CAF50' }}>
                  🏢 Filtres Entreprise
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>categorie_poste</strong> - Directeur, Manager, etc.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>taille_entreprise</strong> - PME, Startup, Grand Groupe
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>secteur</strong> - Technologie, Finance, etc.
                </Typography>
                <Typography variant="body2">
                  • <strong>pays</strong> - Luxembourg, France, etc.
                </Typography>
              </Box>

              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#4CAF50' }}>
                  📊 Gestion & Pagination
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>etape_suivi</strong> - À contacter, OK, etc.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>page</strong> - Numéro de page (défaut: 1)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>limit</strong> - Éléments par page (défaut: 20)
                </Typography>
                <Typography variant="body2">
                  • <strong>Réponse</strong> - prospects[], pagination{}, filters{}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                <strong>Exemple d'utilisation :</strong>
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem', backgroundColor: '#fff', p: 1, borderRadius: 0.5 }}>
                curl "http://localhost:3003/api/prospects/filter?categorie_poste=Directeur&taille_entreprise=PME&search=tech&page=1&limit=10"
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              📋 Résumé de l'Architecture Système
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 150 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {databaseColumns.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Colonnes DB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Table: prospects
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 150 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {apiEndpoints.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Endpoints API
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Port: 3003
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 150 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {databaseViews.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vues DB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Optimisées
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 150 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {databaseIndexes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Index DB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Performance
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Alert severity="success" sx={{ flex: 1 }}>
                <Typography variant="body2">
                  <strong>✅ Architecture optimisée :</strong> Base de données PostgreSQL avec vues et index pour des performances maximales.
                </Typography>
              </Alert>
              <Alert severity="info" sx={{ flex: 1 }}>
                <Typography variant="body2">
                  <strong>🔌 API REST complète :</strong> {apiEndpoints.length} endpoints avec URLs complètes, exemples de requêtes et documentation détaillée.
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SystemDashboard;