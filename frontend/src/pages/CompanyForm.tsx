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
  Snackbar,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import type { Company } from '../types';

const CompanyForm = () => {
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
  
  const [formData, setFormData] = useState<Company>({
    id: 0,
    company_name: '',
    company_description: '',
    company_industry: '',
    company_subindustry: '',
    company_size: '',
    company_website_url: '',
    headquarters_city: '',
    headquarters_country: '',
    employee_count: 0,
    revenue_bucket: '',
    company_type: '',
    created_at: '',
    updated_at: ''
  });

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/companies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'entreprise');
    }
  };

  const handleChange = (field: keyof Company) => (
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

    if (!formData.company_name.trim()) {
      setError('Le nom de l\'entreprise est obligatoire');
      setLoading(false);
      return;
    }

    try {
      const url = id 
        ? `http://localhost:3003/api/companies/${id}`
        : 'http://localhost:3003/api/companies';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(id ? 'Entreprise mise à jour avec succès' : 'Entreprise créée avec succès');
        setTimeout(() => {
          navigate('/companies');
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

      <Paper sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Informations de base */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Informations de base
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nom de l'entreprise *"
                    value={formData.company_name}
                    onChange={handleChange('company_name')}
                    required
                    placeholder="Ex: Acme Corporation"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Site web"
                    value={formData.company_website_url}
                    onChange={handleChange('company_website_url')}
                    placeholder="https://www.entreprise.com"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.company_description}
                    onChange={handleChange('company_description')}
                    placeholder="Description de l'entreprise, mission, vision..."
                    inputProps={{ maxLength: 2000 }}
                    helperText={`${formData.company_description?.length || 0}/2000 caractères`}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Secteur d'activité */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Secteur d'activité
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Industrie"
                    value={formData.company_industry}
                    onChange={handleChange('company_industry')}
                    placeholder="Technologie, Finance, Santé..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Sous-industrie"
                    value={formData.company_subindustry}
                    onChange={handleChange('company_subindustry')}
                    placeholder="Fintech, E-commerce, SaaS..."
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Taille et structure */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Taille et structure
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Taille de l'entreprise"
                    value={formData.company_size}
                    onChange={handleChange('company_size')}
                    placeholder="Startup, PME, Grande entreprise..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre d'employés"
                    type="number"
                    value={formData.employee_count}
                    onChange={handleChange('employee_count')}
                    placeholder="50"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type d'entreprise</InputLabel>
                    <Select
                      value={formData.company_type || ''}
                      label="Type d'entreprise"
                      onChange={handleChange('company_type')}
                    >
                      <MenuItem value="startup">Startup</MenuItem>
                      <MenuItem value="pme">PME</MenuItem>
                      <MenuItem value="grande_entreprise">Grande entreprise</MenuItem>
                      <MenuItem value="multinationale">Multinationale</MenuItem>
                      <MenuItem value="ong">ONG</MenuItem>
                      <MenuItem value="administration">Administration</MenuItem>
                      <MenuItem value="autre">Autre</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Chiffre d'affaires</InputLabel>
                    <Select
                      value={formData.revenue_bucket || ''}
                      label="Chiffre d'affaires"
                      onChange={handleChange('revenue_bucket')}
                    >
                      <MenuItem value="< 1M">Moins de 1M€</MenuItem>
                      <MenuItem value="1M-10M">1M€ - 10M€</MenuItem>
                      <MenuItem value="10M-50M">10M€ - 50M€</MenuItem>
                      <MenuItem value="50M-100M">50M€ - 100M€</MenuItem>
                      <MenuItem value="100M-500M">100M€ - 500M€</MenuItem>
                      <MenuItem value="500M-1B">500M€ - 1B€</MenuItem>
                      <MenuItem value="> 1B">Plus de 1B€</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Localisation */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Localisation
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ville du siège"
                    value={formData.headquarters_city}
                    onChange={handleChange('headquarters_city')}
                    placeholder="Luxembourg"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pays du siège"
                    value={formData.headquarters_country}
                    onChange={handleChange('headquarters_country')}
                    placeholder="Luxembourg"
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/companies')}
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

export default CompanyForm;
