import React, { useState, useEffect, useMemo } from 'react';
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
  Grid,
  Card,
  CardContent,
  InputAdornment,
  ListSubheader,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Prospect {
  id: number;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  role?: string;
  ville?: string;
  region?: string;
  statut: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
  date_creation: string;
}

const ProspectsList = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchProspects();
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
      const response = await fetch('http://localhost:3001/api/prospects');
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/prospects/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setProspects(prospects.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, prospectId: number) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedProspectId(prospectId);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedProspectId) return;
    
    try {
      const prospect = prospects.find(p => p.id === selectedProspectId);
      if (!prospect) return;

      const response = await fetch(`http://localhost:3001/api/prospects/${selectedProspectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prospect,
          statut: newStatus
        }),
      });

      if (response.ok) {
        setProspects(prospects.map(p => 
          p.id === selectedProspectId ? { ...p, statut: newStatus } : p
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setStatusMenuAnchor(null);
      setSelectedProspectId(null);
    }
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedProspectId(null);
  };

  // Extraction des valeurs uniques pour les filtres
  const uniqueStatuses = useMemo(() => 
    [...new Set(prospects.map(p => p.statut).filter(Boolean))], [prospects]
  );
  const uniqueRegions = useMemo(() => 
    [...new Set(prospects.map(p => p.region).filter(Boolean))], [prospects]
  );

  // Filtrage des prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      // Recherche full texte
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || 
        prospect.nom?.toLowerCase().includes(searchLower) ||
        prospect.prenom?.toLowerCase().includes(searchLower) ||
        prospect.email?.toLowerCase().includes(searchLower) ||
        prospect.entreprise?.toLowerCase().includes(searchLower) ||
        prospect.role?.toLowerCase().includes(searchLower) ||
        prospect.ville?.toLowerCase().includes(searchLower) ||
        prospect.region?.toLowerCase().includes(searchLower) ||
        prospect.telephone?.toLowerCase().includes(searchLower) ||
        prospect.interets?.toLowerCase().includes(searchLower) ||
        prospect.historique?.toLowerCase().includes(searchLower);

      // Filtres par tags
      const statusMatch = !statusFilter || prospect.statut === statusFilter;
      const regionMatch = !regionFilter || prospect.region === regionFilter;

      return searchMatch && statusMatch && regionMatch;
    });
  }, [prospects, searchTerm, statusFilter, regionFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRegionFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || regionFilter;

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Liste des Prospects
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/prospects/new')}
          sx={{
            px: 2.5,
            py: 1,
            fontSize: '0.95rem',
            fontWeight: 500,
            borderRadius: 1,
            transition: 'all 0.3s ease',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: '1px solid #4CAF50',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#45a049',
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
            }
          }}
        >
          Nouveau Prospect
        </Button>
      </Box>

      {/* Section de filtres */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Filtres et Recherche
          </Typography>
          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant="outlined"
              size="small"
              color="secondary"
            >
              Effacer les filtres
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {/* Recherche full texte */}
          <Box sx={{ gridColumn: { xs: '1', md: '1 / 2' } }}>
            <TextField
              fullWidth
              label="Recherche full texte"
              placeholder="Rechercher dans tous les champs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Filtre par statut */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                {uniqueStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Chip 
                      label={status} 
                      size="small"
                      sx={{
                        backgroundColor: 
                          status === 'prospect' ? '#e3f2fd' :
                          status === 'client' ? '#e8f5e8' :
                          '#fff3e0',
                        color: 
                          status === 'prospect' ? '#1976d2' :
                          status === 'client' ? '#2e7d32' :
                          '#f57c00',
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtre par région */}
          <Box>
            <FormControl fullWidth>
              <InputLabel>Région</InputLabel>
              <Select
                value={regionFilter}
                label="Région"
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <MenuItem value="">Toutes les régions</MenuItem>
                <ListSubheader>Luxembourg</ListSubheader>
                <MenuItem value="Centre">Centre</MenuItem>
                <MenuItem value="Sud">Sud</MenuItem>
                <MenuItem value="Nord">Nord</MenuItem>
                <MenuItem value="Est">Est</MenuItem>
                <MenuItem value="Ouest">Ouest</MenuItem>
                <ListSubheader>Suisse</ListSubheader>
                <MenuItem value="Genève">Genève</MenuItem>
                <MenuItem value="Vaud">Vaud</MenuItem>
                <MenuItem value="Zurich">Zurich</MenuItem>
                <MenuItem value="Bâle">Bâle</MenuItem>
                <MenuItem value="Berne">Berne</MenuItem>
                <ListSubheader>France</ListSubheader>
                <MenuItem value="Île-de-France">Île-de-France</MenuItem>
                <MenuItem value="Grand Est">Grand Est</MenuItem>
                <MenuItem value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</MenuItem>
                <MenuItem value="Occitanie">Occitanie</MenuItem>
                <MenuItem value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</MenuItem>
                <ListSubheader>Autres</ListSubheader>
                <MenuItem value="Autre">Autre</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
              Filtres actifs:
            </Typography>
            {searchTerm && (
              <Chip 
                label={`Recherche: "${searchTerm}"`} 
                onDelete={() => setSearchTerm('')}
                color="primary"
                variant="outlined"
              />
            )}
            {statusFilter && (
              <Chip 
                label={`Statut: ${statusFilter}`} 
                onDelete={() => setStatusFilter('')}
                color="secondary"
                variant="outlined"
              />
            )}
            {regionFilter && (
              <Chip 
                label={`Région: ${regionFilter}`} 
                onDelete={() => setRegionFilter('')}
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Statistiques */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total: ${prospects.length}`} 
            color="default"
            variant="outlined"
          />
          <Chip 
            label={`Affichés: ${filteredProspects.length}`} 
            color={filteredProspects.length < prospects.length ? "primary" : "default"}
            variant="outlined"
          />
        </Box>
      </Card>

      <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 200 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 150 }}>Entreprise</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 120 }}>Localisation</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 150 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 120 }}>Intérêts</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 120 }}>Historique</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 100 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', minWidth: 80 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {prospects.length === 0 ? 'Aucun prospect trouvé' : 'Aucun prospect ne correspond aux filtres'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProspects.map((prospect) => (
                <TableRow key={prospect.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {prospect.prenom ? `${prospect.prenom} ${prospect.nom}` : prospect.nom || '-'}
                      </Typography>
                      {prospect.role && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {prospect.role}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {prospect.entreprise || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {prospect.ville || '-'}
                      </Typography>
                      {prospect.region && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {prospect.region}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {prospect.email && (
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {prospect.email}
                        </Typography>
                      )}
                      {prospect.telephone && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {prospect.telephone}
                        </Typography>
                      )}
                      {prospect.linkedin && (
                        <a 
                          href={prospect.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#0077b5', textDecoration: 'none', fontSize: '0.75rem' }}
                        >
                          LinkedIn
                        </a>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={prospect.interets || 'Aucun intérêt renseigné'} placement="top">
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120
                      }}>
                        {prospect.interets ? 
                          (prospect.interets.length > 50 ? `${prospect.interets.substring(0, 50)}...` : prospect.interets) 
                          : '-'
                        }
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={prospect.historique || 'Aucun historique renseigné'} placement="top">
                      <Typography variant="body2" sx={{ 
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120
                      }}>
                        {prospect.historique ? 
                          (prospect.historique.length > 50 ? `${prospect.historique.substring(0, 50)}...` : prospect.historique) 
                          : '-'
                        }
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box
                      onClick={(e) => handleStatusClick(e, prospect.id)}
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: 
                          prospect.statut === 'Client' ? '#e8f5e8' :
                          '#fff3e0',
                        color: 
                          prospect.statut === 'Client' ? '#2e7d32' :
                          '#f57c00',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {prospect.statut}
                      <ArrowDropDownIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/prospects/${prospect.id}/edit`)}
                      sx={{ color: '#1976d2' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(prospect.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu déroulant pour changer le statut */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleStatusChange('À contacter')}>
          <Chip 
            label="À contacter" 
            size="small"
            sx={{
              backgroundColor: '#fff3e0',
              color: '#f57c00',
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('Client')}>
          <Chip 
            label="Client" 
            size="small"
            sx={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProspectsList;
