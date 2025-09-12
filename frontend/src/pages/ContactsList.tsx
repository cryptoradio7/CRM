import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Box,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Chip,
  LinearProgress,
  Card,
  InputAdornment,
  Snackbar,
  Alert,
  Avatar,
  Link,
  Checkbox,
  Tooltip,
  Grid,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Autocomplete,
  Badge
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  BusinessCenter as BusinessCenterIcon,
  Factory as FactoryIcon,
  BarChart as BarChartIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Contact, Company, Experience } from '../types';
import { contactsApi } from '../services/api';
import LongTextDisplay from '../components/LongTextDisplay';

const ContactsList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<string>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    full_name: [] as string[],
    country: [] as string[],
    headline: [] as string[],
    years_of_experience: [] as string[],
    company_name: [] as string[],
    company_domain: [] as string[],
    company_industry: [] as string[],
    company_subindustry: [] as string[],
    employees_count_growth: [] as string[]
  });
  const [filterOptions, setFilterOptions] = useState({
    full_name: [] as string[],
    country: [] as string[],
    headline: [] as string[],
    years_of_experience: [] as string[],
    company_name: [] as string[],
    company_domain: [] as string[],
    company_industry: [] as string[],
    company_subindustry: [] as string[],
    employees_count_growth: [] as string[]
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const notesRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

  // États pour le drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const navigate = useNavigate();
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  // Logique de filtrage des contacts avec filtres cumulatifs
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Filtre par terme de recherche global
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          contact.full_name?.toLowerCase().includes(term) ||
          contact.headline?.toLowerCase().includes(term) ||
          contact.location?.toLowerCase().includes(term) ||
          contact.email?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Filtres cumulatifs - tous doivent être satisfaits
      const filterChecks = [
        // full_name
        filters.full_name.length === 0 || filters.full_name.some((name: string) => 
          contact.full_name?.toLowerCase().includes(name.toLowerCase())
        ),
        
        // country
        filters.country.length === 0 || filters.country.some((country: string) => 
          contact.country?.toLowerCase().includes(country.toLowerCase())
        ),
        
        // headline (champ texte simple)
        filters.headline.length === 0 || (filters.headline[0] && 
          contact.headline?.toLowerCase().includes(filters.headline[0].toLowerCase())
        ),
        
        // years_of_experience (avec tranches)
        filters.years_of_experience.length === 0 || filters.years_of_experience.some((expRange: string) => {
          const contactExp = contact.years_of_experience;
          if (!contactExp) return false;
          
          // Gestion des tranches
          if (expRange === '0-2 ans') {
            return contactExp >= 0 && contactExp <= 2;
          } else if (expRange === '3-5 ans') {
            return contactExp >= 3 && contactExp <= 5;
          } else if (expRange === '6-10 ans') {
            return contactExp >= 6 && contactExp <= 10;
          } else if (expRange === '11-15 ans') {
            return contactExp >= 11 && contactExp <= 15;
          } else if (expRange === '16-20 ans') {
            return contactExp >= 16 && contactExp <= 20;
          } else if (expRange === '20+ ans') {
            return contactExp > 20;
          }
          
          return false;
        }),
        
        // company_name (basé sur current_company_name ou experiences)
        filters.company_name.length === 0 || filters.company_name.some((company: string) => 
          contact.current_company_name?.toLowerCase().includes(company.toLowerCase()) ||
          contact.experiences?.some(exp => 
            exp.company_name?.toLowerCase().includes(company.toLowerCase())
          )
        ),
        
        
        // company_domain (utilise company_website_url)
        filters.company_domain.length === 0 || filters.company_domain.some((domain: string) => 
          contact.experiences?.some(exp => 
            exp.company_website_url?.toLowerCase().includes(domain.toLowerCase())
          )
        ),
        
        // company_industry (basé sur current_company_industry ou experiences)
        filters.company_industry.length === 0 || filters.company_industry.some((industry: string) => 
          contact.current_company_industry?.toLowerCase().includes(industry.toLowerCase()) ||
          contact.experiences?.some(exp => 
            exp.company_industry?.toLowerCase().includes(industry.toLowerCase())
          )
        ),
        
        // company_subindustry (basé sur les expériences)
        filters.company_subindustry.length === 0 || filters.company_subindustry.some((subindustry: string) => 
          contact.experiences?.some(exp => 
            exp.company_subindustry?.toLowerCase().includes(subindustry.toLowerCase())
          )
        ),
        
        // employees_count_growth (champ non disponible - filtre désactivé pour l'instant)
        true // Toujours true car ce champ n'existe pas dans les données
      ];

      return filterChecks.every(check => check);
    });
  }, [contacts, searchTerm, filters]);

  // Fonction pour formater les années d'expérience avec tranches
  const formatYearsOfExperience = (years: number | null | undefined) => {
    if (!years) return '-';
    
    if (years >= 0 && years <= 2) return '0-2 ans';
    if (years >= 3 && years <= 5) return '3-5 ans';
    if (years >= 6 && years <= 10) return '6-10 ans';
    if (years >= 11 && years <= 15) return '11-15 ans';
    if (years >= 16 && years <= 20) return '16-20 ans';
    if (years > 20) return '20+ ans';
    
    return `${years} ans`;
  };

  // Extraire les options de filtres depuis les contacts
  const extractFilterOptions = (contacts: Contact[]) => {
    const options = {
      full_name: [...new Set(contacts.map(c => c.full_name).filter(Boolean))] as string[],
      country: [...new Set(contacts.map(c => c.country).filter(Boolean))] as string[],
      headline: [...new Set(contacts.map(c => c.headline).filter(Boolean))] as string[],
      years_of_experience: (() => {
        const years = [...new Set(contacts.map(c => c.years_of_experience).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0));
        
        // Créer des tranches basées sur les données disponibles
        const tranches = [];
        
        // Vérifier quelles tranches ont des données
        const hasTranche1 = years.some(y => (y || 0) >= 0 && (y || 0) <= 2);
        const hasTranche2 = years.some(y => (y || 0) >= 3 && (y || 0) <= 5);
        const hasTranche3 = years.some(y => (y || 0) >= 6 && (y || 0) <= 10);
        const hasTranche4 = years.some(y => (y || 0) >= 11 && (y || 0) <= 15);
        const hasTranche5 = years.some(y => (y || 0) >= 16 && (y || 0) <= 20);
        const hasTranche6 = years.some(y => (y || 0) > 20);
        
        // Ajouter les tranches qui ont des données
        if (hasTranche1) tranches.push('0-2 ans');
        if (hasTranche2) tranches.push('3-5 ans');
        if (hasTranche3) tranches.push('6-10 ans');
        if (hasTranche4) tranches.push('11-15 ans');
        if (hasTranche5) tranches.push('16-20 ans');
        if (hasTranche6) tranches.push('20+ ans');
        
        return tranches as string[];
      })(),
      company_name: [...new Set([
        ...contacts.map(c => c.current_company_name).filter(Boolean),
        ...contacts.flatMap(c => c.experiences?.map(e => e.company_name) || []).filter(Boolean)
      ])] as string[],
      company_domain: [...new Set(
        contacts.flatMap(c => c.experiences?.map(e => e.company_website_url) || []).filter(Boolean)
      )] as string[],
      company_industry: [...new Set([
        ...contacts.map(c => c.current_company_industry).filter(Boolean),
        ...contacts.flatMap(c => c.experiences?.map(e => e.company_industry) || []).filter(Boolean)
      ])] as string[],
      company_subindustry: [...new Set([
        ...contacts.map(c => c.current_company_subindustry).filter(Boolean),
        ...contacts.flatMap(c => c.experiences?.map(e => e.company_subindustry) || []).filter(Boolean)
      ])] as string[],
      employees_count_growth: ['Croissance rapide', 'Croissance modérée', 'Stable', 'En déclin'] as string[]
    };
    console.log('Options de filtres extraites:', options);
    setFilterOptions(options);
  };

  // Charger toutes les options de filtres
  const loadFilterOptions = async () => {
    try {
      setLoadingOptions(true);
      // Charger un grand nombre de contacts pour avoir toutes les options
      const response = await contactsApi.getAll(1, 1000);
      console.log('Chargement des options de filtres...', response.contacts?.length, 'contacts');
      extractFilterOptions(response.contacts || []);
      
      // Mettre à jour le total de contacts
      console.log('Filter options response:', response);
      console.log('Filter options pagination:', response.pagination);
      setTotalCount(response.pagination?.total || response.pagination?.totalCount || 0);
      console.log('Total count set from filter options:', response.pagination?.total || response.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des options de filtres:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Charger les contacts
  const loadContacts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      let response;
      
      if (search.trim()) {
        response = await contactsApi.search(search, page, 20);
      } else {
        response = await contactsApi.getAll(page, 20);
      }
      
      console.log('Response from loadContacts:', response);
      console.log('Pagination:', response.pagination);
      
      setContacts(response.contacts || []);
      setTotalPages(response.pagination?.pages || response.pagination?.totalPages || 1);
      setTotalCount(response.pagination?.total || response.pagination?.totalCount || 0);
      
      console.log('Total pages set to:', response.pagination?.pages || response.pagination?.totalPages || 1);
      console.log('Total count set to:', response.pagination?.total || response.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des contacts', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les options de filtres au montage
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Charger le contenu des notes au montage (localStorage puis DB)
  useEffect(() => {
    const loadNotes = async () => {
      if (typeof window !== 'undefined' && notesRef.current) {
        // 1. Charger depuis localStorage (rapide)
        const localNotes = localStorage.getItem('crm-notes');
        if (localNotes) {
          notesRef.current.innerHTML = localNotes;
        }
        
        // 2. Charger depuis la DB (synchronisation)
        try {
          const response = await fetch('http://localhost:3003/api/notes');
      if (response.ok) {
        const data = await response.json();
            if (data.content && data.content !== localNotes) {
              // Si la DB a du contenu différent, l'utiliser
              notesRef.current.innerHTML = data.content;
              localStorage.setItem('crm-notes', data.content);
            }
      }
    } catch (error) {
          console.error('Erreur lors du chargement des notes depuis la DB:', error);
        }
      } else {
        setTimeout(loadNotes, 100);
      }
    };
    
    loadNotes();
  }, []);

  // Fonction pour sauvegarder en DB
  const saveToDatabase = async (content: string) => {
    try {
      await fetch('http://localhost:3003/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      } catch (error) {
      console.error('Erreur lors de la sauvegarde en DB:', error);
    }
  };

  // Sauvegarde avant fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (notesRef.current) {
        const content = notesRef.current.innerHTML;
        localStorage.setItem('crm-notes', content);
        // Sauvegarde immédiate en DB avant fermeture
        navigator.sendBeacon('http://localhost:3003/api/notes', 
          JSON.stringify({ content }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Fonction d'export CSV des résultats filtrés
  const exportFilteredToCSV = async () => {
    if (filteredContacts.length === 0) {
      setSnackbar({
        open: true,
        message: 'Aucun contact à exporter',
        severity: 'warning'
      });
      return;
    }

    try {
      // En-têtes CSV basés sur les champs de la base de données des contacts
      const headers = [
        'ID',
        'Nom complet',
        'Poste actuel',
        'Email',
        'Téléphone',
        'LinkedIn',
        'Pays',
        'Années d\'expérience',
        'Entreprise actuelle',
        'Secteur entreprise',
        'Sous-secteur entreprise',
        'Secteur entreprise',
        'Connexions LinkedIn',
        'Intérêts',
        'Historique',
        'Étape de suivi',
        'Date création',
        'Date modification'
      ];

      // Données CSV
      const csvData = filteredContacts.map((contact) => [
        contact.id || '',
        contact.full_name || '',
        contact.headline || '',
        contact.email || '',
        contact.telephone || '',
        contact.linkedin_url || '',
        contact.country || '',
        contact.years_of_experience || '',
        contact.current_company_name || '',
        contact.current_company_industry || '',
        contact.current_company_subindustry || '',
        contact.current_company_industry || '',
        contact.connections_count || '',
        contact.interests || '',
        contact.historic || '',
        contact.follow_up || '',
        contact.date_creation ? new Date(contact.date_creation).toLocaleDateString('fr-FR') : '',
        contact.date_modification ? new Date(contact.date_modification).toLocaleDateString('fr-FR') : ''
      ]);

      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) => row.map((field) => `"${field.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_filtres_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: `${filteredContacts.length} contact(s) filtré(s) exporté(s) avec succès`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export filtré:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export des contacts filtrés',
        severity: 'error'
      });
    }
  };

  // Fonction d'export CSV de la base complète
  const exportAllToCSV = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les contacts depuis l'API
      const response = await fetch(`http://localhost:3003/api/contacts?limit=10000&page=1`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const data = await response.json();
      const allContacts = data.contacts;

      if (allContacts.length === 0) {
        setSnackbar({
          open: true,
          message: 'Aucun contact à exporter',
          severity: 'warning'
        });
        return;
      }

      // En-têtes CSV basés sur les champs de la base de données des contacts
      const headers = [
        'ID',
        'Nom complet',
        'Poste actuel',
        'Email',
        'Téléphone',
        'LinkedIn',
        'Pays',
        'Années d\'expérience',
        'Entreprise actuelle',
        'Secteur entreprise',
        'Sous-secteur entreprise',
        'Secteur entreprise',
        'Connexions LinkedIn',
        'Intérêts',
        'Historique',
        'Étape de suivi',
        'Date création',
        'Date modification'
      ];

      // Données CSV
      const csvData = allContacts.map((contact: any) => [
        contact.id || '',
        contact.full_name || '',
        contact.headline || '',
        contact.email || '',
        contact.telephone || '',
        contact.linkedin_url || '',
        contact.country || '',
        contact.years_of_experience || '',
        contact.current_company_name || '',
        contact.current_company_industry || '',
        contact.current_company_subindustry || '',
        contact.current_company_industry || '',
        contact.connections_count || '',
        contact.interests || '',
        contact.historic || '',
        contact.follow_up || '',
        contact.date_creation ? new Date(contact.date_creation).toLocaleDateString('fr-FR') : '',
        contact.date_modification ? new Date(contact.date_modification).toLocaleDateString('fr-FR') : ''
      ]);

      // Créer le contenu CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) => row.map((field: any) => `"${field.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_complet_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({
        open: true,
        message: `${allContacts.length} contact(s) de la base complète exporté(s) avec succès`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export complet:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'export de la base complète',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'import JSON
  const handleImportJson = async () => {
    try {
      setLoading(true);
      
      // Demander le chemin du fichier à l'utilisateur
      const filePath = prompt('Entrez le chemin complet du fichier JSON à importer:');
      if (!filePath) {
        setSnackbar({
          open: true,
          message: 'Import annulé',
          severity: 'warning'
        });
        return;
      }

      // Appeler l'API d'import
      const result = await contactsApi.importFromJson(filePath);
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });

      // Recharger les contacts si l'import a réussi
      if (result.success) {
        loadContacts(currentPage, searchTerm);
        loadFilterOptions();
      }
    } catch (error) {
      console.error('Erreur lors de l\'import JSON:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'import JSON',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 handleDragOver appelé');
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 handleDragLeave appelé');
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    console.log('🔄 handleDrop appelé');
    const files = Array.from(e.dataTransfer.files);
    console.log('📁 Fichiers détectés:', files.length);
    
    if (files.length === 0) {
      console.log('❌ Aucun fichier détecté');
      return;
    }

    const file = files[0];
    console.log('📄 Fichier sélectionné:', file.name, 'Taille:', file.size);
    
    // Vérifier que c'est un fichier JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
      console.log('❌ Fichier non JSON:', file.name);
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner un fichier JSON',
        severity: 'error'
      });
      return;
    }
    
    console.log('✅ Fichier JSON valide, début du traitement');

    // Vérifier la taille du fichier (limite à 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Fichier trop volumineux (max 500MB)',
        severity: 'error'
      });
      return;
    }

    console.log('🚀 Appel de processFileImport');
    await processFileImport(file);
  };

  // Fonction pour traiter l'import de fichier
  const processFileImport = async (file: File) => {
    try {
      console.log('📥 processFileImport démarré pour:', file.name);
      setIsImporting(true);
      setImportProgress(0);

      // Lire le fichier en chunks pour éviter de bloquer l'UI
      const fileContent = await readFileAsText(file);
      setImportProgress(50);

      // Parser le JSON
      const jsonData = JSON.parse(fileContent);
      setImportProgress(75);

      if (!Array.isArray(jsonData)) {
        throw new Error('Le fichier JSON doit contenir un tableau de contacts');
      }

      // Traiter les données par chunks pour les gros fichiers
      const CHUNK_SIZE = 1000;
      const totalContacts = jsonData.length;
      let processedContacts = 0;
      let totalImported = 0;
      let totalErrors = 0;

      for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
        const chunk = jsonData.slice(i, i + CHUNK_SIZE);
        
        // Mettre à jour le progrès
        const progress = 75 + (processedContacts / totalContacts) * 20;
        setImportProgress(Math.min(progress, 95));
        
        try {
          const response = await fetch('http://localhost:3003/api/contacts/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonData: chunk })
          });

          if (!response.ok) {
            throw new Error(`Erreur lors de l'import du chunk ${Math.floor(i/CHUNK_SIZE) + 1}`);
          }

          const result = await response.json();
          totalImported += result.importedCount || 0;
          totalErrors += result.errorCount || 0;
          
        } catch (error) {
          console.error(`Erreur chunk ${Math.floor(i/CHUNK_SIZE) + 1}:`, error);
          totalErrors += chunk.length;
        }
        
        processedContacts += chunk.length;
      }

      setImportProgress(100);
      
      const result = {
        success: true,
        message: `Import terminé: ${totalImported} contacts importés, ${totalErrors} erreurs`,
        importedCount: totalImported,
        errorCount: totalErrors
      };

      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });

      // Recharger les contacts si l'import a réussi
      if (result.success) {
        loadContacts(currentPage, searchTerm);
        loadFilterOptions();
      }

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'import',
        severity: 'error'
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Fonction pour lire un fichier en tant que texte
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 25; // 25% pour la lecture
          setImportProgress(progress);
        }
      };

      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsText(file, 'utf-8');
    });
  };

  // Effet pour charger les contacts
  useEffect(() => {
    loadContacts(currentPage, searchTerm);
  }, [currentPage]);

  // Recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = window.setTimeout(() => {
      setCurrentPage(1);
      loadContacts(1, searchTerm);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Gestion des filtres
  const handleFilterChange = (filterKey: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const removeFilter = (filterKey: string, valueToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey as keyof typeof prev].filter((item: any) => item !== valueToRemove)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      full_name: [],
      country: [],
      headline: [],
      years_of_experience: [],
      company_name: [],
      company_domain: [],
      company_industry: [],
      company_subindustry: [],
      employees_count_growth: []
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);
  };

  // Gestion de la sélection
  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  // Navigation
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Affichage des contacts en cartes
  const renderContactCard = (contact: Contact) => (
    <Card key={contact.id} sx={{ mb: 2, p: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: 'primary.main',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.3)',
                zIndex: 1000,
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }
            }}
          >
            {contact.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" component="div">
              {contact.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.headline || contact.current_title_normalized || 'Poste non spécifié'}
            </Typography>
          </Box>
          <Checkbox
            checked={selectedContacts.includes(contact.id)}
            onChange={() => handleSelectContact(contact.id)}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {contact.email && (
            <Box sx={{ width: '50%', minWidth: '200px' }}>
              <Box display="flex" alignItems="flex-start">
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                <LongTextDisplay 
                  text={contact.email}
                  maxLength={80}
                  variant="body2"
                  color="textSecondary"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </Box>
          )}
          
          {contact.telephone && (
            <Box sx={{ width: '50%', minWidth: '200px' }}>
              <Box display="flex" alignItems="center">
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {contact.telephone}
                </Typography>
              </Box>
            </Box>
          )}

          {contact.location && (
            <Box sx={{ width: '50%', minWidth: '200px' }}>
              <Box display="flex" alignItems="center">
                <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {contact.location}
                </Typography>
              </Box>
            </Box>
          )}

          {contact.sector && (
            <Box sx={{ width: '50%', minWidth: '200px' }}>
              <Box display="flex" alignItems="center">
                <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {contact.sector}
                </Typography>
              </Box>
            </Box>
          )}

          {contact.companies && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Entreprises:</strong> {contact.companies}
              </Typography>
            </Box>
          )}

          {contact.follow_up && (
            <Box sx={{ width: '100%' }}>
              <Chip 
                label={contact.follow_up} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          startIcon={<ViewIcon />}
          onClick={() => navigate(`/contacts/${contact.id}`)}
        >
          Voir
        </Button>
        <Button 
          size="small" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/contacts/${contact.id}/edit`)}
        >
          Modifier
        </Button>
        <Button 
          size="small" 
          startIcon={<NotesIcon />}
          onClick={() => navigate(`/contacts/${contact.id}/notes`)}
        >
          Notes
        </Button>
      </CardActions>
    </Card>
  );

  // Affichage des contacts en tableau complet
  const renderContactTable = () => (
    <TableContainer component={Paper} sx={{ width: '100%' }}>
      <Table stickyHeader sx={{ minWidth: 800, '& .MuiTableRow-root': { height: '32px' } }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ width: '50px', height: '32px', padding: '4px 8px' }}>
              <Checkbox
                checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredContacts.length}
                onChange={handleSelectAll}
                size="small"
              />
            </TableCell>
          <TableCell sx={{ width: '60px', height: '32px', padding: '4px 8px' }}></TableCell>
          <TableCell sx={{ width: '20%', minWidth: '120px', height: '32px', padding: '4px 8px' }}>Nom complet</TableCell>
          <TableCell sx={{ width: '12%', minWidth: '80px', height: '32px', padding: '4px 8px' }}>Années exp.</TableCell>
          <TableCell sx={{ width: '20%', minWidth: '120px', height: '32px', padding: '4px 8px' }}>Entreprise actuelle</TableCell>
          <TableCell sx={{ width: '20%', minWidth: '120px', height: '32px', padding: '4px 8px' }}>Poste actuel</TableCell>
          <TableCell sx={{ width: '20%', minWidth: '120px', height: '32px', padding: '4px 8px' }}>Email</TableCell>
          <TableCell sx={{ width: '15%', minWidth: '100px', height: '32px', padding: '4px 8px' }}>LinkedIn</TableCell>
            <TableCell sx={{ width: '80px', height: '32px', padding: '4px 8px' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredContacts.map((contact) => (
            <TableRow 
              key={contact.id} 
              hover 
              sx={{ cursor: 'default' }}
            >
              <TableCell padding="checkbox" sx={{ height: '32px', padding: '4px 8px' }}>
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onChange={(e) => {
                    e.stopPropagation(); // Empêche le clic sur la ligne
                    handleSelectContact(contact.id);
                  }}
                  size="small"
                />
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                <Tooltip title={`Voir fiche contact: ${contact.full_name || 'Non renseigné'}`} arrow>
                <Avatar 
                  src={contact.profile_picture_url} 
                    sx={{ 
                      width: 24, 
                      height: 24,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        width: 48,
                        height: 48,
                        transform: 'scale(1.2)',
                        zIndex: 1000,
                        position: 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }
                    }}
                >
                  {contact.full_name?.charAt(0)}
                  </Avatar>
                </Tooltip>
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                <Tooltip title={contact.full_name || 'Non renseigné'} arrow>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="bold" 
                    sx={{ 
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {contact.full_name || 'Non renseigné'}
                </Typography>
                </Tooltip>
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                <Tooltip title={`${contact.years_of_experience || 0} ans d'expérience`} arrow>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      textAlign: 'center'
                    }}
                  >
                    {formatYearsOfExperience(contact.years_of_experience)}
                </Typography>
                </Tooltip>
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => {
                  if (contact.current_company_name) {
                    // Naviguer vers la liste des entreprises avec filtre sur le nom
                    navigate(`/companies?search=${encodeURIComponent(contact.current_company_name)}`);
                  }
                }}
              >
                <Tooltip title={contact.current_company_name ? `Voir fiche entreprise: ${contact.current_company_name}` : 'Non renseigné'} arrow>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      color: contact.current_company_name ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {contact.current_company_name || 'Non renseigné'}
                </Typography>
                </Tooltip>
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                <Tooltip title={contact.headline || 'Non renseigné'} arrow>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {contact.headline ? 
                      (contact.headline.length > 50 ? 
                        `${contact.headline.substring(0, 50)}...` : 
                        contact.headline
                      ) : 
                      'Non renseigné'
                    }
                </Typography>
                </Tooltip>
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                {contact.email ? (
                  <Tooltip title={`Voir fiche contact: ${contact.email}`} arrow>
                    <Typography 
                      color="primary" 
                      sx={{ 
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                    {contact.email}
                  </Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell 
                sx={{ height: '32px', padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => navigate(`/contacts/${contact.id}`)}
              >
                {contact.linkedin_url ? (
                  <Tooltip title={`Voir fiche contact: ${contact.linkedin_url}`} arrow>
                    <Typography 
                    color="primary"
                      sx={{ 
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                  >
                    LinkedIn
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
                  <Tooltip title="Modifier">
                    <IconButton 
                      size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche le clic sur la ligne
                      navigate(`/contacts/${contact.id}/edit`);
                    }}
                    sx={{ p: 0.25, minWidth: 'auto' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3, width: '100%', overflow: 'hidden' }}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', color: '#4CAF50' }}>
          📋 Contacts
          <IconButton
            onClick={() => navigate('/contacts/new')}
            sx={{
              ml: 2,
              backgroundColor: '#4CAF50',
              color: 'white',
              width: 32,
              height: 32,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#45a049',
                transform: 'scale(1.1)',
              }
            }}
          >
            +
          </IconButton>
        </Typography>
      </Box>

      {/* Mise en page 3 colonnes : Moteur (30%) + Export (20%) + Notes (50%) */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'stretch' }}>
        
        {/* BLOC 1: MOTEUR DE RECHERCHE (30%) */}
        <Box sx={{ width: '30%' }}>
          <Card sx={{ p: 1.5, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Box display="flex" alignItems="center">
                <FilterIcon sx={{ mr: 0.5, color: '#4CAF50', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Filtres
              </Typography>
                {getActiveFiltersCount() > 0 && (
                  <Badge badgeContent={getActiveFiltersCount()} color="primary" sx={{ ml: 1 }}>
                    <Chip 
                      label={`${getActiveFiltersCount()}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Badge>
                )}
              </Box>
            </Box>
            
            {/* Filtres actifs */}
            {getActiveFiltersCount() > 0 && (
              <Box mb={1.5}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  Filtres actifs:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                  {Object.entries(filters).map(([key, values]) => 
                    values.map((value: any) => (
                      <Chip
                        key={`${key}-${value}`}
                        label={`${key}: ${value}`}
                        onDelete={() => removeFilter(key, value)}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                    ))
                  )}
                  <Chip
                    label="Tout effacer"
                    onDelete={clearAllFilters}
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 22 }}
                  />
                </Box>
              </Box>
            )}

            {/* Filtres détaillés */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loadingOptions ? (
                <Box display="flex" justifyContent="center" p={1}>
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5, minHeight: '100%' }}>
                  {/* Section Critères Contact */}
                  <Card variant="outlined" sx={{ p: 1.5, bgcolor: '#f8f9fa', flex: 1, height: 'fit-content', overflow: 'visible' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                      Critères Contact
                    </Typography>
                    <Stack spacing={1.5}>
                      {/* Nom complet */}
                      <Autocomplete
                        multiple
                        freeSolo
                        options={filterOptions.full_name}
                        value={filters.full_name}
                        onChange={(_, value) => handleFilterChange('full_name', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Nom complet"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />

                      {/* Titre/Poste */}
        <TextField
          fullWidth
                        size="small"
                        label="Titre/Poste"
                        placeholder="Ex: CEO, Directeur, Manager..."
                        value={filters.headline.length > 0 ? filters.headline[0] : ''}
                        onChange={(e) => handleFilterChange('headline', e.target.value ? [e.target.value] : [])}
                        sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                              <WorkIcon sx={{ fontSize: 16 }} />
              </InputAdornment>
                          )
                        }}
                      />

                      {/* Pays */}
                      <Autocomplete
                        multiple
                        options={filterOptions.country}
                        value={filters.country}
                        onChange={(_, value) => handleFilterChange('country', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Pays"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationIcon sx={{ fontSize: 16 }} />
              </InputAdornment>
            )
          }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />

                      {/* Années d'expérience */}
                      <Autocomplete
                        multiple
                        options={filterOptions.years_of_experience}
                        value={filters.years_of_experience}
                        onChange={(_, value) => handleFilterChange('years_of_experience', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Années d'expérience"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                    <InputAdornment position="start">
                                  <BarChartIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />
                    </Stack>
                  </Card>

                  {/* Section Critères Entreprise des Contacts */}
                  <Card variant="outlined" sx={{ p: 1.5, bgcolor: '#f3e5f5', flex: 1, height: 'fit-content', overflow: 'visible' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                      <BusinessIcon sx={{ fontSize: 18 }} />
                      Critères Entreprise des Contacts
                    </Typography>
                    <Stack spacing={1.5}>
                      {/* Nom de l'entreprise */}
                      <Autocomplete
                        multiple
                        freeSolo
                        options={filterOptions.company_name}
                        value={filters.company_name}
                        onChange={(_, value) => handleFilterChange('company_name', value)}
                        renderInput={(params) => (
              <TextField
                            {...params}
                            label="Nom de l'entreprise"
                size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                InputProps={{
                              ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                                  <BusinessIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  )
                }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />

                      {/* Domaine de l'entreprise */}
                      <Autocomplete
                        multiple
                        options={filterOptions.company_domain}
                        value={filters.company_domain}
                        onChange={(_, value) => handleFilterChange('company_domain', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Domaine de l'entreprise"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                    <InputAdornment position="start">
                                  <BusinessIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />

                      {/* Secteur d'activité */}
                      <Autocomplete
                        multiple
                        freeSolo
                        options={filterOptions.company_industry}
                        value={filters.company_industry}
                        onChange={(_, value) => handleFilterChange('company_industry', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Secteur d'activité"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                    <InputAdornment position="start">
                                  <FactoryIcon sx={{ fontSize: 16 }} />
                    </InputAdornment>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />

                      {/* Sous-secteur */}
                      <Autocomplete
                        multiple
                        freeSolo
                        options={filterOptions.company_subindustry}
                        value={filters.company_subindustry}
                        onChange={(_, value) => handleFilterChange('company_subindustry', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sous-secteur"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <FactoryIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />

                      {/* Croissance employés */}
                      <Autocomplete
                        multiple
                        options={filterOptions.employees_count_growth}
                        value={filters.employees_count_growth}
                        onChange={(_, value) => handleFilterChange('employees_count_growth', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Croissance employés"
                            size="small"
                            sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BarChartIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))
                        }
                      />
            </Stack>
                  </Card>
                </Box>
              )}
            </Box>
          </Card>
          
          {/* Compteur de contacts */}
          <Typography variant="body2" sx={{ color: '#4CAF50', mt: 1, fontWeight: 500 }}>
            {filteredContacts.length.toLocaleString()} contacts filtrés sur {totalCount.toLocaleString()} total
          </Typography>
        </Box>

        {/* BLOC 2: IMPORT/EXPORT (20%) */}
        <Box sx={{ width: '20%' }}>
          <Card sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Stack spacing={2} sx={{ flex: 1 }}>
            {/* Import JSON */}
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <UploadIcon sx={{ mr: 1, color: '#FF9800' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Import JSON
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                Script: import-lemlist.js
              </Typography>
              <Box
                sx={{
                  border: isDragOver ? '2px dashed #4CAF50' : '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  cursor: 'pointer',
                  backgroundColor: isDragOver ? '#f0f8f0' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#4CAF50',
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleImportJson}
              >
                <UploadIcon sx={{ fontSize: 40, color: isDragOver ? '#4CAF50' : '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {isDragOver ? 'Relâchez le fichier JSON' : 'Glisser-déposer JSON ou cliquer'}
                </Typography>
                
                {/* Barre de progression */}
                {isImporting && (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={importProgress} 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {importProgress < 25 ? 'Lecture du fichier...' :
                       importProgress < 50 ? 'Traitement des données...' :
                       importProgress < 75 ? 'Parsing JSON...' :
                       importProgress < 100 ? 'Import en cours...' : 'Import terminé!'}
                </Typography>
                  </Box>
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={loading || isImporting}
                  sx={{
                    backgroundColor: '#FF9800',
                    '&:hover': {
                      backgroundColor: '#F57C00',
                    }
                  }}
                >
                  {isImporting ? 'Import en cours...' : loading ? 'Chargement...' : 'Importer JSON'}
                </Button>
              </Box>
            </Card>

            {/* Export CSV */}
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <DownloadIcon sx={{ mr: 1, color: '#2196F3' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Export CSV
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Exporter les contacts
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={exportFilteredToCSV}
                  disabled={filteredContacts.length === 0}
                  fullWidth
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#666'
                    }
                  }}
                >
                  Filtres ({filteredContacts.length.toLocaleString()})
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={exportAllToCSV}
                  disabled={loading}
                  fullWidth
                  size="small"
                  sx={{
                    backgroundColor: '#2196F3',
                    '&:hover': {
                      backgroundColor: '#1976D2',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#999'
                    }
                  }}
                >
                  Base complète
                </Button>
              </Stack>
            </Card>
          </Stack>
          </Card>
        </Box>

        {/* BLOC 3: BLOC NOTES (50%) */}
        <Box sx={{ width: '50%' }}>
          <Card sx={{ 
            p: 2, 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            📝 Bloc Notes
              </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button
                  size="small"
              variant="outlined"
              onClick={() => document.execCommand('bold')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem' }}
              title="Gras (Ctrl+B)"
            >
              <strong>B</strong>
                </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => document.execCommand('italic')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem' }}
              title="Italique (Ctrl+I)"
            >
              <em>I</em>
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => document.execCommand('underline')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem' }}
              title="Souligné (Ctrl+U)"
            >
              <u>U</u>
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => document.execCommand('foreColor', false, '#ff0000')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem', color: '#ff0000' }}
              title="Rouge (1)"
            >
              1
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => document.execCommand('foreColor', false, '#00ff00')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem', color: '#00ff00' }}
              title="Vert (2)"
            >
              2
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => document.execCommand('foreColor', false, '#0000ff')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem', color: '#0000ff' }}
              title="Bleu (3)"
            >
              3
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => document.execCommand('foreColor', false, '#000000')}
              sx={{ minWidth: 'auto', px: 1, fontSize: '0.7rem' }}
              title="Noir (0)"
            >
              0
            </Button>
            </Box>
        </Box>
        <Box
          ref={notesRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const content = e.currentTarget.innerHTML;
            // Sauvegarde immédiate dans localStorage
            localStorage.setItem('crm-notes', content);
            
            // Sauvegarde en DB avec debouncing (500ms)
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = window.setTimeout(() => {
              saveToDatabase(content);
            }, 500);
          }}
          onBlur={(e) => {
            const content = e.currentTarget.innerHTML;
            // Sauvegarde immédiate dans localStorage
            localStorage.setItem('crm-notes', content);
            // Sauvegarde immédiate en DB quand on quitte le champ
            saveToDatabase(content);
          }}
          onKeyDown={(e) => {
            // Raccourcis clavier
            if (e.ctrlKey) {
              switch (e.key.toLowerCase()) {
                case 'b':
                  e.preventDefault();
                  document.execCommand('bold');
                  break;
                case 'i':
                  e.preventDefault();
                  document.execCommand('italic');
                  break;
                case 'u':
                  e.preventDefault();
                  document.execCommand('underline');
                  break;
              }
            }
            // Couleurs avec clavier numérique
            if (e.key >= '0' && e.key <= '3') {
              e.preventDefault();
              const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff'];
              document.execCommand('foreColor', false, colors[parseInt(e.key)]);
            }
          }}
              sx={{
                flex: 1, // Prend tout l'espace disponible dans le Card
                overflow: 'auto', // Barre d'ascenseur verticale
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
                fontSize: '0.8rem',
                lineHeight: 1.5,
                outline: 'none',
                direction: 'ltr',
                textAlign: 'left',
                '&:focus': {
                  borderColor: '#1976d2',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                },
                '&:empty:before': {
                  content: '"Tapez vos notes ici... (Ctrl+B, Ctrl+I, Ctrl+U, 0-3 pour couleurs)"',
                  color: '#999',
                  fontStyle: 'italic'
                }
              }}
            />
          </Card>
        </Box>
      </Box>

      {/* Contenu principal - Tableau des contacts */}
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {viewMode === 'table' ? renderContactTable() : (
            <Box>
              {filteredContacts.map(renderContactCard)}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Box display="flex" gap={1}>
                <Button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Précédent
                </Button>
                <Typography variant="body2" alignSelf="center" mx={2}>
                  Page {currentPage} sur {totalPages}
                </Typography>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Suivant
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactsList;
