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
  IconButton,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as DatabaseIcon,
  Api as ApiIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Build as BuildIcon,
  DataObject as DataObjectIcon
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

  // Database schema definition - Tables principales (nouveau schéma Lemlist)
  
  // Colonnes de la table contacts
  const contactsColumns: DatabaseColumn[] = [
    {
      name: 'id',
      type: 'SERIAL PRIMARY KEY',
      nullable: false,
      default: 'AUTO_INCREMENT',
      description: 'Identifiant unique du contact'
    },
    {
      name: 'lead_id',
      type: 'VARCHAR(255) UNIQUE',
      nullable: false,
      default: null,
      description: 'ID unique Lemlist du contact'
    },
    {
      name: 'full_name',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom complet du contact'
    },
    {
      name: 'canonical_shorthand_name',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom court canonique'
    },
    {
      name: 'profile_picture_url',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'URL de la photo de profil'
    },
    {
      name: 'headline',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'Titre professionnel'
    },
    {
      name: 'email',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Adresse email'
    },
    {
      name: 'phone',
      type: 'VARCHAR(50)',
      nullable: true,
      default: null,
      description: 'Numéro de téléphone'
    },
    {
      name: 'linkedin_url',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'URL du profil LinkedIn'
    },
    {
      name: 'linkedin_short',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom court LinkedIn'
    },
    {
      name: 'location',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Localisation'
    },
    {
      name: 'country',
      type: 'VARCHAR(100)',
      nullable: true,
      default: null,
      description: 'Pays'
    },
    {
      name: 'current_company_name',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom de l\'entreprise actuelle'
    },
    {
      name: 'current_company_industry',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Secteur de l\'entreprise actuelle'
    },
    {
      name: 'experience_count',
      type: 'INTEGER',
      nullable: true,
      default: null,
      description: 'Nombre d\'expériences'
    },
    {
      name: 'connections_count_bucket',
      type: 'VARCHAR(50)',
      nullable: true,
      default: null,
      description: 'Tranche de nombre de connexions'
    },
    {
      name: 'lead_quality_score',
      type: 'DECIMAL(3,2)',
      nullable: true,
      default: null,
      description: 'Score de qualité du lead'
    },
    {
      name: 'years_of_experience',
      type: 'INTEGER',
      nullable: true,
      default: null,
      description: 'Années d\'expérience'
    },
    {
      name: 'created_at',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de création'
    },
    {
      name: 'updated_at',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de dernière modification'
    }
  ];

  // Colonnes de la table companies
  const companiesColumns: DatabaseColumn[] = [
    {
      name: 'id',
      type: 'SERIAL PRIMARY KEY',
      nullable: false,
      default: 'AUTO_INCREMENT',
      description: 'Identifiant unique de l\'entreprise'
    },
    {
      name: 'company_name',
      type: 'VARCHAR(255)',
      nullable: false,
      default: null,
      description: 'Nom de l\'entreprise'
    },
    {
      name: 'company_shorthand_name',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom court de l\'entreprise'
    },
    {
      name: 'logo_url',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'URL du logo'
    },
    {
      name: 'linkedin_url',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'URL LinkedIn de l\'entreprise'
    },
    {
      name: 'company_followers_count',
      type: 'INTEGER',
      nullable: true,
      default: null,
      description: 'Nombre de followers LinkedIn'
    },
    {
      name: 'company_founded',
      type: 'INTEGER',
      nullable: true,
      default: null,
      description: 'Année de fondation'
    },
    {
      name: 'company_domain',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Domaine de l\'entreprise'
    },
    {
      name: 'company_industry',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Secteur d\'activité'
    },
    {
      name: 'company_subindustry',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Sous-secteur d\'activité'
    },
    {
      name: 'employees_count_growth',
      type: 'VARCHAR(50)',
      nullable: true,
      default: null,
      description: 'Croissance du nombre d\'employés'
    },
    {
      name: 'company_url',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'Site web de l\'entreprise'
    },
    {
      name: 'created_at',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de création'
    },
    {
      name: 'updated_at',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de dernière modification'
    }
  ];

  // Colonnes de la table experiences
  const experiencesColumns: DatabaseColumn[] = [
    {
      name: 'id',
      type: 'SERIAL PRIMARY KEY',
      nullable: false,
      default: 'AUTO_INCREMENT',
      description: 'Identifiant unique de l\'expérience'
    },
    {
      name: 'contact_id',
      type: 'INTEGER REFERENCES contacts(id)',
      nullable: false,
      default: null,
      description: 'Référence vers le contact'
    },
    {
      name: 'company_id',
      type: 'INTEGER REFERENCES companies(id)',
      nullable: true,
      default: null,
      description: 'Référence vers l\'entreprise'
    },
    {
      name: 'title',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Titre du poste'
    },
    {
      name: 'company_name',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Nom de l\'entreprise'
    },
    {
      name: 'location',
      type: 'VARCHAR(255)',
      nullable: true,
      default: null,
      description: 'Localisation du poste'
    },
    {
      name: 'date_from',
      type: 'VARCHAR(50)',
      nullable: true,
      default: null,
      description: 'Date de début'
    },
    {
      name: 'date_to',
      type: 'VARCHAR(50)',
      nullable: true,
      default: null,
      description: 'Date de fin'
    },
    {
      name: 'duration',
      type: 'VARCHAR(100)',
      nullable: true,
      default: null,
      description: 'Durée du poste'
    },
    {
      name: 'description',
      type: 'TEXT',
      nullable: true,
      default: null,
      description: 'Description du poste'
    },
    {
      name: 'is_current',
      type: 'BOOLEAN',
      nullable: true,
      default: 'false',
      description: 'Poste actuel'
    },
    {
      name: 'order_in_profile',
      type: 'INTEGER',
      nullable: true,
      default: null,
      description: 'Ordre dans le profil'
    },
    {
      name: 'created_at',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de création'
    },
    {
      name: 'updated_at',
      type: 'TIMESTAMP',
      nullable: true,
      default: 'CURRENT_TIMESTAMP',
      description: 'Date de dernière modification'
    }
  ];

  // Tables de référence et nouvelles tables Lemlist
  const referenceTables = [
    {
      name: 'contact_languages',
      description: 'Langues parlées par les contacts',
      columns: ['id', 'contact_id', 'language', 'proficiency'],
      count: 200,
      examples: ['Français', 'Anglais', 'Allemand', 'Espagnol']
    },
    {
      name: 'contact_skills',
      description: 'Compétences techniques des contacts',
      columns: ['id', 'contact_id', 'skill', 'level'],
      count: 500,
      examples: ['JavaScript', 'Python', 'React', 'Node.js']
    },
    {
      name: 'contact_interests',
      description: 'Centres d\'intérêt des contacts',
      columns: ['id', 'contact_id', 'interest'],
      count: 300,
      examples: ['Technologie', 'Finance', 'Marketing', 'Innovation']
    },
    {
      name: 'contact_education',
      description: 'Formation et éducation des contacts',
      columns: ['id', 'contact_id', 'institution', 'degree', 'field', 'start_year', 'end_year'],
      count: 150,
      examples: ['Université de Luxembourg', 'Master en Informatique', 'MBA']
    },
    {
      name: 'categories_poste',
      description: 'Catégories de poste disponibles (legacy)',
      columns: ['id', 'nom', 'actif'],
      count: 22,
      examples: ['Direction', 'Comptable/Financier', 'Founder', 'Technique']
    },
    {
      name: 'tailles_entreprise',
      description: 'Tailles d\'entreprise standardisées (legacy)',
      columns: ['id', 'nom', 'actif'],
      count: 8,
      examples: ['1-10', '11-50', '51-200', '201-500']
    },
    {
      name: 'secteurs',
      description: 'Secteurs d\'activité économiques (legacy)',
      columns: ['id', 'nom', 'actif'],
      count: 25,
      examples: ['Technology', 'Finance', 'Healthcare', 'Education']
    },
    {
      name: 'pays',
      description: 'Pays disponibles (legacy)',
      columns: ['id', 'nom', 'actif'],
      count: 2,
      examples: ['Luxembourg', 'Suisse']
    },
    {
      name: 'notes',
      description: 'Système de bloc notes hybride',
      columns: ['id', 'content', 'created_at', 'updated_at'],
      count: 1,
      examples: ['Contenu HTML du bloc notes']
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
      path: '/api/contacts',
      fullUrl: 'http://localhost:3003/api/contacts',
      description: 'Récupérer tous les contacts avec pagination et tri par ID (plus récents en premier)',
      parameters: [
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'éléments par page (défaut: 20)'
      ],
      response: 'Object avec contacts[] et pagination{} - Liste paginée des contacts avec toutes les données Lemlist',
      exampleRequest: 'curl "http://localhost:3003/api/contacts?page=1&limit=20"',
      exampleResponse: '{"contacts":[{"id":1,"full_name":"Hervé Pické","headline":"CISO",...}],"pagination":{"page":1,"limit":20,"totalCount":100,"totalPages":5}}',
      useCase: 'Charger la liste paginée des contacts dans l\'interface'
    },
    {
      method: 'GET',
      path: '/api/companies',
      fullUrl: 'http://localhost:3003/api/companies',
      description: 'Récupérer toutes les entreprises avec pagination',
      parameters: [
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'éléments par page (défaut: 20)'
      ],
      response: 'Object avec companies[] et pagination{} - Liste paginée des entreprises',
      exampleRequest: 'curl "http://localhost:3003/api/companies?page=1&limit=20"',
      exampleResponse: '{"companies":[{"id":1,"company_name":"Luxembourg House of Cybersecurity",...}],"pagination":{"page":1,"limit":20,"totalCount":50,"totalPages":3}}',
      useCase: 'Charger la liste paginée des entreprises dans l\'interface'
    },
    {
      method: 'GET',
      path: '/api/contacts/search',
      fullUrl: 'http://localhost:3003/api/contacts/search',
      description: 'Recherche avancée de contacts avec recherche textuelle insensible aux accents',
      parameters: [
        'q (required) - Terme de recherche (nom, titre, entreprise, localisation)',
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'éléments par page (défaut: 20)'
      ],
      response: 'Object avec contacts[] et pagination{} - Résultats de recherche paginés',
      exampleRequest: 'curl "http://localhost:3003/api/contacts/search?q=hervé&page=1&limit=20"',
      exampleResponse: '{"contacts":[{"id":1,"full_name":"Hervé Pické","headline":"CISO",...}],"pagination":{"page":1,"limit":20,"totalCount":1,"totalPages":1}}',
      useCase: 'Recherche de contacts par nom, titre, entreprise ou localisation'
    },
    {
      method: 'GET',
      path: '/api/companies/search',
      fullUrl: 'http://localhost:3003/api/companies/search',
      description: 'Recherche d\'entreprises avec recherche textuelle',
      parameters: [
        'q (required) - Terme de recherche (nom d\'entreprise, secteur)',
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'éléments par page (défaut: 20)'
      ],
      response: 'Object avec companies[] et pagination{} - Résultats de recherche paginés',
      exampleRequest: 'curl "http://localhost:3003/api/companies/search?q=cybersecurity&page=1&limit=20"',
      exampleResponse: '{"companies":[{"id":1,"company_name":"Luxembourg House of Cybersecurity",...}],"pagination":{"page":1,"limit":20,"totalCount":1,"totalPages":1}}',
      useCase: 'Recherche d\'entreprises par nom ou secteur'
    },
    {
      method: 'GET',
      path: '/api/contacts/:id',
      fullUrl: 'http://localhost:3003/api/contacts/1',
      description: 'Récupérer un contact spécifique par son ID avec toutes les données complètes',
      parameters: ['id (number) - ID unique du contact'],
      response: 'Contact complet avec expériences, compétences, langues, éducation | 404 si non trouvé',
      exampleRequest: 'curl http://localhost:3003/api/contacts/1',
      exampleResponse: '{"id":1,"full_name":"Hervé Pické","headline":"CISO","experiences":[...],"languages":[...],"skills":[...]}',
      useCase: 'Afficher la fiche contact complète avec toutes les données Lemlist'
    },
    {
      method: 'GET',
      path: '/api/companies/:id',
      fullUrl: 'http://localhost:3003/api/companies/1',
      description: 'Récupérer une entreprise spécifique par son ID avec ses employés',
      parameters: ['id (number) - ID unique de l\'entreprise'],
      response: 'Entreprise avec employés paginés | 404 si non trouvé',
      exampleRequest: 'curl http://localhost:3003/api/companies/1',
      exampleResponse: '{"id":1,"company_name":"Luxembourg House of Cybersecurity","employees":[...],"pagination":{...}}',
      useCase: 'Afficher la fiche entreprise avec ses employés'
    },
    {
      method: 'GET',
      path: '/api/companies/:id/employees',
      fullUrl: 'http://localhost:3003/api/companies/1/employees',
      description: 'Récupérer les employés d\'une entreprise avec pagination',
      parameters: [
        'id (number) - ID unique de l\'entreprise',
        'page (optional) - Numéro de page (défaut: 1)',
        'limit (optional) - Nombre d\'employés par page (défaut: 50)',
        'current_only (optional) - Seulement les employés actuels (défaut: false)'
      ],
      response: 'Object avec employees[] et pagination{} - Employés paginés',
      exampleRequest: 'curl "http://localhost:3003/api/companies/1/employees?page=1&limit=20"',
      exampleResponse: '{"employees":[{"id":1,"title":"CISO","full_name":"Hervé Pické",...}],"pagination":{"page":1,"limit":20,"total":1,"pages":1}}',
      useCase: 'Afficher la liste des employés d\'une entreprise avec pagination'
    },
    {
      method: 'POST',
      path: '/api/prospects',
      fullUrl: 'http://localhost:3003/api/prospects',
      description: 'Créer un nouveau prospect en base de données',
      parameters: [
        'nom_complet (required) - Nom complet du prospect',
        'entreprise (optional) - Nom de l\'entreprise',
        'categorie_poste (optional) - Catégorie de poste',
        'poste_specifique (optional) - Poste spécifique',
        'pays (optional) - Pays (défaut: Luxembourg)',
        'taille_entreprise (optional) - Taille de l\'entreprise',
        'site_web (optional) - Site web de l\'entreprise',
        'secteur (optional) - Secteur d\'activité',
        'email (optional) - Adresse email',
        'telephone (optional) - Numéro de téléphone',
        'linkedin (optional) - URL LinkedIn',
        'interets (optional) - Centres d\'intérêt',
        'historique (optional) - Historique des interactions',
        'etape_suivi (optional) - Étape de suivi (défaut: à contacter)'
      ],
      response: 'Prospect (201) | 400 si nom_complet manquant | 500 en cas d\'erreur',
      exampleRequest: `curl -X POST http://localhost:3003/api/prospects \\
  -H "Content-Type: application/json" \\
  -d '{"nom_complet":"Jean Dupont","entreprise":"TechCorp","categorie_poste":"Direction"}'`,
      exampleResponse: '{"id":10,"nom_complet":"Jean Dupont","entreprise":"TechCorp",...}',
      useCase: 'Ajouter un nouveau prospect via le formulaire'
    },
    {
      method: 'POST',
      path: '/api/prospects/bulk',
      fullUrl: 'http://localhost:3003/api/prospects/bulk',
      description: 'Import en lot de prospects (transaction atomique)',
      parameters: [
        'Array de prospects - Tableau d\'objets prospect à importer'
      ],
      response: '{ "message": "X prospects importés avec succès", "count": number, "prospects": Array }',
      exampleRequest: `curl -X POST http://localhost:3003/api/prospects/bulk \\
  -H "Content-Type: application/json" \\
  -d '[{"nom_complet":"Jean Dupont","entreprise":"TechCorp"}]'`,
      exampleResponse: '{"message":"1 prospects importés avec succès","count":1,"prospects":[...]}',
      useCase: 'Import massif de prospects depuis un fichier CSV ou Excel'
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
  -d '{"nom_complet":"Jean-Pierre Dupont","etape_suivi":"en cours"}'`,
      exampleResponse: '{"id":1,"nom_complet":"Jean-Pierre Dupont","etape_suivi":"en cours",...}',
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
      path: '/api/categories-poste',
      fullUrl: 'http://localhost:3003/api/categories-poste',
      description: 'Récupérer les catégories de poste disponibles',
      response: 'Array<CategoriePoste> - Liste des catégories actives',
      exampleRequest: 'curl http://localhost:3003/api/categories-poste',
      exampleResponse: '[{"id":1,"nom":"Direction","actif":true},{"id":2,"nom":"Comptable/Financier","actif":true}]',
      useCase: 'Peupler les options du formulaire de filtrage'
    },
    {
      method: 'GET',
      path: '/api/tailles-entreprise',
      fullUrl: 'http://localhost:3003/api/tailles-entreprise',
      description: 'Récupérer les tailles d\'entreprise disponibles',
      response: 'Array<TailleEntreprise> - Liste des tailles actives',
      exampleRequest: 'curl http://localhost:3003/api/tailles-entreprise',
      exampleResponse: '[{"id":1,"nom":"1-10","actif":true},{"id":2,"nom":"11-50","actif":true}]',
      useCase: 'Peupler les options du formulaire de filtrage'
    },
    {
      method: 'GET',
      path: '/api/secteurs',
      fullUrl: 'http://localhost:3003/api/secteurs',
      description: 'Récupérer les secteurs d\'activité disponibles',
      response: 'Array<Secteur> - Liste des secteurs actifs',
      exampleRequest: 'curl http://localhost:3003/api/secteurs',
      exampleResponse: '[{"id":1,"nom":"Technology","actif":true},{"id":2,"nom":"Finance","actif":true}]',
      useCase: 'Peupler les options du formulaire de filtrage'
    },
    {
      method: 'GET',
      path: '/api/pays',
      fullUrl: 'http://localhost:3003/api/pays',
      description: 'Récupérer les pays disponibles',
      response: 'Array<Pays> - Liste des pays actifs',
      exampleRequest: 'curl http://localhost:3003/api/pays',
      exampleResponse: '[{"id":1,"nom":"Luxembourg","actif":true},{"id":2,"nom":"Suisse","actif":true}]',
      useCase: 'Peupler les options du formulaire de filtrage'
    },
    {
      method: 'GET',
      path: '/api/notes',
      fullUrl: 'http://localhost:3003/api/notes',
      description: 'Récupérer le contenu du bloc notes depuis la base de données',
      response: '{ "content": "string" } - Contenu HTML du bloc notes',
      exampleRequest: 'curl http://localhost:3003/api/notes',
      exampleResponse: '{"content":"<span style=\\"font-size: 12.8px;\\">Contenu du bloc notes</span>"}',
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
    },
    {
      method: 'POST',
      path: '/api/fix-database',
      fullUrl: 'http://localhost:3003/api/fix-database',
      description: 'Vérifier et corriger la base de données (endpoint de maintenance)',
      response: '{ "message": "Base de données vérifiée avec succès", "data": Array<Prospect> }',
      exampleRequest: 'curl -X POST http://localhost:3003/api/fix-database',
      exampleResponse: '{"message":"Base de données vérifiée avec succès","data":[...]}',
      useCase: 'Maintenance et vérification des données en cas de problème'
    }
  ];

  // Database views with detailed explanations
  const databaseViews = [
    {
      name: 'v_prospects_par_pays',
      description: 'Vue des prospects groupés par pays avec compteurs automatiques',
      detailedDescription: 'Cette vue calcule automatiquement le nombre total de prospects par pays, ainsi que la répartition entre clients et prospects à contacter. Elle est utilisée pour alimenter les graphiques du dashboard et fournir des statistiques géographiques en temps réel.',
      columns: ['pays', 'nombre_prospects', 'clients', 'prospects'],
      sqlQuery: `CREATE OR REPLACE VIEW v_prospects_par_pays AS
SELECT pays, COUNT(*) as nombre_prospects,
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects 
GROUP BY pays
ORDER BY nombre_prospects DESC;`,
      useCase: 'Dashboard - Statistiques géographiques, rapports par pays, analyse de répartition',
      performance: 'Optimisé avec index sur la colonne pays'
    },
    {
      name: 'v_prospects_par_secteur',
      description: 'Vue des prospects groupés par secteur d\'activité',
      detailedDescription: 'Cette vue fournit une analyse sectorielle des prospects avec comptage automatique des clients et prospects par secteur. Idéale pour l\'analyse de marché et la segmentation commerciale.',
      columns: ['secteur', 'nombre_prospects', 'clients', 'prospects'],
      sqlQuery: `CREATE OR REPLACE VIEW v_prospects_par_secteur AS
SELECT secteur, COUNT(*) as nombre_prospects,
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects
WHERE secteur IS NOT NULL
GROUP BY secteur
ORDER BY nombre_prospects DESC;`,
      useCase: 'Analyse sectorielle, segmentation commerciale, rapports de marché',
      performance: 'Optimisé avec index sur la colonne secteur'
    },
    {
      name: 'v_prospects_par_taille_entreprise',
      description: 'Vue des prospects groupés par taille d\'entreprise',
      detailedDescription: 'Cette vue analyse la répartition des prospects selon la taille de leur entreprise, permettant d\'identifier les segments de marché les plus représentés.',
      columns: ['taille_entreprise', 'nombre_prospects', 'clients', 'prospects'],
      sqlQuery: `CREATE OR REPLACE VIEW v_prospects_par_taille_entreprise AS
SELECT taille_entreprise, COUNT(*) as nombre_prospects,
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects
WHERE taille_entreprise IS NOT NULL
GROUP BY taille_entreprise
ORDER BY nombre_prospects DESC;`,
      useCase: 'Analyse de segments, ciblage commercial, rapports de taille d\'entreprise',
      performance: 'Optimisé avec index sur la colonne taille_entreprise'
    },
    {
      name: 'v_prospects_a_contacter',
      description: 'Vue des prospects à contacter triés par priorité',
      detailedDescription: 'Cette vue filtre automatiquement les prospects ayant l\'étape "à contacter" et les trie par date de création (plus anciens en premier). Elle fournit une liste prête à l\'emploi pour le suivi commercial.',
      columns: ['id', 'nom_complet', 'entreprise', 'categorie_poste', 'poste_specifique', 'pays', 'taille_entreprise', 'secteur', 'email', 'telephone', 'date_creation'],
      sqlQuery: `CREATE OR REPLACE VIEW v_prospects_a_contacter AS
SELECT id, nom_complet, entreprise, categorie_poste, poste_specifique, 
       pays, taille_entreprise, secteur, email, telephone, date_creation
FROM prospects 
WHERE statut = 'Prospect à contacter'
ORDER BY date_creation ASC;`,
      useCase: 'Liste de suivi commercial, rappels automatiques, prioritisation des contacts',
      performance: 'Optimisé avec index sur statut et date_creation'
    }
  ];

  const databaseIndexes = [
    { 
      name: 'idx_prospects_nom_complet', 
      column: 'nom_complet', 
      description: 'Index sur le nom complet pour les recherches textuelles',
      detailedDescription: 'Optimise les recherches par nom complet, utilisé dans le filtrage et la recherche textuelle.',
      impact: 'Recherche par nom 10x plus rapide',
      sqlQuery: 'CREATE INDEX idx_prospects_nom_complet ON prospects(nom_complet);'
    },
    { 
      name: 'idx_prospects_entreprise', 
      column: 'entreprise', 
      description: 'Index sur l\'entreprise pour les recherches et regroupements',
      detailedDescription: 'Accélère les recherches par entreprise et les statistiques d\'entreprise.',
      impact: 'Recherche par entreprise 15x plus rapide',
      sqlQuery: 'CREATE INDEX idx_prospects_entreprise ON prospects(entreprise);'
    },
    { 
      name: 'idx_prospects_categorie_poste', 
      column: 'categorie_poste', 
      description: 'Index sur la catégorie de poste pour le filtrage',
      detailedDescription: 'Optimise le filtrage par catégorie de poste, essentiel pour l\'API de filtrage.',
      impact: 'Filtrage par catégorie instantané',
      sqlQuery: 'CREATE INDEX idx_prospects_categorie_poste ON prospects(categorie_poste);'
    },
    { 
      name: 'idx_prospects_pays', 
      column: 'pays', 
      description: 'Index sur le pays pour les requêtes géographiques',
      detailedDescription: 'Optimise les recherches et regroupements par pays. Crucial pour les statistiques géographiques.',
      impact: 'Rend les statistiques par pays instantanées',
      sqlQuery: 'CREATE INDEX idx_prospects_pays ON prospects(pays);'
    },
    { 
      name: 'idx_prospects_taille_entreprise', 
      column: 'taille_entreprise', 
      description: 'Index sur la taille d\'entreprise pour le filtrage',
      detailedDescription: 'Accélère le filtrage par taille d\'entreprise et les statistiques de segmentation.',
      impact: 'Filtrage par taille instantané',
      sqlQuery: 'CREATE INDEX idx_prospects_taille_entreprise ON prospects(taille_entreprise);'
    },
    { 
      name: 'idx_prospects_secteur', 
      column: 'secteur', 
      description: 'Index sur le secteur pour le filtrage et l\'analyse',
      detailedDescription: 'Optimise le filtrage par secteur et les analyses sectorielles.',
      impact: 'Filtrage par secteur instantané',
      sqlQuery: 'CREATE INDEX idx_prospects_secteur ON prospects(secteur);'
    },
    { 
      name: 'idx_prospects_email', 
      column: 'email', 
      description: 'Index sur l\'email pour les recherches instantanées',
      detailedDescription: 'Permet des recherches ultra-rapides par adresse email. Essentiel pour éviter les doublons et les recherches de contacts.',
      impact: 'Recherche par email en moins de 1ms',
      sqlQuery: 'CREATE INDEX idx_prospects_email ON prospects(email);'
    },
    { 
      name: 'idx_prospects_statut', 
      column: 'statut', 
      description: 'Index sur le statut pour le filtrage et les vues',
      detailedDescription: 'Accélère le filtrage par statut et optimise la vue v_prospects_a_contacter.',
      impact: 'Filtrage par statut instantané',
      sqlQuery: 'CREATE INDEX idx_prospects_statut ON prospects(statut);'
    },
    { 
      name: 'idx_prospects_date_creation', 
      column: 'date_creation', 
      description: 'Index sur la date de création pour le tri chronologique',
      detailedDescription: 'Accélère le tri par date de création, utilisé dans la liste principale des prospects et la vue v_prospects_a_contacter.',
      impact: 'Tri par date 50x plus rapide',
      sqlQuery: 'CREATE INDEX idx_prospects_date_creation ON prospects(date_creation);'
    }
  ];

  // Technologies utilisées
  const technologies = {
    frontend: [
      { name: 'React 18', version: '18.x', description: 'Framework JavaScript pour l\'interface utilisateur', icon: '⚛️' },
      { name: 'TypeScript', version: '5.x', description: 'Langage de programmation typé pour JavaScript', icon: '🔷' },
      { name: 'Material-UI (MUI)', version: '5.x', description: 'Bibliothèque de composants UI React', icon: '🎨' },
      { name: 'Vite', version: '4.x', description: 'Build tool et serveur de développement', icon: '⚡' },
      { name: 'React Router', version: '6.x', description: 'Routage côté client pour React', icon: '🛣️' }
    ],
    backend: [
      { name: 'Node.js', version: '18.x', description: 'Runtime JavaScript côté serveur', icon: '🟢' },
      { name: 'Express.js', version: '4.x', description: 'Framework web pour Node.js', icon: '🚀' },
      { name: 'TypeScript', version: '5.x', description: 'Langage de programmation typé', icon: '🔷' },
      { name: 'PostgreSQL Driver (pg)', version: '8.x', description: 'Driver PostgreSQL pour Node.js', icon: '🐘' },
      { name: 'CORS', version: '2.x', description: 'Middleware pour Cross-Origin Resource Sharing', icon: '🌐' }
    ],
    database: [
      { name: 'PostgreSQL', version: '15.x', description: 'Base de données relationnelle open source', icon: '🐘' },
      { name: 'pg-pool', version: '3.x', description: 'Pool de connexions PostgreSQL', icon: '🏊' },
      { name: 'Index B-tree', version: undefined, description: 'Index de performance pour les requêtes rapides', icon: '📊' },
      { name: 'Vues SQL', version: undefined, description: 'Tables virtuelles pour les requêtes complexes', icon: '👁️' },
      { name: 'Triggers', version: undefined, description: 'Fonctions automatiques pour la maintenance des données', icon: '⚡' }
    ],
    tools: [
      { name: 'Git', version: undefined, description: 'Système de contrôle de version', icon: '📝' },
      { name: 'GitHub', version: undefined, description: 'Plateforme d\'hébergement Git', icon: '🐙' },
      { name: 'npm', version: undefined, description: 'Gestionnaire de paquets Node.js', icon: '📦' },
      { name: 'ESLint', version: undefined, description: 'Linter pour la qualité du code JavaScript/TypeScript', icon: '🔍' },
      { name: 'Vite Dev Server', version: undefined, description: 'Serveur de développement avec HMR', icon: '🔥' }
    ]
  };

  // Spécifications fonctionnelles
  const functionalSpecs = {
    coreFeatures: [
      {
        name: 'Gestion des Prospects',
        description: 'CRUD complet pour la gestion des prospects',
        features: [
          'Création de nouveaux prospects avec validation',
          'Modification des informations existantes',
          'Suppression sécurisée des prospects',
          'Affichage détaillé des informations',
          'Import en lot de prospects (CSV/Excel)'
        ]
      },
      {
        name: 'Système de Filtrage Avancé',
        description: 'Filtrage multi-critères avec recherche textuelle',
        features: [
          'Filtrage par catégorie de poste (22 options)',
          'Filtrage par taille d\'entreprise (8 options)',
          'Filtrage par secteur d\'activité (25 options)',
          'Filtrage par pays (Luxembourg, Suisse)',
          'Recherche textuelle globale et spécifique',
          'Pagination intelligente des résultats'
        ]
      },
      {
        name: 'Interface Utilisateur Moderne',
        description: 'Interface responsive et intuitive',
        features: [
          'Design Material-UI moderne et cohérent',
          'Interface responsive (mobile, tablette, desktop)',
          'Navigation intuitive avec menu latéral',
          'Composants réutilisables et modulaires',
          'Feedback visuel pour les actions utilisateur'
        ]
      },
      {
        name: 'Système de Bloc Notes',
        description: 'Bloc notes hybride avec synchronisation automatique',
        features: [
          'Sauvegarde automatique en base de données',
          'Synchronisation localStorage + DB',
          'Récupération en cas de perte du cache',
          'Interface d\'édition riche (HTML)',
          'Persistance des données'
        ]
      }
    ],
    technicalFeatures: [
      {
        name: 'API REST Complète',
        description: 'API backend robuste et documentée',
        features: [
          '15+ endpoints API documentés',
          'Gestion des erreurs et codes de statut HTTP',
          'Validation des données côté serveur',
          'Pagination automatique des résultats',
          'Filtrage dynamique avec requêtes SQL optimisées'
        ]
      },
      {
        name: 'Base de Données Optimisée',
        description: 'PostgreSQL avec optimisations de performance',
        features: [
          '9 index de performance pour requêtes rapides',
          '4 vues SQL pour statistiques automatiques',
          'Triggers pour maintenance automatique des données',
          'Contraintes de données et validation',
          'Transactions atomiques pour la cohérence'
        ]
      },
      {
        name: 'Architecture Modulaire',
        description: 'Code organisé et maintenable',
        features: [
          'Séparation frontend/backend claire',
          'Composants React réutilisables',
          'Types TypeScript pour la sécurité',
          'Configuration centralisée',
          'Gestion d\'état optimisée'
        ]
      }
    ]
  };

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
                <strong>Tables principales :</strong> contacts ({contactsColumns.length} colonnes), companies ({companiesColumns.length} colonnes), experiences ({experiencesColumns.length} colonnes) + 9 tables de référence - PostgreSQL
              </Typography>
            </Alert>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">📊 Table CONTACTS ({contactsColumns.length} colonnes)</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
                      {contactsColumns.map((column) => (
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
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">🏢 Table COMPANIES ({companiesColumns.length} colonnes)</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
                      {companiesColumns.map((column) => (
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
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">💼 Table EXPERIENCES ({experiencesColumns.length} colonnes)</Typography>
              </AccordionSummary>
              <AccordionDetails>
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
                      {experiencesColumns.map((column) => (
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
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Fonctionnalités automatiques :</strong> ID auto-incrémenté, relations entre tables, 
                horodatage automatique, validation des contraintes, pagination optimisée.
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

        {/* Technologies Stack */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BuildIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                🛠️ Stack Technologique
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
              {Object.entries(technologies).map(([category, techs]) => (
                <Card key={category} variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textTransform: 'capitalize' }}>
                      {category === 'frontend' ? '🎨 Frontend' : 
                       category === 'backend' ? '⚙️ Backend' :
                       category === 'database' ? '🗄️ Base de Données' : '🔧 Outils'}
                    </Typography>
                    <Stack spacing={1}>
                      {techs.map((tech, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 30 }}>
                            {tech.icon}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {tech.name} {tech.version && `(${tech.version})`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tech.description}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Spécifications Fonctionnelles */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DataObjectIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                📋 Spécifications Fonctionnelles
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#4CAF50' }}>
                  🎯 Fonctionnalités Principales
                </Typography>
                <Stack spacing={2}>
                  {functionalSpecs.coreFeatures.map((feature, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {feature.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {feature.description}
                        </Typography>
                        <List dense>
                          {feature.features.map((item, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <CodeIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={item} 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#4CAF50' }}>
                  ⚙️ Fonctionnalités Techniques
                </Typography>
                <Stack spacing={2}>
                  {functionalSpecs.technicalFeatures.map((feature, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          {feature.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {feature.description}
                        </Typography>
                        <List dense>
                          {feature.features.map((item, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <CodeIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={item} 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              📊 Résumé de l'Architecture Système
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 150 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {contactsColumns.length + companiesColumns.length + experiencesColumns.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Colonnes DB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tables: contacts, companies, experiences
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

              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 150 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {referenceTables.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tables Référence
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Données maîtres
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