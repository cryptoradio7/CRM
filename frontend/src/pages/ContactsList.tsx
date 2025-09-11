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
  Stack
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
  EditNote as EditNoteIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatQuote as FormatQuoteIcon
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<string>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    categorie_poste: '',
    libelle_poste: '',
    taille_entreprise: '',
    secteur: ''
  });
  const [notes, setNotes] = useState('je suis super **content**');

  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Logique de filtrage des contacts
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

      // Filtre par catégorie de poste
      if (filters.categorie_poste) {
        const matchesCategory = contact.headline?.toLowerCase().includes(filters.categorie_poste.toLowerCase());
        if (!matchesCategory) return false;
      }

      // Filtre par libellé de poste
      if (filters.libelle_poste) {
        const matchesTitle = contact.headline?.toLowerCase().includes(filters.libelle_poste.toLowerCase());
        if (!matchesTitle) return false;
      }

      // Filtre par taille d'entreprise (basé sur les expériences)
      if (filters.taille_entreprise) {
        // Pour l'instant, on ne peut pas filtrer par taille d'entreprise car cette info n'est pas dans contacts
        // On pourrait l'ajouter plus tard
      }

      // Filtre par secteur (basé sur les expériences)
      if (filters.secteur) {
        // Pour l'instant, on ne peut pas filtrer par secteur car cette info n'est pas dans contacts
        // On pourrait l'ajouter plus tard
      }

      return true;
    });
  }, [contacts, searchTerm, filters]);

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
      
      setContacts(response.contacts || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalCount(response.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des contacts', severity: 'error' });
    } finally {
      setLoading(false);
    }
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
    
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadContacts(1, searchTerm);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

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
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
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

        <Grid container spacing={2}>
          {contact.email && (
            <Grid item xs={12} sm={6}>
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
            </Grid>
          )}
          
          {contact.telephone && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {contact.telephone}
                </Typography>
              </Box>
            </Grid>
          )}

          {contact.location && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {contact.location}
                </Typography>
              </Box>
            </Grid>
          )}

          {contact.sector && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {contact.sector}
                </Typography>
              </Box>
            </Grid>
          )}

          {contact.companies && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                <strong>Entreprises:</strong> {contact.companies}
              </Typography>
            </Grid>
          )}

          {contact.follow_up && (
            <Grid item xs={12}>
              <Chip 
                label={contact.follow_up} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Grid>
          )}
        </Grid>
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

  // Affichage des contacts en tableau
  const renderContactTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedContacts.length === contacts.length && contacts.length > 0}
                indeterminate={selectedContacts.length > 0 && selectedContacts.length < contacts.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Poste</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Localisation</TableCell>
            <TableCell>Secteur</TableCell>
            <TableCell>Étape</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleSelectContact(contact.id)}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                    {contact.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {contact.full_name}
                    </Typography>
                    {contact.linkedin_url && (
                      <Link href={contact.linkedin_url} target="_blank" rel="noopener">
                        <LinkedInIcon fontSize="small" />
                      </Link>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contact.headline || contact.current_title_normalized || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" noWrap>
                  <LongTextDisplay 
                    text={contact.email || ''}
                    maxLength={40}
                    variant="body2"
                    color="textSecondary"
                    sx={{ fontSize: '0.75rem', maxWidth: 200 }}
                    showToggle={false}
                  />
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contact.telephone || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contact.location || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contact.sector || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                {contact.follow_up && (
                  <Chip 
                    label={contact.follow_up} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Tooltip title="Voir">
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Notes">
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/contacts/${contact.id}/notes`)}
                    >
                      <NotesIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
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
      <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
        
        {/* BLOC 1: MOTEUR DE RECHERCHE (30%) */}
        <Box sx={{ width: '30%' }}>
          <Card sx={{ p: 2, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <FilterIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <SearchIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Moteur de recherche
              </Typography>
            </Box>
            
            {/* Recherche globale */}
            <TextField
              fullWidth
              placeholder="Tapez pour rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            {/* Filtres spécifiques */}
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Catégorie de poste</InputLabel>
                <Select
                  value={filters.categorie_poste || ''}
                  onChange={(e) => setFilters({...filters, categorie_poste: e.target.value})}
                  startAdornment={
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="Directeur">Directeur</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Développeur">Développeur</MenuItem>
                  <MenuItem value="Commercial">Commercial</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                placeholder="CEO, Directeur..."
                label="Libellé de poste"
                value={filters.libelle_poste || ''}
                onChange={(e) => setFilters({...filters, libelle_poste: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Taille entreprise</InputLabel>
                <Select
                  value={filters.taille_entreprise || ''}
                  onChange={(e) => setFilters({...filters, taille_entreprise: e.target.value})}
                  startAdornment={
                    <InputAdornment position="start">
                      <BarChartIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="1-10">1-10</MenuItem>
                  <MenuItem value="11-50">11-50</MenuItem>
                  <MenuItem value="51-200">51-200</MenuItem>
                  <MenuItem value="201-500">201-500</MenuItem>
                  <MenuItem value="501-1000">501-1000</MenuItem>
                  <MenuItem value="1001-5000">1001-5000</MenuItem>
                  <MenuItem value="5001-10000">5001-10000</MenuItem>
                  <MenuItem value="10000+">10000+</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Secteur</InputLabel>
                <Select
                  value={filters.secteur || ''}
                  onChange={(e) => setFilters({...filters, secteur: e.target.value})}
                  startAdornment={
                    <InputAdornment position="start">
                      <FactoryIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Technologie">Technologie</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Santé">Santé</MenuItem>
                  <MenuItem value="Éducation">Éducation</MenuItem>
                  <MenuItem value="Retail">Retail</MenuItem>
                  <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Card>
          
          {/* Compteur de contacts */}
          <Typography variant="body2" sx={{ color: '#4CAF50', mt: 1, fontWeight: 500 }}>
            {filteredContacts.length.toLocaleString()} contacts filtrés sur {totalCount.toLocaleString()} total
          </Typography>
        </Box>

        {/* BLOC 2: IMPORT/EXPORT (20%) */}
        <Box sx={{ width: '20%' }}>
          <Stack spacing={2}>
            {/* Import CSV */}
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <UploadIcon sx={{ mr: 1, color: '#FF9800' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Import CSV
                </Typography>
              </Box>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#4CAF50',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <UploadIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Glisser-déposer ou cliquer
                </Typography>
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
                  fullWidth
                  size="small"
                >
                  Filtres ({filteredContacts.length.toLocaleString()})
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  size="small"
                >
                  Base complète
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Box>

        {/* BLOC 3: BLOC NOTES (50%) */}
        <Box sx={{ width: '50%' }}>
          <Card sx={{ p: 2, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EditNoteIcon sx={{ mr: 1, color: '#4CAF50' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Bloc Notes
              </Typography>
            </Box>
            
            {/* Barre d'outils de formatage */}
            <Box display="flex" gap={0.5} mb={2}>
              {[
                { icon: <FormatBoldIcon />, label: 'Bold', active: true },
                { icon: <FormatItalicIcon />, label: 'Italic', active: true },
                { icon: <FormatUnderlinedIcon />, label: 'Underline', active: true },
                { icon: <FormatListNumberedIcon />, label: 'Numbered List', active: false },
                { icon: <FormatListBulletedIcon />, label: 'Bulleted List', active: true },
                { icon: <FormatQuoteIcon />, label: 'Quote', active: false }
              ].map((tool, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={tool.active ? "contained" : "outlined"}
                  color={tool.active ? "success" : "inherit"}
                  sx={{ 
                    minWidth: 32, 
                    height: 32,
                    borderRadius: 2,
                    p: 0.5
                  }}
                >
                  {tool.icon}
                </Button>
              ))}
            </Box>

            {/* Zone de texte */}
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder="Tapez vos notes ici..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }
              }}
            />
          </Card>
        </Box>
      </Box>

      {/* Contenu principal - Tableau des contacts */}
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
