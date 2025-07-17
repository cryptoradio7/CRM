import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  ListSubheader,
  IconButton,
  InputAdornment,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

interface Prospect {
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  typeEntreprise?: string;
  role?: string;
  ville: string;
  region: string;
  statut: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
  etape_suivi?: string;
}

const ProspectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [formData, setFormData] = useState<Prospect>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    typeEntreprise: '',
    role: '',
    ville: '',
    region: '',
    statut: 'Prospects',
    linkedin: '',
    interets: '',
    historique: '',
    etape_suivi: ''
  });

  useEffect(() => {
    if (id) {
      fetchProspect();
    }
  }, [id]);

  const fetchProspect = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/prospects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      setError('Erreur lors du chargement du prospect');
    }
  };

  const handleChange = (field: keyof Prospect) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation des champs obligatoires
    if (!formData.ville.trim()) {
      setError('Le champ Ville est obligatoire');
      setLoading(false);
      return;
    }

    if (!formData.region.trim()) {
      setError('Le champ Région est obligatoire');
      setLoading(false);
      return;
    }

    try {
      const url = id 
        ? `http://localhost:3001/api/prospects/${id}`
        : 'http://localhost:3001/api/prospects';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(id ? 'Prospect mis à jour avec succès' : 'Prospect créé avec succès');
        setTimeout(() => {
          navigate('/prospects');
        }, 1500);
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Modifier le Prospect' : 'Nouveau Prospect'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Informations personnelles */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Informations personnelles
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nom *"
                  value={formData.nom}
                  onChange={handleChange('nom')}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom}
                  onChange={handleChange('prenom')}
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                />
                
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={handleChange('telephone')}
                />
                
                <TextField
                  fullWidth
                  label="Ville *"
                  value={formData.ville}
                  onChange={handleChange('ville')}
                  placeholder="Ex: Paris, Genève, Luxembourg..."
                  required
                />
                
                <FormControl fullWidth required>
                  <InputLabel>Région *</InputLabel>
                  <Select
                    value={formData.region}
                    label="Région *"
                    onChange={handleChange('region')}
                  >
                    <ListSubheader>Luxembourg</ListSubheader>
                    <MenuItem value="Centre">Centre</MenuItem>
                    <MenuItem value="Sud">Sud</MenuItem>
                    <MenuItem value="Nord">Nord</MenuItem>
                    <MenuItem value="Est">Est</MenuItem>
                    <MenuItem value="Ouest">Ouest</MenuItem>
                    <ListSubheader>Suisse</ListSubheader>
                    <MenuItem value="Zurich">Zurich</MenuItem>
                    <MenuItem value="Berne">Berne</MenuItem>
                    <MenuItem value="Lucerne">Lucerne</MenuItem>
                    <MenuItem value="Uri">Uri</MenuItem>
                    <MenuItem value="Schwytz">Schwytz</MenuItem>
                    <MenuItem value="Obwald">Obwald</MenuItem>
                    <MenuItem value="Nidwald">Nidwald</MenuItem>
                    <MenuItem value="Glaris">Glaris</MenuItem>
                    <MenuItem value="Zoug">Zoug</MenuItem>
                    <MenuItem value="Fribourg">Fribourg</MenuItem>
                    <MenuItem value="Soleure">Soleure</MenuItem>
                    <MenuItem value="Bâle-Ville">Bâle-Ville</MenuItem>
                    <MenuItem value="Bâle-Campagne">Bâle-Campagne</MenuItem>
                    <MenuItem value="Schaffhouse">Schaffhouse</MenuItem>
                    <MenuItem value="Appenzell Rhodes-Extérieures">Appenzell Rhodes-Extérieures</MenuItem>
                    <MenuItem value="Appenzell Rhodes-Intérieures">Appenzell Rhodes-Intérieures</MenuItem>
                    <MenuItem value="Saint-Gall">Saint-Gall</MenuItem>
                    <MenuItem value="Grisons">Grisons</MenuItem>
                    <MenuItem value="Argovie">Argovie</MenuItem>
                    <MenuItem value="Thurgovie">Thurgovie</MenuItem>
                    <MenuItem value="Tessin">Tessin</MenuItem>
                    <MenuItem value="Vaud">Vaud</MenuItem>
                    <MenuItem value="Valais">Valais</MenuItem>
                    <MenuItem value="Neuchâtel">Neuchâtel</MenuItem>
                    <MenuItem value="Genève">Genève</MenuItem>
                    <MenuItem value="Jura">Jura</MenuItem>
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

            <Divider />

            {/* Informations professionnelles */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Informations professionnelles
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Entreprise"
                  value={formData.entreprise}
                  onChange={handleChange('entreprise')}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Type entreprise</InputLabel>
                  <Select
                    value={formData.typeEntreprise}
                    label="Type entreprise"
                    onChange={handleChange('typeEntreprise')}
                  >
                    <MenuItem value="Assurances Vie">Assurances Vie</MenuItem>
                    <MenuItem value="Banque">Banque</MenuItem>
                    <MenuItem value="Comptabilité">Comptabilité</MenuItem>
                    <MenuItem value="Fonds d'investissement">Fonds d'investissement</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Rôle"
                  value={formData.role}
                  onChange={handleChange('role')}
                />
                
                <TextField
                  fullWidth
                  label="Lien LinkedIn"
                  value={formData.linkedin}
                  onChange={handleChange('linkedin')}
                  placeholder="https://linkedin.com/in/..."
                />
              </Box>
            </Box>

            <Divider />

            {/* Informations supplémentaires */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Informations supplémentaires
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={formData.statut}
                    label="Statut"
                    onChange={handleChange('statut')}
                  >
                    <MenuItem value="Prospects">Prospects</MenuItem>
                    <MenuItem value="Clients">Clients</MenuItem>
                    <MenuItem value="N/A">N/A</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Actions</InputLabel>
                  <Select
                    value={formData.etape_suivi || ''}
                    label="Actions"
                    onChange={handleChange('etape_suivi')}
                  >
                    <MenuItem value="à contacter">à contacter</MenuItem>
                    <MenuItem value="linkedin envoyé">linkedin envoyé</MenuItem>
                    <MenuItem value="email envoyé">email envoyé</MenuItem>
                    <MenuItem value="call effectué">call effectué</MenuItem>
                    <MenuItem value="entretien 1">entretien 1</MenuItem>
                    <MenuItem value="entretien 2">entretien 2</MenuItem>
                    <MenuItem value="entretien 3">entretien 3</MenuItem>
                    <MenuItem value="OK">OK</MenuItem>
                    <MenuItem value="KO">KO</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Intérêts"
                  multiline
                  rows={3}
                  value={formData.interets}
                  onChange={handleChange('interets')}
                  placeholder="Centres d'intérêt, domaines d'expertise..."
                />
                
                <TextField
                  fullWidth
                  label="Historique"
                  multiline
                  rows={4}
                  value={formData.historique}
                  onChange={handleChange('historique')}
                  placeholder="Historique des interactions, notes importantes..."
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/prospects')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Sauvegarde...' : (id ? 'Mettre à jour' : 'Créer')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>

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

export default ProspectForm;
