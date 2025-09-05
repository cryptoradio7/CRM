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
  Link
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Prospect } from '../types';
import ContactModal from '../components/ContactModal';

const ProspectsList = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheLoaded, setCacheLoaded] = useState(false);

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
  const [secteurFilter, setSecteurFilter] = useState<string>('');
  const [categoriePosteFilter, setCategoriePosteFilter] = useState<string>('');
  const [tailleEntrepriseFilter, setTailleEntrepriseFilter] = useState<string>('');
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

      // Filtres par dropdowns
      const categoriePosteMatch = !categoriePosteFilter || prospect.categorie_poste === categoriePosteFilter;
      const tailleEntrepriseMatch = !tailleEntrepriseFilter || prospect.taille_entreprise === tailleEntrepriseFilter;
      const secteurMatch = !secteurFilter || prospect.secteur === secteurFilter;

      return nomCompletMatch && libellePosteMatch && nomEntrepriseMatch && 
             categoriePosteMatch && tailleEntrepriseMatch && secteurMatch;
    });
  }, [prospects, nomCompletFilter, libellePosteFilter, nomEntrepriseFilter, 
      categoriePosteFilter, tailleEntrepriseFilter, secteurFilter]);

  const clearFilters = () => {
    setNomCompletFilter('');
    setLibellePosteFilter('');
    setNomEntrepriseFilter('');
    setCategoriePosteFilter('');
    setTailleEntrepriseFilter('');
    setSecteurFilter('');
  };

  const hasActiveFilters = nomCompletFilter || libellePosteFilter || nomEntrepriseFilter || 
                          categoriePosteFilter || tailleEntrepriseFilter || secteurFilter;


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
          📋 Contacts ({filteredProspects.length}/{prospects.length})
          {cacheLoaded && (
            <Typography component="span" sx={{ fontSize: '0.7rem', color: '#666', ml: 1 }}>
              (cache)
            </Typography>
          )}
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr 2fr' }, gap: 3, mb: 1 }}>
        
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
          '& .MuiMenuItem-root': { fontSize: '0.7rem', py: 0.25, display: 'flex', alignItems: 'center', minHeight: '24px' },
          '& .MuiTypography-h6': { fontSize: '0.8rem' },
          '& .MuiButton-root': { fontSize: '0.65rem', py: 0.25, display: 'flex', alignItems: 'center', height: '31px' },
          '& .MuiChip-root': { fontSize: '0.6rem', height: '20px' },
          '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 }
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 0.5, color: '#4CAF50', fontSize: 20 }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.8rem' }}>
              🔍 Critères
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
                value={categoriePosteFilter}
                label="Catégorie de poste"
                onChange={(e) => setCategoriePosteFilter(e.target.value)}
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
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
                value={tailleEntrepriseFilter}
                label="Taille entreprise"
                onChange={(e) => setTailleEntrepriseFilter(e.target.value)}
              >
                <MenuItem value="">Toutes les tailles</MenuItem>
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
                value={secteurFilter}
                label="Secteur"
                onChange={(e) => setSecteurFilter(e.target.value)}
              >
                <MenuItem value="">Tous les secteurs</MenuItem>
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
            {categoriePosteFilter && (
              <Chip 
                label={`💼 ${categoriePosteFilter}`} 
                onDelete={() => setCategoriePosteFilter('')}
                color="success"
                variant="outlined"
                size="small"
              />
            )}
            {libellePosteFilter && (
              <Chip 
                label={`📋 ${libellePosteFilter}`} 
                onDelete={() => setLibellePosteFilter('')}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            {tailleEntrepriseFilter && (
          <Chip 
                label={`📊 ${tailleEntrepriseFilter}`} 
                onDelete={() => setTailleEntrepriseFilter('')}
                color="warning"
            variant="outlined"
                size="small"
          />
            )}
            {secteurFilter && (
          <Chip 
                label={`🏭 ${secteurFilter}`} 
                onDelete={() => setSecteurFilter('')}
                color="default"
            variant="outlined"
                size="small"
          />
            )}
        </Box>
              </Card>

        {/* Bloc 2 - À remplir */}
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
              📊 Bloc 2
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              À remplir
            </Typography>
          </Box>
        </Card>

        {/* Bloc 3 - À remplir */}
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
              🎯 Bloc 3
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              À remplir
            </Typography>
          </Box>
        </Card>

        {/* Bloc Notes - Éditeur de texte riche */}
        <Card sx={{ 
          p: 2, 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column'
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

      </Box>

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
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 200, py: 0.5, fontSize: '0.65rem' }}>
                👤 Contact
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 180, py: 0.5, fontSize: '0.65rem' }}>
                🏢 Entreprise
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 150, py: 0.5, fontSize: '0.65rem' }}>
                💼 Poste
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 150, py: 0.5, fontSize: '0.65rem' }}>
                📞 Contact
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 100, py: 0.5, fontSize: '0.65rem' }}>
                🎯 Étape
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 80, py: 0.5, fontSize: '0.65rem' }}>
                ⚙️ Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                  {/* Contact */}
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

                  {/* Poste */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>
                        {capitalizeWords(prospect.poste_specifique)}
                      </Typography>
                    </Box>
                  </TableCell>


                  {/* Contact */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      {prospect.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.25 }}>
                          <EmailIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.55rem', lineHeight: 1.1 }}>
                          {prospect.email}
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

                  {/* Actions */}
                  <TableCell sx={{ py: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                      <Tooltip title="Modifier">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/prospects/${prospect.id}/edit`)}
                          sx={{ 
                            color: '#1976d2',
                            padding: 0.25,
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(prospect.id)}
                          sx={{ 
                            color: '#d32f2f',
                            padding: 0.25,
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                      </Tooltip>
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