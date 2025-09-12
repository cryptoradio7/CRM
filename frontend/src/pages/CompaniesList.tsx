import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Autocomplete,
  Checkbox,
  Stack,
  Collapse,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  LocationOn as LocationIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  BarChart as BarChartIcon,
  Public as PublicIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { companiesApi } from '../services/api';
import type { Company } from '../types';

const CompaniesList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // États pour les filtres
  const [showFilters, setShowFilters] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [filters, setFilters] = useState({
    company_name: [] as string[],
    company_founded: [] as string[],
    company_industry: [] as string[],
    company_subindustry: [] as string[],
    employees_count_growth: [] as string[],
    company_url: [] as string[],
    linkedin_url: [] as string[]
  });
  
  const [filterOptions, setFilterOptions] = useState({
    company_name: [] as string[],
    company_founded: [] as string[],
    company_industry: [] as string[],
    company_subindustry: [] as string[],
    employees_count_growth: [] as string[],
    company_url: [] as string[],
    linkedin_url: [] as string[]
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetchCompanies();
    loadFilterOptions();
  }, []);

  // Charger les options de filtres
  const loadFilterOptions = async () => {
    try {
      setLoadingOptions(true);
      const response = await companiesApi.getAll(1, 1000);
      console.log('Chargement des options de filtres entreprises...', response.companies?.length, 'entreprises');
      extractFilterOptions(response.companies || []);
    } catch (error) {
      console.error('Erreur lors du chargement des options de filtres:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Extraire les options de filtres depuis les entreprises
  const extractFilterOptions = (companies: Company[]) => {
    const options = {
      company_name: [...new Set(companies.map(c => c.company_name).filter(Boolean))] as string[],
      company_founded: [...new Set(companies.map(c => c.company_founded).filter(Boolean))] as string[],
      company_industry: [...new Set(companies.map(c => c.company_industry).filter(Boolean))] as string[],
      company_subindustry: [...new Set(companies.map(c => c.company_subindustry).filter(Boolean))] as string[],
      employees_count_growth: [...new Set(companies.map(c => c.employees_count_growth).filter(Boolean))] as string[],
      company_url: [...new Set(companies.map(c => c.company_url).filter(Boolean))] as string[],
      linkedin_url: [...new Set(companies.map(c => c.linkedin_url).filter(Boolean))] as string[]
    };
    
    setFilterOptions(options);
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getAll();
      setCompanies(response.companies || []);
    } catch (error) {
      setError('Erreur lors du chargement des entreprises');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const filterChecks = [
        // Recherche textuelle
        !searchTerm || (
          company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.company_industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.headquarters_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.headquarters_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.company_description?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        
        // Filtres avancés
        filters.company_name.length === 0 || filters.company_name.some((name: string) => 
          company.company_name?.toLowerCase().includes(name.toLowerCase())
        ),
        
        filters.company_founded.length === 0 || filters.company_founded.some((founded: string) => 
          company.company_founded?.toString().includes(founded)
        ),
        
        
        filters.company_industry.length === 0 || filters.company_industry.some((industry: string) => 
          company.company_industry?.toLowerCase().includes(industry.toLowerCase())
        ),
        
        filters.company_subindustry.length === 0 || filters.company_subindustry.some((subindustry: string) => 
          company.company_subindustry?.toLowerCase().includes(subindustry.toLowerCase())
        ),
        
        filters.employees_count_growth.length === 0 || filters.employees_count_growth.some((growth: string) => 
          company.employees_count_growth?.toString().includes(growth)
        ),
        
        filters.company_url.length === 0 || filters.company_url.some((url: string) => 
          company.company_url?.toLowerCase().includes(url.toLowerCase())
        ),
        
        filters.linkedin_url.length === 0 || filters.linkedin_url.some((linkedin: string) => 
          company.linkedin_url?.toLowerCase().includes(linkedin.toLowerCase())
        )
      ];

      return filterChecks.every(check => check);
    });
  }, [companies, searchTerm, filters]);

  const paginatedCompanies = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCompanies.slice(start, start + rowsPerPage);
  }, [filteredCompanies, page, rowsPerPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'table' | 'cards') => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Gestion des filtres
  const handleFilterChange = (filterName: string, value: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      company_name: [],
      company_founded: [],
      company_industry: [],
      company_subindustry: [],
      employees_count_growth: [],
      company_url: [],
      linkedin_url: []
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, company: Company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleView = () => {
    if (selectedCompany) {
      navigate(`/companies/${selectedCompany.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedCompany) {
      navigate(`/companies/${selectedCompany.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedCompany) {
      try {
        await companiesApi.delete(selectedCompany.id);
        setSnackbar({
          open: true,
          message: 'Entreprise supprimée avec succès',
          severity: 'success'
        });
        fetchCompanies();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression',
          severity: 'error'
        });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatEmployeeCount = (count: number | null) => {
    if (count === null || count === undefined) return 'Non spécifié';
    if (count === 0) return 'Non spécifié';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const getCompanyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'startup': 'primary',
      'pme': 'secondary',
      'grande_entreprise': 'success',
      'multinationale': 'warning',
      'ong': 'info',
      'administration': 'default',
      'autre': 'default'
    };
    return colors[type] || 'default';
  };

  const getCompanyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'startup': 'Startup',
      'pme': 'PME',
      'grande_entreprise': 'Grande entreprise',
      'multinationale': 'Multinationale',
      'ong': 'ONG',
      'administration': 'Administration',
      'autre': 'Autre'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Chargement des entreprises...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Entreprises
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/companies/new')}
          sx={{ borderRadius: 2 }}
        >
          Nouvelle entreprise
        </Button>
      </Box>

      {/* Moteur de recherche avancé */}
      <Card sx={{ mb: 3, height: '400px' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon />
              Moteur de recherche
            </Typography>
            <Button
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showFilters ? 'Masquer' : 'Afficher'}
            </Button>
          </Box>

          <Collapse in={showFilters}>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loadingOptions && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Chargement des options de filtres...
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, height: '100%' }}>
                {/* Critères Entreprise */}
                <Card sx={{ flex: 1, height: 'fit-content', maxHeight: '100%', overflow: 'auto' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon />
                      Critères Entreprise
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.company_name}
                        value={filters.company_name}
                        onChange={(event, newValue) => handleFilterChange('company_name', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.company_name];
                                newFilters.splice(index, 1);
                                handleFilterChange('company_name', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Nom de l'entreprise"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />

                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.company_founded}
                        value={filters.company_founded}
                        onChange={(event, newValue) => handleFilterChange('company_founded', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.company_founded];
                                newFilters.splice(index, 1);
                                handleFilterChange('company_founded', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Année de création"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />


                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.company_industry}
                        value={filters.company_industry}
                        onChange={(event, newValue) => handleFilterChange('company_industry', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.company_industry];
                                newFilters.splice(index, 1);
                                handleFilterChange('company_industry', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Secteur d'activité"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />

                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.company_subindustry}
                        value={filters.company_subindustry}
                        onChange={(event, newValue) => handleFilterChange('company_subindustry', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.company_subindustry];
                                newFilters.splice(index, 1);
                                handleFilterChange('company_subindustry', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sous-secteur"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />

                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.employees_count_growth}
                        value={filters.employees_count_growth}
                        onChange={(event, newValue) => handleFilterChange('employees_count_growth', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.employees_count_growth];
                                newFilters.splice(index, 1);
                                handleFilterChange('employees_count_growth', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Croissance employés"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />

                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.company_url}
                        value={filters.company_url}
                        onChange={(event, newValue) => handleFilterChange('company_url', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.company_url];
                                newFilters.splice(index, 1);
                                handleFilterChange('company_url', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Site web"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />

                      <Autocomplete
                        multiple
                        freeSolo
                        size="small"
                        options={filterOptions.linkedin_url}
                        value={filters.linkedin_url}
                        onChange={(event, newValue) => handleFilterChange('linkedin_url', newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newFilters = [...filters.linkedin_url];
                                newFilters.splice(index, 1);
                                handleFilterChange('linkedin_url', newFilters);
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="LinkedIn"
                            placeholder="Tapez ou sélectionnez..."
                          />
                        )}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={clearAllFilters} variant="outlined">
                  Effacer tous les filtres
                </Button>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Search and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            ref={searchInputRef}
            size="small"
            placeholder="Recherche textuelle rapide..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="table">
              <Tooltip title="Vue tableau">
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="cards">
              <Tooltip title="Vue cartes">
                <ViewModuleIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredCompanies.length} entreprise{filteredCompanies.length !== 1 ? 's' : ''} trouvée{filteredCompanies.length !== 1 ? 's' : ''}
      </Typography>

      {/* Table View */}
      {viewMode === 'table' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Industrie</TableCell>
                  <TableCell>Localisation</TableCell>
                  <TableCell>Employés</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>CA</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCompanies.map((company) => (
                  <TableRow 
                    key={company.id} 
                    hover 
                    onClick={() => navigate(`/companies/${company.id}`)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {company.company_name}
                          </Typography>
                          {company.company_website_url && (
                            <Typography variant="caption" color="text.secondary">
                              {company.company_website_url}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {company.company_industry || 'Non spécifié'}
                        </Typography>
                        {company.company_subindustry && (
                          <Typography variant="caption" color="text.secondary">
                            {company.company_subindustry}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {company.headquarters_city}, {company.headquarters_country}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatEmployeeCount(company.employee_count)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCompanyTypeLabel(company.company_type || '')}
                        color={getCompanyTypeColor(company.company_type || '') as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {company.revenue_bucket || 'Non spécifié'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, company);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredCompanies.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <Grid container spacing={2}>
          {paginatedCompanies.map((company) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {company.company_name}
                    </Typography>
                  </Box>
                  
                  {company.company_description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        wordBreak: 'break-word',
                        lineHeight: 1.4,
                        fontSize: '0.8rem'
                      }}
                      title={company.company_description}
                    >
                      {company.company_description.length > 150 
                        ? `${company.company_description.substring(0, 150)}...`
                        : company.company_description
                      }
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {company.headquarters_city}, {company.headquarters_country}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatEmployeeCount(company.employee_count)} employés
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        CA: {company.revenue_bucket || 'Non spécifié'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={getCompanyTypeLabel(company.company_type || '')}
                      color={getCompanyTypeColor(company.company_type || '') as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/companies/${company.id}`);
                    }}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/companies/${company.id}/edit`);
                    }}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, company);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'entreprise "{selectedCompany?.company_name}" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompaniesList;
