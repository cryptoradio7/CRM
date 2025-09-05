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
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import type { CreateProspectData } from '../types';

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

      {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, fontSize: '0.75rem' }}>{success}</Alert>}

      <Paper sx={{ p: 2, maxWidth: 600, mx: 'auto', '& .MuiTextField-root': { fontSize: '0.75rem', '& .MuiInputBase-root': { height: '32px' } }, '& .MuiInputLabel-root': { fontSize: '0.75rem' }, '& .MuiInputBase-input': { fontSize: '0.75rem', py: 0.5, display: 'flex', alignItems: 'center', height: '100%' }, '& .MuiFormControl-root': { fontSize: '0.75rem', '& .MuiInputBase-root': { height: '32px' } }, '& .MuiSelect-select': { fontSize: '0.75rem', py: 0.5, display: 'flex', alignItems: 'center', height: '100%' }, '& .MuiMenuItem-root': { fontSize: '0.75rem', py: 0.25, display: 'flex', alignItems: 'center', minHeight: '28px' }, '& .MuiTypography-h6': { fontSize: '0.9rem' }, '& .MuiButton-root': { fontSize: '0.75rem', py: 0.5, display: 'flex', alignItems: 'center', height: '32px' } }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Contact */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
                Contact
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nom complet *"
                  value={formData.nom_complet}
                  onChange={handleChange('nom_complet')}
                  required
                  placeholder="Ex: Jean Dupont"
                />
                
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="jean.dupont@email.com"
                />
                
                <TextField
                  fullWidth
                  size="small"
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={handleChange('telephone')}
                  placeholder="+352 123 456 789"
                />
                
                <FormControl fullWidth size="small">
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
                  size="small"
                  label="Libellé de poste"
                  value={formData.poste_specifique}
                  onChange={handleChange('poste_specifique')}
                  placeholder="Ex: CEO, Directeur Marketing, Développeur Senior..."
                />
                
                <TextField
                  fullWidth
                  size="small"
                  label="URL LinkedIn"
                  value={formData.linkedin}
                  onChange={handleChange('linkedin')}
                  placeholder="https://linkedin.com/in/..."
                />
              </Box>
            </Box>

            <Divider />

            {/* Entreprise */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
                Entreprise
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nom entreprise"
                  value={formData.entreprise}
                  onChange={handleChange('entreprise')}
                  placeholder="Nom de l'entreprise"
                />
                
                <FormControl fullWidth size="small">
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
                
                <FormControl fullWidth size="small">
                  <InputLabel>Taille entreprise</InputLabel>
                  <Select
                    value={formData.taille_entreprise || ''}
                    label="Taille entreprise"
                    onChange={handleChange('taille_entreprise')}
                  >
                    {taillesEntreprise.map((taille) => (
                      <MenuItem key={taille.id} value={taille.nom}>
                        {taille.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
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
                  size="small"
                  label="Site web"
                  value={formData.site_web}
                  onChange={handleChange('site_web')}
                  placeholder="https://www.entreprise.com"
                />
              </Box>
            </Box>

            <Divider />

            {/* Informations complémentaires */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
                Informations complémentaires
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Étapes de suivi</InputLabel>
                  <Select
                    value={formData.etape_suivi || 'à contacter'}
                    label="Étapes de suivi"
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
                  size="small"
                  label="Intérêts"
                  multiline
                  rows={2}
                  value={formData.interets}
                  onChange={handleChange('interets')}
                  placeholder="Centres d'intérêt, domaines d'expertise..."
                  sx={{ '& .MuiInputBase-root': { height: 'auto', minHeight: '48px' } }}
                />
                
                <TextField
                  fullWidth
                  size="small"
                  label="Historique"
                  multiline
                  rows={2}
                  value={formData.historique}
                  onChange={handleChange('historique')}
                  placeholder="Historique des interactions, notes importantes..."
                  sx={{ '& .MuiInputBase-root': { height: 'auto', minHeight: '48px' } }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/prospects')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontSize: '0.75rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProspectForm;