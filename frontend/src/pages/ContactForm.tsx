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
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import type { Contact, Experience, ContactLanguage, ContactSkill, ContactInterest, Company } from '../types';

const ContactForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [formData, setFormData] = useState<Contact>({
    id: 0,
    lead_id: 0,
    full_name: '',
    headline: '',
    summary: '',
    location: '',
    country: '',
    connections_count: 0,
    lead_quality_score: 0,
    linkedin_url: '',
    years_of_experience: 0,
    department: '',
    current_title_normalized: '',
    profile_picture_url: '',
    created_at: '',
    updated_at: '',
    sector: '',
    email: '',
    telephone: '',
    interests: '',
    historic: '',
    follow_up: '',
    date_creation: '',
    date_modification: '',
    experiences: [],
    languages: [],
    skills: [],
    interests_list: [],
    experience_count: 0,
    companies: ''
  });

  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    title: '',
    title_normalized: '',
    department: '',
    date_from: '',
    date_to: '',
    duration: '',
    description: '',
    location: '',
    is_current: false,
    job_category: ''
  });

  const [newLanguage, setNewLanguage] = useState<Partial<ContactLanguage>>({
    language: '',
    proficiency: ''
  });

  const [newSkill, setNewSkill] = useState<Partial<ContactSkill>>({
    skill: '',
    proficiency: ''
  });

  const [newInterest, setNewInterest] = useState<Partial<ContactInterest>>({
    interest: ''
  });

  useEffect(() => {
    if (id) {
      fetchContact();
    }
    fetchCompanies();
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/contacts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      setError('Erreur lors du chargement du contact');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };

  const handleChange = (field: keyof Contact) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleExperienceChange = (field: keyof Experience) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setNewExperience({
      ...newExperience,
      [field]: event.target.value
    });
  };

  const handleLanguageChange = (field: keyof ContactLanguage) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setNewLanguage({
      ...newLanguage,
      [field]: event.target.value
    });
  };

  const handleSkillChange = (field: keyof ContactSkill) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setNewSkill({
      ...newSkill,
      [field]: event.target.value
    });
  };

  const handleInterestChange = (field: keyof ContactInterest) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setNewInterest({
      ...newInterest,
      [field]: event.target.value
    });
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company_id) {
      const experience: Experience = {
        id: 0,
        contact_id: formData.id,
        company_id: newExperience.company_id,
        title: newExperience.title,
        title_normalized: newExperience.title_normalized || '',
        department: newExperience.department || '',
        date_from: newExperience.date_from || '',
        date_to: newExperience.date_to || '',
        duration: newExperience.duration || '',
        description: newExperience.description || '',
        location: newExperience.location || '',
        is_current: newExperience.is_current || false,
        job_category: newExperience.job_category || '',
        created_at: new Date().toISOString(),
        company: companies.find(c => c.id === newExperience.company_id)?.company_name || ''
      };
      
      setFormData({
        ...formData,
        experiences: [...(formData.experiences || []), experience]
      });
      
      setNewExperience({
        title: '',
        title_normalized: '',
        department: '',
        date_from: '',
        date_to: '',
        duration: '',
        description: '',
        location: '',
        is_current: false,
        job_category: ''
      });
    }
  };

  const addLanguage = () => {
    if (newLanguage.language) {
      const language: ContactLanguage = {
        id: 0,
        contact_id: formData.id,
        language: newLanguage.language,
        proficiency: newLanguage.proficiency || '',
        created_at: new Date().toISOString()
      };
      
      setFormData({
        ...formData,
        languages: [...(formData.languages || []), language]
      });
      
      setNewLanguage({
        language: '',
        proficiency: ''
      });
    }
  };

  const addSkill = () => {
    if (newSkill.skill) {
      const skill: ContactSkill = {
        id: 0,
        contact_id: formData.id,
        skill: newSkill.skill,
        proficiency: newSkill.proficiency || '',
        created_at: new Date().toISOString()
      };
      
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skill]
      });
      
      setNewSkill({
        skill: '',
        proficiency: ''
      });
    }
  };

  const addInterest = () => {
    if (newInterest.interest) {
      const interest: ContactInterest = {
        id: 0,
        contact_id: formData.id,
        interest: newInterest.interest,
        created_at: new Date().toISOString()
      };
      
      setFormData({
        ...formData,
        interests_list: [...(formData.interests_list || []), interest]
      });
      
      setNewInterest({
        interest: ''
      });
    }
  };

  const removeExperience = (index: number) => {
    const newExperiences = formData.experiences?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      experiences: newExperiences
    });
  };

  const removeLanguage = (index: number) => {
    const newLanguages = formData.languages?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      languages: newLanguages
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      skills: newSkills
    });
  };

  const removeInterest = (index: number) => {
    const newInterests = formData.interests_list?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      interests_list: newInterests
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.full_name.trim()) {
      setError('Le nom complet est obligatoire');
      setLoading(false);
      return;
    }

    try {
      const url = id 
        ? `http://localhost:3003/api/contacts/${id}`
        : 'http://localhost:3003/api/contacts';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(id ? 'Contact mis à jour avec succès' : 'Contact créé avec succès');
        setTimeout(() => {
          navigate('/contacts');
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

  const goToCompany = (companyId: number) => {
    navigate(`/companies/${companyId}`);
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
                    label="Nom complet *"
                    value={formData.full_name}
                    onChange={handleChange('full_name')}
                    required
                    placeholder="Ex: Jean Dupont"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="jean.dupont@email.com"
                    multiline
                    rows={2}
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${formData.email?.length || 0}/1000 caractères`}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Téléphone"
                    value={formData.telephone}
                    onChange={handleChange('telephone')}
                    placeholder="+352 123 456 789"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="LinkedIn"
                    value={formData.linkedin_url}
                    onChange={handleChange('linkedin_url')}
                    placeholder="https://linkedin.com/in/..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Localisation"
                    value={formData.location}
                    onChange={handleChange('location')}
                    placeholder="Luxembourg"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pays"
                    value={formData.country}
                    onChange={handleChange('country')}
                    placeholder="Luxembourg"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Titre actuel"
                    value={formData.headline}
                    onChange={handleChange('headline')}
                    placeholder="CEO, Directeur Marketing..."
                    inputProps={{ maxLength: 500 }}
                    helperText={`${formData.headline?.length || 0}/500 caractères`}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Département"
                    value={formData.department}
                    onChange={handleChange('department')}
                    placeholder="Direction, Marketing, IT..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Années d'expérience"
                    type="number"
                    value={formData.years_of_experience}
                    onChange={handleChange('years_of_experience')}
                    placeholder="5"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Score de qualité"
                    type="number"
                    value={formData.lead_quality_score}
                    onChange={handleChange('lead_quality_score')}
                    placeholder="85"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Résumé"
                    multiline
                    rows={4}
                    value={formData.summary}
                    onChange={handleChange('summary')}
                    placeholder="Résumé professionnel..."
                    inputProps={{ maxLength: 2000 }}
                    helperText={`${formData.summary?.length || 0}/2000 caractères`}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Expériences professionnelles */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Expériences professionnelles
              </Typography>
              
              {/* Ajouter une expérience */}
              <Card sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Ajouter une expérience</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Titre du poste"
                      value={newExperience.title}
                      onChange={handleExperienceChange('title')}
                      placeholder="CEO, Directeur Marketing..."
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Entreprise</InputLabel>
                      <Select
                        value={newExperience.company_id || ''}
                        label="Entreprise"
                        onChange={handleExperienceChange('company_id')}
                      >
                        {companies.map((company) => (
                          <MenuItem key={company.id} value={company.id}>
                            {company.company_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Département"
                      value={newExperience.department}
                      onChange={handleExperienceChange('department')}
                      placeholder="Direction, Marketing..."
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Localisation"
                      value={newExperience.location}
                      onChange={handleExperienceChange('location')}
                      placeholder="Luxembourg"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Date de début"
                      type="date"
                      value={newExperience.date_from}
                      onChange={handleExperienceChange('date_from')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Date de fin"
                      type="date"
                      value={newExperience.date_to}
                      onChange={handleExperienceChange('date_to')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      multiline
                      rows={2}
                      value={newExperience.description}
                      onChange={handleExperienceChange('description')}
                      placeholder="Description du poste..."
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={addExperience}
                      disabled={!newExperience.title || !newExperience.company_id}
                    >
                      Ajouter l'expérience
                    </Button>
                  </Grid>
                </Grid>
              </Card>

              {/* Liste des expériences */}
              {formData.experiences?.map((exp, index) => (
                <Card key={index} sx={{ mb: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {exp.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.company} • {exp.department} • {exp.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.date_from} - {exp.is_current ? 'Présent' : exp.date_to}
                      </Typography>
                      {exp.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {exp.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => goToCompany(exp.company_id)}
                        color="primary"
                      >
                        <BusinessIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeExperience(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>

            <Divider />

            {/* Langues */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Langues
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  label="Langue"
                  value={newLanguage.language}
                  onChange={handleLanguageChange('language')}
                  placeholder="Français, Anglais..."
                />
                <TextField
                  size="small"
                  label="Niveau"
                  value={newLanguage.proficiency}
                  onChange={handleLanguageChange('proficiency')}
                  placeholder="Natif, Courant, Intermédiaire..."
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addLanguage}
                  disabled={!newLanguage.language}
                >
                  Ajouter
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.languages?.map((lang, index) => (
                  <Chip
                    key={index}
                    label={`${lang.language} (${lang.proficiency})`}
                    onDelete={() => removeLanguage(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Compétences */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Compétences
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  label="Compétence"
                  value={newSkill.skill}
                  onChange={handleSkillChange('skill')}
                  placeholder="JavaScript, Python, Management..."
                />
                <TextField
                  size="small"
                  label="Niveau"
                  value={newSkill.proficiency}
                  onChange={handleSkillChange('proficiency')}
                  placeholder="Expert, Avancé, Intermédiaire..."
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addSkill}
                  disabled={!newSkill.skill}
                >
                  Ajouter
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={`${skill.skill} (${skill.proficiency})`}
                    onDelete={() => removeSkill(index)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Intérêts */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Intérêts
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  label="Intérêt"
                  value={newInterest.interest}
                  onChange={handleInterestChange('interest')}
                  placeholder="Technologie, Sport, Voyage..."
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addInterest}
                  disabled={!newInterest.interest}
                >
                  Ajouter
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.interests_list?.map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest.interest}
                    onDelete={() => removeInterest(index)}
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Informations complémentaires */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Informations complémentaires
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Secteur"
                    value={formData.sector}
                    onChange={handleChange('sector')}
                    placeholder="Technologie, Finance, Santé..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Étape de suivi"
                    value={formData.follow_up}
                    onChange={handleChange('follow_up')}
                    placeholder="à contacter, en cours, OK, KO..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Intérêts généraux"
                    multiline
                    rows={3}
                    value={formData.interests}
                    onChange={handleChange('interests')}
                    placeholder="Centres d'intérêt, domaines d'expertise..."
                    inputProps={{ maxLength: 2000 }}
                    helperText={`${formData.interests?.length || 0}/2000 caractères`}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Historique"
                    multiline
                    rows={3}
                    value={formData.historic}
                    onChange={handleChange('historic')}
                    placeholder="Historique des interactions, notes importantes..."
                    inputProps={{ maxLength: 2000 }}
                    helperText={`${formData.historic?.length || 0}/2000 caractères`}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/contacts')}
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

export default ContactForm;
