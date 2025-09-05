import { useState, useEffect } from 'react';
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
  Snackbar,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Prospect, CreateProspectData } from '../types';

const ProspectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoriesPoste, setCategoriesPoste] = useState<Array<{id: number, nom: string}>>([]);
  const [taillesEntreprise, setTaillesEntreprise] = useState<Array<{id: number, nom: string}>>([]);
  const [secteurs, setSecteurs] = useState<Array<{id: number, nom: string}>>([]);
  const [pays, setPays] = useState<Array<{id: number, nom: string}>>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [formData, setFormData] = useState<CreateProspectData>({
    nom_complet: '',
    entreprise: '',
    categorie_poste: '',
    poste_specifique: '',
    pays: 'Luxembourg',
    taille_entreprise: '',
    site_web: '',
    secteur: '',
    mx_record_exists: false,
    email: '',
    telephone: '',
    linkedin: '',
    interets: '',
    historique: '',
    etape_suivi: 'à contacter'
  });

  useEffect(() => {
    if (id) {
      fetchProspect();
    }
    fetchReferenceData();
  }, [id]);

  const fetchProspect = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/prospects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      setError('Erreur lors du chargement du prospect');
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

  const handleChange = (field: keyof CreateProspectData) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleCheckboxChange = (field: keyof CreateProspectData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation des champs obligatoires
    if (!formData.nom_complet.trim()) {
      setError('Le nom complet est obligatoire');
      setLoading(false);
      return;
    }

    try {
      const url = id 
        ? `http://localhost:3003/api/prospects/${id}`
        : 'http://localhost:3003/api/prospects';
      
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

      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
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
                  label="Nom complet *"
                  value={formData.nom_complet}
                  onChange={handleChange('nom_complet')}
                  required
                  placeholder="Ex: Jean Dupont"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="jean.dupont@email.com"
                />
                
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={handleChange('telephone')}
                  placeholder="+352 123 456 789"
                />
                
                <TextField
                  fullWidth
                  label="Site web"
                  value={formData.site_web}
                  onChange={handleChange('site_web')}
                  placeholder="https://www.entreprise.com"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.mx_record_exists || false}
                      onChange={handleCheckboxChange('mx_record_exists')}
                    />
                  }
                  label="MX Record Exists"
                />
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
                  placeholder="Nom de l'entreprise"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Catégorie de poste</InputLabel>
                  <Select
                    value={formData.categorie_poste || ''}
                    label="Catégorie de poste"
                    onChange={handleChange('categorie_poste')}
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
                  label="Poste spécifique"
                  value={formData.poste_specifique}
                  onChange={handleChange('poste_specifique')}
                  placeholder="Ex: CEO, Directeur Marketing, Développeur Senior..."
                />
                
                <FormControl fullWidth>
                  <InputLabel>Pays</InputLabel>
                  <Select
                    value={formData.pays || 'Luxembourg'}
                    label="Pays"
                    onChange={handleChange('pays')}
                  >
                    {pays.map((paysItem) => (
                      <MenuItem key={paysItem.id} value={paysItem.nom}>
                        {paysItem.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Taille de l'entreprise</InputLabel>
                  <Select
                    value={formData.taille_entreprise || ''}
                    label="Taille de l'entreprise"
                    onChange={handleChange('taille_entreprise')}
                  >
                    {taillesEntreprise.map((taille) => (
                      <MenuItem key={taille.id} value={taille.nom}>
                        {taille.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Secteur</InputLabel>
                  <Select
                    value={formData.secteur || ''}
                    label="Secteur"
                    onChange={handleChange('secteur')}
                  >
                    {secteurs.map((secteur) => (
                      <MenuItem key={secteur.id} value={secteur.nom}>
                        {secteur.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
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
                  <InputLabel>Étape de suivi</InputLabel>
                  <Select
                    value={formData.etape_suivi || 'à contacter'}
                    label="Étape de suivi"
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