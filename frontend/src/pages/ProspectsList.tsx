import { useState, useEffect, useMemo } from 'react';
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
  CardContent,
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
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  LinkedIn as LinkedInIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Prospect } from '../types';

const ProspectsList = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paysFilter, setPaysFilter] = useState<string>('');
  const [secteurFilter, setSecteurFilter] = useState<string>('');
  const [categoriePosteFilter, setCategoriePosteFilter] = useState<string>('');
  const [tailleEntrepriseFilter, setTailleEntrepriseFilter] = useState<string>('');
  const [categoriesPoste, setCategoriesPoste] = useState<Array<{id: number, nom: string}>>([]);
  const [taillesEntreprise, setTaillesEntreprise] = useState<Array<{id: number, nom: string}>>([]);
  const [secteurs, setSecteurs] = useState<Array<{id: number, nom: string}>>([]);
  const [pays, setPays] = useState<Array<{id: number, nom: string}>>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchProspects();
    fetchReferenceData();
  }, []);

  // Appliquer les filtres depuis l'URL au chargement
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  const fetchProspects = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/prospects');
      if (response.ok) {
        const data = await response.json();
        setProspects(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prospects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [categoriesRes, taillesRes, secteursRes, paysRes] = await Promise.all([
        fetch('http://localhost:3003/api/categories-poste'),
        fetch('http://localhost:3003/api/tailles-entreprise'),
        fetch('http://localhost:3003/api/secteurs'),
        fetch('http://localhost:3003/api/pays')
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategoriesPoste(data);
      }
      if (taillesRes.ok) {
        const data = await taillesRes.json();
        setTaillesEntreprise(data);
      }
      if (secteursRes.ok) {
        const data = await secteursRes.json();
        setSecteurs(data);
      }
      if (paysRes.ok) {
        const data = await paysRes.json();
        setPays(data);
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
          p.id === selectedActionProspectId ? { ...p, etape_suivi: newAction } : p
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

  // Extraction des valeurs uniques pour les filtres
  const uniquePays = useMemo(() => 
    [...new Set(prospects.map(p => p.pays).filter(Boolean))], [prospects]
  );
  const uniqueSecteurs = useMemo(() => 
    [...new Set(prospects.map(p => p.secteur).filter(Boolean))], [prospects]
  );

  // Filtrage des prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      // Recherche full texte
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || 
        prospect.nom_complet?.toLowerCase().includes(searchLower) ||
        prospect.email?.toLowerCase().includes(searchLower) ||
        prospect.entreprise?.toLowerCase().includes(searchLower) ||
        prospect.categorie_poste?.toLowerCase().includes(searchLower) ||
        prospect.poste_specifique?.toLowerCase().includes(searchLower) ||
        prospect.pays?.toLowerCase().includes(searchLower) ||
        prospect.secteur?.toLowerCase().includes(searchLower) ||
        prospect.telephone?.toLowerCase().includes(searchLower) ||
        prospect.interets?.toLowerCase().includes(searchLower) ||
        prospect.historique?.toLowerCase().includes(searchLower);

      // Filtres par tags
      const paysMatch = !paysFilter || prospect.pays === paysFilter;
      const secteurMatch = !secteurFilter || prospect.secteur === secteurFilter;
      const categoriePosteMatch = !categoriePosteFilter || prospect.categorie_poste === categoriePosteFilter;
      const tailleEntrepriseMatch = !tailleEntrepriseFilter || prospect.taille_entreprise === tailleEntrepriseFilter;

      return searchMatch && paysMatch && secteurMatch && categoriePosteMatch && tailleEntrepriseMatch;
    });
  }, [prospects, searchTerm, paysFilter, secteurFilter, categoriePosteFilter, tailleEntrepriseFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setPaysFilter('');
    setSecteurFilter('');
    setCategoriePosteFilter('');
    setTailleEntrepriseFilter('');
  };

  const hasActiveFilters = searchTerm || paysFilter || secteurFilter || categoriePosteFilter || tailleEntrepriseFilter;


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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#4CAF50' }}>
          📋 Contacts
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/prospects/new')}
          sx={{
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 2,
            backgroundColor: '#4CAF50',
            color: 'white',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              backgroundColor: '#45a049',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
            }
          }}
        >
          ➕ Nouveau Contact
        </Button>
      </Box>

      {/* Section de filtres améliorée */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterIcon sx={{ mr: 1, color: '#4CAF50', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🔍 Filtres et Recherche
          </Typography>
          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant="outlined"
              size="small"
              color="secondary"
              sx={{ borderRadius: 2 }}
            >
              Effacer les filtres
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          {/* Recherche full texte */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / 2' } }}>
            <TextField
              fullWidth
              label="🔍 Recherche complète"
              placeholder="Nom, entreprise, email, secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: 2 }}
            />
          </Box>


          {/* Filtre par pays */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>🌍 Pays</InputLabel>
              <Select
                value={paysFilter}
                label="🌍 Pays"
                onChange={(e) => setPaysFilter(e.target.value)}
              >
                <MenuItem value="">Tous les pays</MenuItem>
                {uniquePays.map((pays) => (
                  <MenuItem key={pays} value={pays}>
                    <Chip 
                      label={pays} 
                      size="small"
                      sx={{
                        backgroundColor: pays === 'Luxembourg' ? '#e8f5e8' : '#fff3e0',
                        color: pays === 'Luxembourg' ? '#2e7d32' : '#f57c00',
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {/* Filtre par secteur */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>🏢 Secteur</InputLabel>
              <Select
                value={secteurFilter}
                label="🏢 Secteur"
                onChange={(e) => setSecteurFilter(e.target.value)}
              >
                <MenuItem value="">Tous les secteurs</MenuItem>
                {uniqueSecteurs.map((secteur) => (
                  <MenuItem key={secteur} value={secteur}>
                    <Chip 
                      label={secteur} 
                      size="small"
                      sx={{
                        backgroundColor: secteur === 'Technology' ? '#e3f2fd' : '#f5f5f5',
                        color: secteur === 'Technology' ? '#1565c0' : '#757575',
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtre par catégorie de poste */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>💼 Catégorie de poste</InputLabel>
              <Select
                value={categoriePosteFilter}
                label="💼 Catégorie de poste"
                onChange={(e) => setCategoriePosteFilter(e.target.value)}
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categoriesPoste.map((categorie) => (
                  <MenuItem key={categorie.id} value={categorie.nom}>
                    <Chip 
                      label={categorie.nom} 
                      size="small"
                      sx={{
                        backgroundColor: categorie.nom === 'Direction' ? '#e8f5e8' : '#f5f5f5',
                        color: categorie.nom === 'Direction' ? '#2e7d32' : '#757575',
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtre par taille d'entreprise */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>📏 Taille d'entreprise</InputLabel>
              <Select
                value={tailleEntrepriseFilter}
                label="📏 Taille d'entreprise"
                onChange={(e) => setTailleEntrepriseFilter(e.target.value)}
              >
                <MenuItem value="">Toutes les tailles</MenuItem>
                {taillesEntreprise.map((taille) => (
                  <MenuItem key={taille.id} value={taille.nom}>
                    <Chip 
                      label={taille.nom} 
                      size="small"
                      sx={{
                        backgroundColor: taille.nom === '51-200' ? '#fff3e0' : '#f5f5f5',
                        color: taille.nom === '51-200' ? '#f57c00' : '#757575',
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center', fontWeight: 500 }}>
              Filtres actifs:
            </Typography>
            {searchTerm && (
              <Chip 
                label={`🔍 "${searchTerm}"`} 
                onDelete={() => setSearchTerm('')}
                color="primary"
                variant="outlined"
              />
            )}
            {statusFilter && (
              <Chip 
                label={`📊 ${statusFilter}`} 
                onDelete={() => setStatusFilter('')}
                color="secondary"
                variant="outlined"
              />
            )}
            {paysFilter && (
              <Chip 
                label={`🌍 ${paysFilter}`} 
                onDelete={() => setPaysFilter('')}
                color="warning"
                variant="outlined"
              />
            )}
            {secteurFilter && (
              <Chip 
                label={`🏢 ${secteurFilter}`} 
                onDelete={() => setSecteurFilter('')}
                color="info"
                variant="outlined"
              />
            )}
            {categoriePosteFilter && (
              <Chip 
                label={`💼 ${categoriePosteFilter}`} 
                onDelete={() => setCategoriePosteFilter('')}
                color="success"
                variant="outlined"
              />
            )}
            {tailleEntrepriseFilter && (
              <Chip 
                label={`📏 ${tailleEntrepriseFilter}`} 
                onDelete={() => setTailleEntrepriseFilter('')}
                color="default"
                variant="outlined"
              />
            )}
          </Box>
        )}

      </Card>

      <TableContainer component={Paper} sx={{ maxHeight: '80vh', overflow: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 200, py: 0.5, fontSize: '0.75rem' }}>
                👤 Contact
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 180, py: 0.5, fontSize: '0.75rem' }}>
                🏢 Entreprise
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 150, py: 0.5, fontSize: '0.75rem' }}>
                💼 Poste
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 150, py: 0.5, fontSize: '0.75rem' }}>
                📞 Contact
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 100, py: 0.5, fontSize: '0.75rem' }}>
                🎯 Étape
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', minWidth: 80, py: 0.5, fontSize: '0.75rem' }}>
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
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.1 }}>
                        {prospect.nom_complet || '-'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Entreprise */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.1 }}>
                        {prospect.entreprise || '-'}
                      </Typography>
                      {prospect.site_web && (
                        <Link 
                          href={prospect.site_web} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ fontSize: '0.65rem', color: '#1976d2', textDecoration: 'none', display: 'block', mt: 0.25, lineHeight: 1.1 }}
                        >
                          {prospect.site_web}
                        </Link>
                      )}
                    </Box>
                  </TableCell>

                  {/* Poste */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.1 }}>
                        {prospect.poste_specifique || '-'}
                      </Typography>
                    </Box>
                  </TableCell>


                  {/* Contact */}
                  <TableCell sx={{ py: 0.5 }}>
                    <Box>
                      {prospect.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.25 }}>
                          <EmailIcon sx={{ fontSize: 10, color: '#4CAF50' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
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
                            sx={{ fontSize: '0.65rem', color: '#0077b5' }}
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
                        fontSize: '0.65rem',
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
                          <EditIcon sx={{ fontSize: 14 }} />
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
                          <DeleteIcon sx={{ fontSize: 14 }} />
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
    </Box>
  );
};

export default ProspectsList;