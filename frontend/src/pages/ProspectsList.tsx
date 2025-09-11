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
  Tooltip
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Prospect } from '../types';
import ContactModal from '../components/ContactModal';

const ProspectsList = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  
  // États pour l'import CSV
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');

  // Fonctions de gestion de la sélection multiple
  const handleSelectAll = () => {
    if (selectedContacts.length === filteredProspects.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredProspects.map(prospect => prospect.id));
    }
  };

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedContacts.length} contact(s) ?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      // Supprimer tous les contacts sélectionnés
      const deletePromises = selectedContacts.map(id => 
        fetch(`http://localhost:3003/api/prospects/${id}`, {
          method: 'DELETE',
        })
      );
      
      await Promise.all(deletePromises);
      
      // Mettre à jour la liste des contacts
      setProspects(prospects.filter(p => !selectedContacts.includes(p.id)));
      setSelectedContacts([]);
      
      setSnackbar({
        open: true,
        message: `${selectedContacts.length} contact(s) supprimé(s) avec succès`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression en masse',
        severity: 'error'
      });
    }
  };

  // Fonction pour vider le cache (utile pour le debug)

  // Fonction d'export CSV des résultats filtrés
  const exportFilteredToCSV = async () => {
    if (filteredCount === 0) {
      setSnackbar({
        open: true,
        message: 'Aucun contact à exporter',
        severity: 'warning'
      });
      return;
    }

    try {
      // Récupérer tous les prospects filtrés depuis l'API
      const filterParams = new URLSearchParams();
      
      // Recherche textuelle combinée
      const searchTerm = [nomCompletFilter, libellePosteFilter, nomEntrepriseFilter]
        .filter(Boolean)
        .join(' ');
      if (searchTerm) {
        filterParams.append('search', searchTerm);
      }
      
      // Filtres par catégorie de poste
      if (categoriePosteFilter.length > 0) {
        filterParams.append('categorie_poste', categoriePosteFilter[0]);
      }
      
      // Filtres par taille d'entreprise
      if (tailleEntrepriseFilter.length > 0) {
        filterParams.append('taille_entreprise', tailleEntrepriseFilter[0]);
      }
      
      // Filtres par secteur
      if (secteurFilter.length > 0) {
        filterParams.append('secteur', secteurFilter[0]);
      }

      // Récupérer TOUS les résultats filtrés (pas de pagination)
      filterParams.append('limit', '10000'); // Limite très élevée pour récupérer tous les résultats
      filterParams.append('page', '1');

      const response = await fetch(`http://localhost:3003/api/prospects/filter?${filterParams.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données filtrées');
      }
      
      const data = await response.json();
      const allFilteredProspects = data.prospects;

    // En-têtes CSV
    const headers = [
      'Nom complet',
      'Catégorie de poste',
      'Libellé du poste',
      'Email',
      'LinkedIn',
      'Entreprise', 
      'Taille entreprise',
      'Secteur',
      'Étape de suivi',
      'Intérêts',
      'Historique',
      'Date création'
    ];

    // Données CSV
      const csvData = allFilteredProspects.map((prospect: any) => [
      prospect.nom_complet || '',
      prospect.categorie_poste || '',
      prospect.poste_specifique || '',
      prospect.email || '',
      prospect.linkedin || '',
      prospect.entreprise || '',
      prospect.taille_entreprise || '',
      prospect.secteur || '',
      prospect.etape_suivi || '',
      prospect.interets || '',
      prospect.historique || '',
      prospect.date_creation ? new Date(prospect.date_creation).toLocaleDateString('fr-FR') : ''
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
      link.setAttribute('download', `contacts_filtres_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({
      open: true,
        message: `${allFilteredProspects.length} contact(s) filtré(s) exporté(s) avec succès`,
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
      
      // Récupérer tous les prospects depuis l'API
      const response = await fetch(`http://localhost:3003/api/prospects?limit=10000&page=1`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const data = await response.json();
      const allProspects = data.prospects;

      if (allProspects.length === 0) {
      setSnackbar({
        open: true,
        message: 'Aucun contact à exporter',
        severity: 'warning'
      });
      return;
    }

    // En-têtes CSV
    const headers = [
      'Nom complet',
      'Catégorie de poste',
      'Libellé du poste',
      'Email',
      'LinkedIn',
      'Entreprise', 
      'Taille entreprise',
      'Secteur',
      'Étape de suivi',
      'Intérêts',
      'Historique',
      'Date création'
    ];

    // Données CSV
      const csvData = allProspects.map((prospect: any) => [
      prospect.nom_complet || '',
      prospect.categorie_poste || '',
      prospect.poste_specifique || '',
      prospect.email || '',
      prospect.linkedin || '',
      prospect.entreprise || '',
      prospect.taille_entreprise || '',
      prospect.secteur || '',
      prospect.etape_suivi || '',
      prospect.interets || '',
      prospect.historique || '',
      prospect.date_creation ? new Date(prospect.date_creation).toLocaleDateString('fr-FR') : ''
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
        message: `${allProspects.length} contact(s) de la base complète exporté(s) avec succès`,
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

  // Fonction pour capitaliser chaque mot et gérer les acronymes
  const capitalizeWords = (text: string | undefined): string => {
    if (!text) return '-';
    
    // Liste des acronymes à mettre en majuscules
    const acronyms = ['CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CPO', 'CRO', 'CHRO', 'CIO', 'CDO', 'VP', 'SVP', 'EVP', 'GM', 'PM', 'HR', 'IT', 'R&D', 'QA', 'UX', 'UI', 'API', 'CRM', 'ERP', 'SaaS', 'B2B', 'B2C', 'KPI', 'ROI', 'SEO', 'SEM', 'GDPR', 'ISO', 'AI', 'ML', 'IoT', 'AR', 'VR', 'NFT', 'IPO', 'M&A'];
    
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Vérifier si le mot est un acronyme
        const upperWord = word.toUpperCase();
        if (acronyms.includes(upperWord)) {
          return upperWord;
        }
        // Sinon, capitaliser normalement
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };
  const [nomCompletFilter, setNomCompletFilter] = useState('');
  const [libellePosteFilter, setLibellePosteFilter] = useState('');
  const [nomEntrepriseFilter, setNomEntrepriseFilter] = useState('');
  const [secteurFilter, setSecteurFilter] = useState<string[]>([]);
  const [categoriePosteFilter, setCategoriePosteFilter] = useState<string[]>([]);
  const [tailleEntrepriseFilter, setTailleEntrepriseFilter] = useState<string[]>([]);
  const [categoriesPoste, setCategoriesPoste] = useState<Array<{id: number, nom: string}>>([]);
  const [taillesEntreprise, setTaillesEntreprise] = useState<Array<{id: number, nom: string}>>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspects();
    fetchReferenceData();
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

  // Appliquer les filtres depuis l'URL au chargement

  const fetchProspects = async () => {
    try {
        setLoading(true);

      // Charger TOUS les contacts d'un coup (pas de pagination côté serveur)
      const response = await fetch(`http://localhost:3003/api/prospects?page=1&limit=10000`);
      if (response.ok) {
        const data = await response.json();
          setProspects(data.prospects);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      // Vérifier le cache pour les données de référence
      const cachedCategories = sessionStorage.getItem('categories-cache');
      const cachedTailles = sessionStorage.getItem('tailles-cache');
      const cachedSecteurs = sessionStorage.getItem('secteurs-cache');
      
      if (cachedCategories && cachedTailles && cachedSecteurs) {
        setCategoriesPoste(JSON.parse(cachedCategories));
        setTaillesEntreprise(JSON.parse(cachedTailles));
        setSecteurs(JSON.parse(cachedSecteurs));
        console.log('✅ Données de référence chargées depuis le cache');
        return;
      }

      console.log('🔄 Chargement des données de référence depuis l\'API...');
      const [categoriesRes, taillesRes, secteursRes] = await Promise.all([
        fetch('http://localhost:3003/api/categories-poste'),
        fetch('http://localhost:3003/api/tailles-entreprise'),
        fetch('http://localhost:3003/api/secteurs')
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategoriesPoste(data);
        sessionStorage.setItem('categories-cache', JSON.stringify(data));
      }
      if (taillesRes.ok) {
        const data = await taillesRes.json();
        setTaillesEntreprise(data);
        sessionStorage.setItem('tailles-cache', JSON.stringify(data));
      }
      if (secteursRes.ok) {
        const data = await secteursRes.json();
        setSecteurs(data);
        sessionStorage.setItem('secteurs-cache', JSON.stringify(data));
      }
      console.log('✅ Données de référence chargées depuis l\'API et mises en cache');
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    }
  };



  // Gestion des actions (etape_suivi)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedActionProspectId, setSelectedActionProspectId] = useState<number | null>(null);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, prospectId: number) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedActionProspectId(prospectId);
  };

  const handleActionChange = async (newAction: string) => {
    if (!selectedActionProspectId) return;
    
    try {
      const prospect = prospects.find(p => p.id === selectedActionProspectId);
      if (!prospect) return;

      const response = await fetch(`http://localhost:3003/api/prospects/${selectedActionProspectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prospect,
          etape_suivi: newAction
        }),
      });

      if (response.ok) {
        setProspects(prospects.map(p => 
          p.id === selectedActionProspectId ? { ...p, etape_suivi: newAction as Prospect['etape_suivi'] } : p
        ));
        setSnackbar({
          open: true,
          message: 'Étape de suivi mise à jour avec succès',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'action:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour',
        severity: 'error'
      });
    } finally {
      setActionMenuAnchor(null);
      setSelectedActionProspectId(null);
    }
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedActionProspectId(null);
  };

  // Fonctions pour la modal
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    // Recharger tous les contacts
    setProspects([]);
    fetchProspects();
  };

  // Fonctions d'import CSV
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const mapCSVToProspect = (csvRow: any): Partial<Prospect> => {
    // Mapper les colonnes CSV vers les champs de la base de données
    const emails = [];
    
    // Noms exacts des colonnes email selon votre spécification
    const emailColumns = [
      'Email_1_75', 'Email_2_70', 'Email_3_67', 'Email_4_63', 'Email_5_61',
      'Email_6_59', 'Email_7_60', 'Email_8_57', 'Email_9_57', 'Email_10_55', 'Email_11_52'
    ];
    
    for (const columnName of emailColumns) {
      const email = csvRow[columnName];
      if (email && email.trim()) {
        emails.push(email.trim());
      }
    }
    
    // Concaténer tous les emails avec des points-virgules
    const allEmails = emails.join(';');
    
    return {
      nom_complet: csvRow['Nom complet'] || '',
      entreprise: csvRow['Entreprise'] || '',
      categorie_poste: csvRow['Catégorie de poste'] || '',
      poste_specifique: csvRow['Poste spécifique'] || '',
      pays: csvRow['Pays'] || '',
      taille_entreprise: csvRow['Taille de l\'entreprise'] || '',
      site_web: csvRow['Site web'] || '',
      secteur: csvRow['Secteur'] || '',
      email: allEmails, // Tous les emails concaténés avec ';'
      interets: '' // Pas besoin de stocker les emails dans les intérêts
    };
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner un fichier CSV',
        severity: 'error'
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportMessage('Lecture du fichier...');

    try {
      const text = await file.text();
      const csvData = parseCSV(text);
      
      if (csvData.length === 0) {
        throw new Error('Aucune donnée valide trouvée dans le fichier CSV');
      }

      setImportMessage(`Import de ${csvData.length} contacts...`);
      
      // Traiter par lots de 50 contacts
      const batchSize = 50;
      let imported = 0;
      
      for (let i = 0; i < csvData.length; i += batchSize) {
        const batch = csvData.slice(i, i + batchSize);
        const prospects = batch.map(mapCSVToProspect);
        
        // Envoyer le lot au serveur
        const response = await fetch('http://localhost:3003/api/prospects/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prospects)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur lors de l'import du lot ${Math.floor(i/batchSize) + 1}`);
        }
        
        imported += batch.length;
        setImportProgress((imported / csvData.length) * 100);
        setImportMessage(`Importé ${imported}/${csvData.length} contacts...`);
      }
      
      setSnackbar({
        open: true,
        message: `Import réussi ! ${imported} contacts ajoutés`,
        severity: 'success'
      });
      
      // Recharger tous les contacts
      setProspects([]);
      fetchProspects();
      
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setSnackbar({
        open: true,
        message: `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        severity: 'error'
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };


  // Extraction des valeurs uniques pour les filtres
  const uniqueSecteurs = useMemo(() => 
    [...new Set(prospects.map(p => p.secteur).filter(Boolean))], [prospects]
  );



  // Moteur de recherche simple
  const [searchTerm, setSearchTerm] = useState('');
  
  // Réinitialiser la page quand on filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoriePosteFilter, tailleEntrepriseFilter, secteurFilter]);
  
  // Filtrage complet côté client
  const filteredProspects = useMemo(() => {
    let filtered = prospects;
    
    // Filtre par recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prospect => 
        prospect.nom_complet?.toLowerCase().includes(term) ||
        prospect.entreprise?.toLowerCase().includes(term) ||
        prospect.email?.toLowerCase().includes(term) ||
        prospect.poste_specifique?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par catégorie de poste
    if (categoriePosteFilter.length > 0) {
      filtered = filtered.filter(prospect => 
        prospect.categorie_poste && categoriePosteFilter.includes(prospect.categorie_poste)
      );
    }
    
    // Filtre par taille d'entreprise
    if (tailleEntrepriseFilter.length > 0) {
      filtered = filtered.filter(prospect => 
        prospect.taille_entreprise && tailleEntrepriseFilter.includes(prospect.taille_entreprise)
      );
    }
    
    // Filtre par secteur
    if (secteurFilter.length > 0) {
      filtered = filtered.filter(prospect => 
        prospect.secteur && secteurFilter.includes(prospect.secteur)
      );
    }
    
    return filtered;
  }, [prospects, searchTerm, categoriePosteFilter, tailleEntrepriseFilter, secteurFilter]);
  
  // Compteur pour l'affichage
  const filteredCount = filteredProspects.length;

  const clearSearch = () => {
    setSearchTerm('');
    setCategoriePosteFilter([]);
    setTailleEntrepriseFilter([]);
    setSecteurFilter([]);
  };

  // Pagination simple
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProspects = filteredProspects.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };



  const getActionColor = (action: string) => {
    switch (action) {
      case 'OK': return { bg: '#e8f5e8', color: '#2e7d32' };
      case 'KO': return { bg: '#ffebee', color: '#c62828' };
      case 'entretien 1':
      case 'entretien 2':
      case 'entretien 3': return { bg: '#e3f2fd', color: '#1565c0' };
      case 'call effectué': return { bg: '#fff8e1', color: '#f57f17' };
      case 'email envoyé':
      case 'linkedin envoyé': return { bg: '#f3e5f5', color: '#7b1fa2' };
      default: return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Chargement des contacts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#4CAF50', display: 'flex', alignItems: 'center' }}>
          📋 Contacts
          <IconButton
            onClick={() => setModalOpen(true)}
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
      <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
        
        {/* Colonne 1 - Moteur de recherche (30%) */}
        <Box sx={{ width: '30%' }}>
          {/* Moteur de recherche */}
          <Card sx={{ 
            p: 2, 
            pb: 1, // Réduction du padding bottom
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 'fit-content', // Ajustement automatique à la hauteur du contenu
            maxHeight: '300px', // Hauteur maximale réduite
            '& .MuiTextField-root': { fontSize: '0.7rem', '& .MuiInputBase-root': { height: '31px' } },
            '& .MuiInputLabel-root': { fontSize: '0.7rem' },
            '& .MuiInputBase-input': { fontSize: '0.7rem', py: 0.25, display: 'flex', alignItems: 'center', height: '100%' },
            '& .MuiFormControl-root': { fontSize: '0.7rem', '& .MuiInputBase-root': { height: '31px' } },
            '& .MuiSelect-select': { fontSize: '0.7rem', py: 0.25, display: 'flex', alignItems: 'center', height: '100%' },
            '& .MuiMenuItem-root': { fontSize: '0.55rem', py: 0.25, display: 'flex', alignItems: 'center', minHeight: '20px' },
            '& .MuiPaper-root .MuiMenuItem-root': { fontSize: '0.55rem', py: 0.25, minHeight: '20px' },
            '& .MuiPopover-root .MuiMenuItem-root': { fontSize: '0.55rem', py: 0.25, minHeight: '20px' },
            '& .MuiTypography-h6': { fontSize: '0.8rem' },
            '& .MuiButton-root': { fontSize: '0.65rem', py: 0.25, display: 'flex', alignItems: 'center', height: '31px' },
            '& .MuiChip-root': { fontSize: '0.6rem', height: '20px' },
            '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 }
          }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 0.5, color: '#4CAF50', fontSize: 20 }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.8rem' }}>
              🔍 Moteur de recherche
          </Typography>
          {(searchTerm || categoriePosteFilter.length > 0 || tailleEntrepriseFilter.length > 0 || secteurFilter.length > 0) && (
            <Button
                startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
              onClick={clearSearch}
              variant="outlined"
              size="small"
              color="secondary"
                sx={{ borderRadius: 1, minWidth: 'auto', px: 1 }}
            >
                Effacer
            </Button>
          )}
        </Box>

          {/* Champ de recherche simple */}
          <Box sx={{ mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="🔍 Rechercher (nom, entreprise, email, poste)"
              placeholder="Tapez pour rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 14 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Ligne 2 - Catégorie de poste et Libellé de poste */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>💼 Catégorie de poste</InputLabel>
              <Select
                multiple
                value={categoriePosteFilter}
                label="Catégorie de poste"
                onChange={(e) => setCategoriePosteFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontSize: '0.65rem',
                        py: 0.25,
                        minHeight: '22px'
                      }
                    }
                  }
                }}
              >
                {categoriesPoste.map((categorie) => (
                  <MenuItem key={categorie.id} value={categorie.nom}>
                    {categorie.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
                      size="small"
              label="📋 Libellé de poste"
              placeholder="CEO, Directeur..."
              value={libellePosteFilter}
              onChange={(e) => setLibellePosteFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 14 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Ligne 3 - Taille entreprise et Secteur */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>📊 Taille entreprise</InputLabel>
              <Select
                multiple
                value={tailleEntrepriseFilter}
                label="Taille entreprise"
                onChange={(e) => setTailleEntrepriseFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontSize: '0.65rem',
                        py: 0.25,
                        minHeight: '22px'
                      }
                    }
                  }
                }}
              >
                {taillesEntreprise.map((taille) => (
                  <MenuItem key={taille.id} value={taille.nom}>
                    {taille.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>🏭 Secteur</InputLabel>
              <Select
                multiple
                value={secteurFilter}
                label="Secteur"
                onChange={(e) => setSecteurFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontSize: '0.65rem',
                        py: 0.25,
                        minHeight: '22px'
                      }
                    }
                  }
                }}
              >
                {uniqueSecteurs.map((secteur) => (
                  <MenuItem key={secteur} value={secteur}>
                    {secteur}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
        </Box>

          {/* Chips des filtres actifs */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, mb: 0 }}>
            {nomCompletFilter && (
              <Chip 
                label={`👤 ${nomCompletFilter}`} 
                onDelete={() => setNomCompletFilter('')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {nomEntrepriseFilter && (
              <Chip 
                label={`🏢 ${nomEntrepriseFilter}`} 
                onDelete={() => setNomEntrepriseFilter('')}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
            {categoriePosteFilter.map((categorie) => (
              <Chip 
                key={categorie}
                label={`💼 ${categorie}`} 
                onDelete={() => setCategoriePosteFilter(categoriePosteFilter.filter(c => c !== categorie))}
                color="success"
                variant="outlined"
                size="small"
              />
            ))}
            {libellePosteFilter && (
              <Chip 
                label={`📋 ${libellePosteFilter}`} 
                onDelete={() => setLibellePosteFilter('')}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            {tailleEntrepriseFilter.map((taille) => (
          <Chip 
                key={taille}
                label={`📊 ${taille}`} 
                onDelete={() => setTailleEntrepriseFilter(tailleEntrepriseFilter.filter(t => t !== taille))}
                color="warning"
            variant="outlined"
                size="small"
          />
            ))}
            {secteurFilter.map((secteur) => (
          <Chip 
                key={secteur}
                label={`🏭 ${secteur}`} 
                onDelete={() => setSecteurFilter(secteurFilter.filter(s => s !== secteur))}
                color="default"
            variant="outlined"
                size="small"
          />
            ))}
        </Box>
      </Card>

        </Box>

        {/* Colonne 2 - Import/Export CSV (20%) */}
        <Box sx={{ width: '20%' }}>
          {/* Import CSV */}
          <Card sx={{ 
            p: 2, 
            pb: 1,
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 'fit-content',
            maxHeight: '140px',
            mb: 1,
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '140px'
          }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem', textAlign: 'center' }}>
              📥 Import CSV
            </Typography>
            
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: isDragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" style={{ cursor: 'pointer', width: '100%' }}>
                <UploadIcon sx={{ fontSize: '1.5rem', mb: 1, color: '#666' }} />
                <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#666' }}>
                  Glisser-déposer ou cliquer
                </Typography>
              </label>
              
              {isImporting && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={importProgress} 
                    sx={{ mb: 1, height: 4, borderRadius: 2 }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#666' }}>
                    {importMessage}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Export CSV */}
          <Card sx={{ 
            p: 2, 
            pb: 1,
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 'fit-content',
            maxHeight: '140px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '140px'
          }}>
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                📊 Export CSV
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 2 }}>
                Exporter les contacts
              </Typography>
              
              {/* Boutons d'export côte à côte */}
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                {/* Export filtré */}
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                  onClick={exportFilteredToCSV}
                  disabled={filteredCount === 0}
                  size="small"
                sx={{
                  backgroundColor: '#4CAF50',
                  fontSize: '0.7rem',
                    py: 0.5,
                  '&:hover': {
                    backgroundColor: '#45a049',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                  Filtres ({filteredCount})
                </Button>
                
                {/* Export complet */}
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={exportAllToCSV}
                  disabled={loading}
                  size="small"
                  sx={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    fontSize: '0.7rem',
                    py: 0.5,
                    '&:hover': {
                      backgroundColor: '#1976D2',
                      color: 'white',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#999'
                    }
                  }}
                >
                  Base complète
              </Button>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Colonne 3 - Bloc Notes (50%) */}
        <Box sx={{ width: '50%' }}>
          <Card sx={{ 
            p: 2, 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            height: 'fit-content',
            maxHeight: '300px',
            minHeight: '300px',
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

      {/* Total des contacts */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        py: 1,
        mb: 2
      }}>
        <Typography variant="body1" sx={{ 
          fontWeight: 600, 
          color: '#4CAF50',
          fontSize: '0.9rem'
        }}>
          📊 {filteredCount} contact{filteredCount > 1 ? 's' : ''} filtré{filteredCount > 1 ? 's' : ''} sur {prospects.length} total
        </Typography>
        
      </Box>

      {/* Barre d'actions en masse */}
      {selectedContacts.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          mb: 2,
          backgroundColor: '#fff3e0',
          borderRadius: 2,
          border: '1px solid #ffb74d'
        }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            color: '#e65100',
            fontSize: '0.85rem'
          }}>
            📋 {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedContacts([])}
              sx={{ 
                fontSize: '0.75rem',
                py: 0.5,
                px: 1.5
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              sx={{ 
                fontSize: '0.75rem',
                py: 0.5,
                px: 1.5
              }}
            >
              Supprimer ({selectedContacts.length})
            </Button>
          </Box>
        </Box>
      )}

      {/* Indicateur de chargement initial */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 4,
          mt: 3,
          backgroundColor: '#f5f5f5',
          borderRadius: 2
        }}>
          <Typography variant="h6" sx={{ color: '#666' }}>
            🚀 Chargement des premiers contacts...
          </Typography>
        </Box>
      )}


      {!loading && (
        <TableContainer component={Paper} sx={{ maxHeight: 'none', overflow: 'visible', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mt: 3 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 50, py: 0.5, fontSize: '0.65rem' }}>
                <Checkbox
                  checked={selectedContacts.length === filteredProspects.length && filteredProspects.length > 0}
                  indeterminate={selectedContacts.length > 0 && selectedContacts.length < filteredProspects.length}
                  onChange={handleSelectAll}
                  size="small"
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 200, py: 0.5, fontSize: '0.65rem' }}>
                👤 Nom complet
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 120, py: 0.5, fontSize: '0.65rem' }}>
                📋 Catégorie
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 150, py: 0.5, fontSize: '0.65rem' }}>
                💼 Libellé du poste
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 250, py: 0.5, fontSize: '0.65rem' }}>
                📧 Email
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 180, py: 0.5, fontSize: '0.65rem' }}>
                🏢 Entreprise
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 100, py: 0.5, fontSize: '0.65rem' }}>
                📊 Taille
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 120, py: 0.5, fontSize: '0.65rem' }}>
                🏭 Secteur
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 100, py: 0.5, fontSize: '0.65rem' }}>
                🎯 Étape
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCount === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    {prospects.length === 0 ? '📭 Aucun contact trouvé' : '🔍 Aucun contact ne correspond aux filtres'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentProspects.map((prospect) => (
                <TableRow 
                  key={prospect.id} 
                  hover
                  onClick={() => navigate(`/prospects/${prospect.id}/edit`)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    }
                  }}
                >
                  {/* Checkbox */}
                  <TableCell sx={{ py: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedContacts.includes(prospect.id)}
                      onChange={() => handleSelectContact(prospect.id)}
                      size="small"
                    />
                  </TableCell>
                  
                  {/* Nom complet */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Avatar sx={{ bgcolor: '#4CAF50', width: 20, height: 20 }}>
                        <PersonIcon sx={{ fontSize: 12 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.65rem', lineHeight: 1.1 }}>
                        {capitalizeWords(prospect.nom_complet)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Catégorie de poste */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>
                        {prospect.categorie_poste || '-'}
                    </Typography>
                    </Box>
                  </TableCell>

                  {/* Libellé du poste */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>
                        {capitalizeWords(prospect.poste_specifique)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Email */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      {prospect.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <EmailIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
                          <Tooltip 
                            title={prospect.email} 
                            placement="top"
                            arrow
                            sx={{
                              '& .MuiTooltip-tooltip': {
                                fontSize: '0.75rem',
                                maxWidth: '400px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                              }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.55rem', 
                                lineHeight: 1.1,
                                cursor: 'help',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {prospect.email.split(';')[0]}
                              {prospect.email.split(';').length > 1 && (
                                <span style={{ color: '#666', fontSize: '0.5rem' }}>
                                  {' '}(+{prospect.email.split(';').length - 1})
                                </span>
                              )}
                            </Typography>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </TableCell>


                  {/* Entreprise */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>
                        {capitalizeWords(prospect.entreprise)}
                      </Typography>
                      {prospect.site_web && (
                        <Link 
                          href={prospect.site_web} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ fontSize: '0.55rem', color: '#1976d2', textDecoration: 'none', display: 'block', mt: 0.25, lineHeight: 1.1 }}
                        >
                          {prospect.site_web}
                        </Link>
                      )}
                    </Box>
                  </TableCell>

                  {/* Taille entreprise */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>
                        {prospect.taille_entreprise || '-'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Secteur */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>
                        {prospect.secteur || '-'}
                      </Typography>
                    </Box>
                  </TableCell>



                  {/* Étape */}
                  <TableCell sx={{ py: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <Box
                      onClick={(e) => handleActionClick(e, prospect.id)}
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        backgroundColor: getActionColor(prospect.etape_suivi || '').bg,
                        color: getActionColor(prospect.etape_suivi || '').color,
                        fontSize: '0.55rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.25,
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {prospect.etape_suivi || 'à contacter'}
                      <ArrowDropDownIcon sx={{ fontSize: 12 }} />
                    </Box>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Pagination */}
      {!loading && filteredProspects.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 3, mb: 2 }}>
          {/* Indicateur de page */}
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} sur {totalPages} • {filteredProspects.length} contact{filteredProspects.length > 1 ? 's' : ''}
          </Typography>
          
          {/* Boutons de navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              startIcon={<ArrowBackIcon />}
            >
              Précédent
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "contained" : "outlined"}
                    size="small"
                    onClick={() => goToPage(pageNum)}
                    sx={{ minWidth: 40 }}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              endIcon={<ArrowForwardIcon />}
            >
              Suivant
            </Button>
          </Box>
        </Box>
      )}

      {/* Indicateur de pagination en bas */}
      {!loading && prospects.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 2,
          mt: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
            📄 Tous les contacts sont chargés ({prospects.length} contacts)
          </Typography>
        </Box>
      )}


      {/* Menu déroulant pour changer les actions */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleActionChange('à contacter')}>
          <Chip
            label="à contacter" 
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              color: '#757575',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('linkedin envoyé')}>
          <Chip 
            label="linkedin envoyé" 
            size="small"
            sx={{
              backgroundColor: '#f3e5f5',
              color: '#7b1fa2',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('email envoyé')}>
          <Chip 
            label="email envoyé" 
            size="small"
            sx={{
              backgroundColor: '#f3e5f5',
              color: '#7b1fa2',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('call effectué')}>
          <Chip 
            label="call effectué" 
            size="small"
            sx={{
              backgroundColor: '#fff8e1',
              color: '#f57f17',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('entretien 1')}>
          <Chip 
            label="entretien 1" 
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('entretien 2')}>
          <Chip 
            label="entretien 2" 
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('entretien 3')}>
          <Chip 
            label="entretien 3" 
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('OK')}>
          <Chip 
            label="OK" 
            size="small"
            sx={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleActionChange('KO')}>
          <Chip 
            label="KO" 
            size="small"
            sx={{
              backgroundColor: '#ffebee',
              color: '#c62828',
            }}
          />
        </MenuItem>
      </Menu>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal pour créer un nouveau contact */}
      <ContactModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
};

export default ProspectsList;