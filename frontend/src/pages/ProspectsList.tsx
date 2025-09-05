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
  Card,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  Avatar,
  Link,
  Checkbox
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Download as DownloadIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Prospect } from '../types';
import ContactModal from '../components/ContactModal';

const ProspectsList = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

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

  // Fonction d'export CSV
  const exportToCSV = () => {
    if (filteredProspects.length === 0) {
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
      'Téléphone',
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
    const csvData = filteredProspects.map(prospect => [
      prospect.nom_complet || '',
      prospect.categorie_poste || '',
      prospect.poste_specifique || '',
      prospect.email || '',
      prospect.telephone || '',
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
      ...csvData.map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({
      open: true,
      message: `${filteredProspects.length} contact(s) exporté(s) avec succès`,
      severity: 'success'
    });
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
      // Vérifier le cache d'abord
      const cachedData = sessionStorage.getItem('prospects-cache');
      if (cachedData && !cacheLoaded) {
        const data = JSON.parse(cachedData);
        setProspects(data);
        setCacheLoaded(true);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3003/api/prospects');
      if (response.ok) {
        const data = await response.json();
        setProspects(data);
        // Mettre en cache pour les prochaines fois
        sessionStorage.setItem('prospects-cache', JSON.stringify(data));
        setCacheLoaded(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
              const [categoriesRes, taillesRes] = await Promise.all([
          fetch('http://localhost:3003/api/categories-poste'),
          fetch('http://localhost:3003/api/tailles-entreprise')
        ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategoriesPoste(data);
      }
      if (taillesRes.ok) {
        const data = await taillesRes.json();
        setTaillesEntreprise(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de référence:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      try {
        const response = await fetch(`http://localhost:3003/api/prospects/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setProspects(prospects.filter(p => p.id !== id));
          setSnackbar({
            open: true,
            message: 'Contact supprimé avec succès',
            severity: 'success'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression',
          severity: 'error'
        });
      }
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
    // Invalider le cache et recharger
    sessionStorage.removeItem('prospects-cache');
    setCacheLoaded(false);
    fetchProspects(); // Recharger la liste des contacts
  };


  // Extraction des valeurs uniques pour les filtres
  const uniqueSecteurs = useMemo(() => 
    [...new Set(prospects.map(p => p.secteur).filter(Boolean))], [prospects]
  );

  // Filtrage des prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      // Recherche multicritère
      const nomCompletMatch = !nomCompletFilter || 
        prospect.nom_complet?.toLowerCase().includes(nomCompletFilter.toLowerCase());
      
      const libellePosteMatch = !libellePosteFilter || 
        prospect.poste_specifique?.toLowerCase().includes(libellePosteFilter.toLowerCase());
      
      const nomEntrepriseMatch = !nomEntrepriseFilter || 
        prospect.entreprise?.toLowerCase().includes(nomEntrepriseFilter.toLowerCase());

      // Filtres par dropdowns (sélection multiple)
      const categoriePosteMatch = categoriePosteFilter.length === 0 || categoriePosteFilter.includes(prospect.categorie_poste || '');
      const tailleEntrepriseMatch = tailleEntrepriseFilter.length === 0 || tailleEntrepriseFilter.includes(prospect.taille_entreprise || '');
      const secteurMatch = secteurFilter.length === 0 || secteurFilter.includes(prospect.secteur || '');


      return nomCompletMatch && libellePosteMatch && nomEntrepriseMatch && 
             categoriePosteMatch && tailleEntrepriseMatch && secteurMatch;
    });
  }, [prospects, nomCompletFilter, libellePosteFilter, nomEntrepriseFilter, 
      categoriePosteFilter, tailleEntrepriseFilter, secteurFilter]);

  const clearFilters = () => {
    setNomCompletFilter('');
    setLibellePosteFilter('');
    setNomEntrepriseFilter('');
    setCategoriePosteFilter([]);
    setTailleEntrepriseFilter([]);
    setSecteurFilter([]);
  };

  const hasActiveFilters = nomCompletFilter || libellePosteFilter || nomEntrepriseFilter || 
                          categoriePosteFilter.length > 0 || tailleEntrepriseFilter.length > 0 || secteurFilter.length > 0;


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

      {/* 4 Blocs de recherche */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 1 }}>
        
        {/* Bloc de gauche - Tous les critères de recherche */}
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
          {hasActiveFilters && (
            <Button
                startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
              onClick={clearFilters}
              variant="outlined"
              size="small"
              color="secondary"
                sx={{ borderRadius: 1, minWidth: 'auto', px: 1 }}
            >
                Effacer
            </Button>
          )}
        </Box>

          {/* Ligne 1 - Nom complet et Nom entreprise */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              label="👤 Nom complet"
              placeholder="Jean Dupont..."
              value={nomCompletFilter}
              onChange={(e) => setNomCompletFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 14 }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
                      size="small"
              label="🏢 Nom entreprise"
              placeholder="Société Générale..."
              value={nomEntrepriseFilter}
              onChange={(e) => setNomEntrepriseFilter(e.target.value)}
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

        {/* Bloc 2 - Export CSV */}
        <Card sx={{ 
          p: 2, 
          pb: 1,
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: 'fit-content',
          maxHeight: '300px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '300px'
        }}>
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.8rem' }}>
              📊 Export CSV
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 2 }}>
              Exporter les contacts filtrés
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              disabled={filteredProspects.length === 0}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '0.7rem',
                py: 1,
                px: 2,
                '&:hover': {
                  backgroundColor: '#45a049',
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                  color: '#666'
                }
              }}
            >
              Exporter ({filteredProspects.length})
            </Button>
          </Box>
        </Card>

      </Box>

      {/* Bloc Notes - Éditeur de texte riche - Pleine largeur */}
      <Card sx={{ 
        p: 2, 
        borderRadius: 2, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
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
            flex: 1,
            minHeight: '200px',
            maxHeight: '400px',
            overflow: 'auto',
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
          📊 {filteredProspects.length} contact{filteredProspects.length > 1 ? 's' : ''} affiché{filteredProspects.length > 1 ? 's' : ''} sur {prospects.length} total
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

      {/* Indicateur de chargement optimisé */}
      {loading && !cacheLoaded && (
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
            🚀 Chargement des {prospects.length > 0 ? prospects.length : '8000'} contacts... 
            {cacheLoaded ? ' (depuis le cache)' : ' (première fois)'}
          </Typography>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: '80vh', overflow: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mt: 3 }}>
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
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 150, py: 0.5, fontSize: '0.65rem' }}>
                📞 Téléphone
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
            {filteredProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    {prospects.length === 0 ? '📭 Aucun contact trouvé' : '🔍 Aucun contact ne correspond aux filtres'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProspects.map((prospect) => (
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
                          <Typography variant="body2" sx={{ fontSize: '0.55rem', lineHeight: 1.1 }}>
                          {prospect.email}
                        </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  {/* Téléphone */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      {prospect.telephone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.25 }}>
                          <PhoneIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.55rem', lineHeight: 1.1 }}>
                          {prospect.telephone}
                        </Typography>
                        </Box>
                      )}
                      {prospect.linkedin && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <LinkedInIcon sx={{ fontSize: 10, color: '#0077b5' }} />
                          <Link 
                          href={prospect.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                            sx={{ fontSize: '0.55rem', color: '#0077b5' }}
                        >
                          LinkedIn
                          </Link>
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