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
  CardActions
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
  Visibility as ViewIcon
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

  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

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
        <Typography variant="h4" component="h1">
          Contacts ({totalCount.toLocaleString()})
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            startIcon={<FilterListIcon />}
          >
            Tableau
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
            startIcon={<PersonIcon />}
          >
            Cartes
          </Button>
        </Box>
      </Box>

      {/* Barre de recherche */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Rechercher des contacts..."
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
                <IconButton onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Contenu */}
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {viewMode === 'table' ? renderContactTable() : (
            <Box>
              {contacts.map(renderContactCard)}
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
