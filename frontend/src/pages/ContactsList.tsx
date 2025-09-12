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
  const [notes, setNotes] = useState('je suis super **content**');

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
        
        // years_of_experience (avec regroupements)
        filters.years_of_experience.length === 0 || filters.years_of_experience.some((expRange: string) => {
          const contactExp = contact.years_of_experience;
          if (!contactExp) return false;
          
          // Gestion des regroupements prédéfinis
          if (expRange === '0-2 ans (Junior)') {
            return contactExp >= 0 && contactExp <= 2;
          } else if (expRange === '3-5 ans (Intermédiaire)') {
            return contactExp >= 3 && contactExp <= 5;
          } else if (expRange === '6-10 ans (Senior)') {
            return contactExp >= 6 && contactExp <= 10;
          } else if (expRange === '11-15 ans (Expert)') {
            return contactExp >= 11 && contactExp <= 15;
          } else if (expRange === '16-20 ans (Chef d\'équipe)') {
            return contactExp >= 16 && contactExp <= 20;
          } else if (expRange === '20+ ans (Directeur)') {
            return contactExp >= 20;
          }
          
          // Fallback pour les anciennes valeurs numériques
          return expRange.includes('-') ? 
            (contactExp >= parseInt(expRange.split('-')[0]) && contactExp <= parseInt(expRange.split('-')[1])) :
            contactExp === parseInt(expRange);
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

  // Extraire les options de filtres depuis les contacts
  const extractFilterOptions = (contacts: Contact[]) => {
    const options = {
      full_name: [...new Set(contacts.map(c => c.full_name).filter(Boolean))] as string[],
      country: [...new Set(contacts.map(c => c.country).filter(Boolean))] as string[],
      headline: [...new Set(contacts.map(c => c.headline).filter(Boolean))] as string[],
      years_of_experience: [...new Set(contacts.map(c => c.years_of_experience).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0)).map(String) as string[],
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

  // Effet pour charger les options de filtres au montage
  useEffect(() => {
    loadFilterOptions();
  }, []);

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
          <TableCell sx={{ width: '25%', minWidth: '150px', height: '32px', padding: '4px 8px' }}>Nom complet</TableCell>
          <TableCell sx={{ width: '25%', minWidth: '150px', height: '32px', padding: '4px 8px' }}>Entreprise actuelle</TableCell>
          <TableCell sx={{ width: '25%', minWidth: '150px', height: '32px', padding: '4px 8px' }}>Poste actuel</TableCell>
          <TableCell sx={{ width: '25%', minWidth: '150px', height: '32px', padding: '4px 8px' }}>Email</TableCell>
          <TableCell sx={{ width: '20%', minWidth: '120px', height: '32px', padding: '4px 8px' }}>LinkedIn</TableCell>
            <TableCell sx={{ width: '80px', height: '32px', padding: '4px 8px' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredContacts.map((contact) => (
            <TableRow 
              key={contact.id} 
              hover 
              onClick={() => navigate(`/contacts/${contact.id}`)}
              sx={{ cursor: 'pointer' }}
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
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
                <Avatar 
                  src={contact.profile_picture_url} 
                  sx={{ width: 24, height: 24 }}
                >
                  {contact.full_name?.charAt(0)}
                  </Avatar>
              </TableCell>
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
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
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
                <Tooltip title={contact.current_company_name || 'Non renseigné'} arrow>
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
                    {contact.current_company_name || 'Non renseigné'}
                </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
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
                    {contact.headline || 'Non renseigné'}
                </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
                {contact.email ? (
                  <Tooltip title={contact.email} arrow>
                    <Link 
                      href={`mailto:${contact.email}`} 
                      color="primary" 
                      onClick={(e) => e.stopPropagation()} // Empêche le clic sur la ligne
                      sx={{ 
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        display: 'block'
                      }}
                    >
                      {contact.email}
                    </Link>
                  </Tooltip>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ height: '32px', padding: '4px 8px' }}>
                {contact.linkedin_url ? (
                  <Link 
                    href={contact.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="primary"
                    onClick={(e) => e.stopPropagation()} // Empêche le clic sur la ligne
                    sx={{ 
                      fontSize: '0.75rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      display: 'block'
                    }}
                  >
                    LinkedIn
                  </Link>
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
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        
        {/* BLOC 1: MOTEUR DE RECHERCHE (30%) */}
        <Box sx={{ width: '30%' }}>
          <Card sx={{ p: 1.5, height: 'fit-content' }}>
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
              {loadingOptions ? (
                <Box display="flex" justifyContent="center" p={1}>
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {/* Section Critères Contact */}
                  <Card variant="outlined" sx={{ p: 1.5, bgcolor: '#f8f9fa', flex: 1 }}>
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
                        options={[
                          '0-2 ans (Junior)',
                          '3-5 ans (Intermédiaire)',
                          '6-10 ans (Senior)',
                          '11-15 ans (Expert)',
                          '16-20 ans (Chef d\'équipe)',
                          '20+ ans (Directeur)'
                        ]}
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
                  <Card variant="outlined" sx={{ p: 1.5, bgcolor: '#f3e5f5', flex: 1 }}>
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
