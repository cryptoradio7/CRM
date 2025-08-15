import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Créer des icônes personnalisées avec les couleurs cohérentes
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

interface Prospect {
  id: number;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  role?: string;
  region?: string;
  ville?: string;
  statut: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
  date_creation: string;
}

interface RegionData {
  name: string;
  coordinates: [number, number];
  color: string;
  prospects: Prospect[];
}

const ProspectsMap = () => {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/prospects');
      if (response.ok) {
        const data = await response.json();
        console.log('Prospects chargés:', data);
        setProspects(data);
      } else {
        setError('Erreur lors du chargement des prospects');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prospects:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Définition des régions avec leurs coordonnées
  const regionsData: RegionData[] = [
    // France
    { 
      name: 'Provence-Alpes-Côte d\'Azur', 
      coordinates: [43.2965, 5.3698], 
      color: '#ff6b6b',
      prospects: []
    },
    { 
      name: 'Île-de-France', 
      coordinates: [48.8566, 2.3522], 
      color: '#4ecdc4',
      prospects: []
    },
    { 
      name: 'Grand Est', 
      coordinates: [48.5734, 7.7521], 
      color: '#45b7d1',
      prospects: []
    },
    { 
      name: 'Auvergne-Rhône-Alpes', 
      coordinates: [45.7578, 4.8320], 
      color: '#96ceb4',
      prospects: []
    },
    { 
      name: 'Occitanie', 
      coordinates: [43.6047, 1.4442], 
      color: '#feca57',
      prospects: []
    },
      
      // Suisse
    { 
      name: 'Genève', 
      coordinates: [46.2044, 6.1432], 
      color: '#ff9ff3',
      prospects: []
    },
    { 
      name: 'Vaud', 
      coordinates: [46.5197, 6.6323], 
      color: '#54a0ff',
      prospects: []
    },
    { 
      name: 'Zurich', 
      coordinates: [47.3769, 8.5417], 
      color: '#5f27cd',
      prospects: []
    },
    { 
      name: 'Bâle', 
      coordinates: [47.5596, 7.5886], 
      color: '#00d2d3',
      prospects: []
    },
    { 
      name: 'Berne', 
      coordinates: [46.9479, 7.4474], 
      color: '#ff9f43',
      prospects: []
    },
    { 
      name: 'Lausanne', 
      coordinates: [46.5197, 6.6323], 
      color: '#a55eea',
      prospects: []
    },
    { 
      name: 'Autre', 
      coordinates: [46.8182, 8.2275], 
      color: '#fd79a8',
      prospects: []
    },
    
    // Luxembourg
    { 
      name: 'Centre', 
      coordinates: [49.6116, 6.1319], 
      color: '#10ac84',
      prospects: []
    },
    { 
      name: 'Sud', 
      coordinates: [49.5000, 5.9500], 
      color: '#ee5a24',
      prospects: []
    },
    { 
      name: 'Nord', 
      coordinates: [50.0500, 5.9500], 
      color: '#575fcf',
      prospects: []
    },
    { 
      name: 'Est', 
      coordinates: [49.7000, 6.3000], 
      color: '#0abde3',
      prospects: []
    },
    { 
      name: 'Ouest', 
      coordinates: [49.6000, 5.8000], 
      color: '#ff6b6b',
      prospects: []
    }
  ];

  // Assigner les prospects aux régions
  const regionsWithProspects = regionsData.map(region => {
    const regionProspects = prospects.filter(prospect => {
      const prospectRegion = prospect.region;
      const prospectVille = prospect.ville || '';
      
      // Si le prospect a une région définie, l'utiliser en priorité
      if (prospectRegion && prospectRegion === region.name) {
        return true;
      }
      
      // Mapping spécifique pour les villes connues
      if (region.name === 'Île-de-France' && prospectVille.toLowerCase().includes('paris')) {
        return true;
      }
      if (region.name === 'Provence-Alpes-Côte d\'Azur' && 
          (prospectVille.toLowerCase().includes('juan les pins') || 
           prospectVille.toLowerCase().includes('nice') || 
           prospectVille.toLowerCase().includes('marseille'))) {
        return true;
      }
      
      // Pour les autres régions, faire une correspondance simple
      return prospectVille.toLowerCase().includes(region.name.toLowerCase());
    });
    
    return {
      ...region,
      prospects: regionProspects
    };
  }).filter(region => region.prospects.length > 0);

  const totalContacts = prospects.length;
  const totalNA = prospects.filter(p => p.statut === 'N/A').length;
      const totalProspects = prospects.filter(p => p.statut === 'Prospects').length;
  const totalClients = prospects.filter(p => p.statut === 'Client').length;

  if (loading) {
    return <Typography>Chargement de la carte...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Carte des Contacts
      </Typography>

      {/* Statistiques globales */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 150, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {totalContacts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Contacts
                </Typography>
              </Box>
            <Box sx={{ flex: 1, minWidth: 150, textAlign: 'center' }}>
                <Typography variant="h4" color="text.secondary">
                  {totalNA}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  N/A
                </Typography>
              </Box>
            <Box sx={{ flex: 1, minWidth: 150, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {totalProspects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prospects
                </Typography>
              </Box>
            <Box sx={{ flex: 1, minWidth: 150, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {totalClients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clients
                </Typography>
              </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Carte interactive */}
        <Box sx={{ flex: { lg: 2 } }}>
          <Paper sx={{ p: 2, height: '600px', position: 'relative' }}>
            <MapContainer 
              center={[48.8566, 2.3522]} 
              zoom={6} 
              minZoom={4}
              maxZoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {regionsWithProspects.map((region) => {
                const prospectsCount = region.prospects.filter(p => p.statut === 'Prospects').length;
                const clientsCount = region.prospects.filter(p => p.statut === 'Client').length;
                const naCount = region.prospects.filter(p => p.statut === 'N/A').length;
                
                // Déterminer la couleur du marqueur basée sur les statuts présents
                let markerColor = '#ff9800'; // Orange par défaut (prospects)
                
                // Compter les types de statuts différents
                const statusTypes = [];
                if (prospectsCount > 0) statusTypes.push('prospects');
                if (clientsCount > 0) statusTypes.push('clients');
                if (naCount > 0) statusTypes.push('na');
                
                if (statusTypes.length > 1) {
                  // Plusieurs types de statuts -> Bleu
                  markerColor = '#2196f3';
                } else if (statusTypes.length === 1) {
                  // Un seul type de statut
                  if (statusTypes[0] === 'clients') {
                    markerColor = '#4caf50'; // Vert pour clients uniquement
                  } else if (statusTypes[0] === 'prospects') {
                    markerColor = '#ff9800'; // Orange pour prospects uniquement
                  } else if (statusTypes[0] === 'na') {
                    markerColor = '#9e9e9e'; // Gris pour N/A uniquement
                  }
                }
                
                return (
                  <Marker 
                    key={region.name}
                    position={region.coordinates}
                    icon={createCustomIcon(markerColor)}
                    eventHandlers={{
                      click: () => setSelectedRegion(region)
                    }}
                  >
                    <Popup>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {region.name}
                        </Typography>
                        <Typography variant="body2">
                          {region.prospects.length} prospect(s)
                        </Typography>
                        <Typography variant="body2">
                          Prospects: {prospectsCount}
                        </Typography>
                        <Typography variant="body2">
                          Clients: {clientsCount}
                        </Typography>
                        <Typography variant="body2">
                          N/A: {naCount}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </Paper>
        </Box>

        {/* Détails de la région sélectionnée */}
        <Box sx={{ flex: { lg: 1 } }}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              {selectedRegion ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        {selectedRegion.name}
                    </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => setSelectedRegion(null)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                  <Typography variant="h5" color="warning.main">
                          {selectedRegion.prospects.filter(p => p.statut === 'Prospects').length}
                        </Typography>
                          <Typography variant="body2">Prospects</Typography>
                        </Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h5" color="success.main">
                          {selectedRegion.prospects.filter(p => p.statut === 'Client').length}
                          </Typography>
                          <Typography variant="body2">Clients</Typography>
                        </Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="h5" color="text.secondary">
                          {selectedRegion.prospects.filter(p => p.statut === 'N/A').length}
                          </Typography>
                          <Typography variant="body2">N/A</Typography>
                        </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Prospects dans cette région
                  </Typography>
                  
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {selectedRegion.prospects.map((prospect) => (
                      <ListItem 
                        key={prospect.id} 
                        dense
                        onClick={() => navigate(`/prospects/${prospect.id}/edit`)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.08)',
                            borderRadius: 1,
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: prospect.statut === 'Client' ? 'success.main' : 
                                     prospect.statut === 'Prospects' ? 'warning.main' : 'text.secondary',
                            width: 32,
                            height: 32
                          }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${prospect.prenom || ''} ${prospect.nom}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {prospect.entreprise || 'Aucune entreprise'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {prospect.ville}
                              </Typography>
                              <Chip 
                                label={prospect.statut} 
                                size="small"
                                sx={{ 
                                  bgcolor: prospect.statut === 'Client' ? 'success.light' : 
                                           prospect.statut === 'Prospects' ? 'warning.light' : 'grey.300',
                                  color: prospect.statut === 'Client' ? 'success.dark' : 
                                                                                    prospect.statut === 'Prospects' ? 'warning.dark' : 'grey.700',
                                  mt: 0.5
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Sélectionnez une région
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cliquez sur un marqueur pour voir les détails des prospects dans cette région
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProspectsMap; 