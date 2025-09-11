import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Tooltip,
  LinearProgress,
  Link,
  Stack
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Work as WorkIcon,
  Star as StarIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Public as PublicIcon,
  BusinessCenter as BusinessCenterIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Language as LanguageIcon2,
  Code as CodeIcon,
  Interests as InterestsIcon,
  School as SchoolIcon2,
  Web as WebIcon,
  Domain as DomainIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Company, Contact } from '../types';

interface CompanyDetailProps {
  companyId: number;
  onClose: () => void;
}

const CompanyDetailComplete: React.FC<CompanyDetailProps> = ({ companyId, onClose }) => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3003/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'entreprise:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Public Company': '#4CAF50',
      'Privately Held': '#FF9800',
      'Non Profit': '#9C27B0',
      'Government Agency': '#607D8B',
      'Educational': '#2196F3'
    };
    return colors[type] || '#9E9E9E';
  };

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'Financial Services': '#E3F2FD',
      'Technology': '#F3E5F5',
      'Healthcare': '#E8F5E8',
      'Manufacturing': '#FFF3E0',
      'Retail': '#FCE4EC',
      'Education': '#E0F2F1',
      'Government': '#F5F5F5'
    };
    return colors[industry] || '#F5F5F5';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Non spécifié';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatEmployeeCount = (count: number | null) => {
    if (count === null || count === undefined) return 'Non spécifié';
    if (count === 0) return 'Non spécifié';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const handleContactClick = (contactId: number) => {
    navigate(`/contacts/${contactId}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Chargement de l'entreprise...</Typography>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Entreprise non trouvée</Typography>
        <Button onClick={onClose} variant="outlined" sx={{ mt: 2 }}>
          Fermer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header avec logo et informations principales */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            src={company.logo_url}
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: '#4CAF50',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}
          >
            {company.company_name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {company.company_name || 'Nom non disponible'}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              {company.company_industry || 'Secteur non spécifié'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
              <LocationIcon color="action" />
              <Typography variant="body1">
                {company.headquarters_city || 'Ville non spécifiée'}, {company.headquarters_country || 'Pays non spécifié'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                icon={<BusinessIcon />}
                label={company.company_type || 'Type non spécifié'}
                size="small"
                sx={{ 
                  bgcolor: getCompanyTypeColor(company.company_type || ''),
                  color: 'white',
                  fontWeight: 500
                }}
              />
              <Chip
                icon={<GroupIcon />}
                label={`${formatEmployeeCount(company.employee_count)} employés`}
                size="small"
                color="primary"
              />
              {company.company_followers_count && (
                <Chip
                  icon={<StarIcon />}
                  label={`${company.company_followers_count.toLocaleString()} followers`}
                  size="small"
                  color="secondary"
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier l'entreprise">
            <IconButton onClick={() => setEditMode(true)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ajouter une note">
            <IconButton onClick={() => setNoteDialog(true)} color="secondary">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Button onClick={onClose} variant="outlined">
            Fermer
          </Button>
        </Box>
      </Box>

      {/* Informations détaillées */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Informations générales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nom de l'entreprise
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.company_name || 'Non disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Secteur d'activité
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.company_industry || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Sous-secteur
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.company_subindustry || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type d'entreprise
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.company_type || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Taille
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.company_size || 'Non spécifiée'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nombre d'employés
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatEmployeeCount(company.employee_count)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" />
                Localisation
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ville
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.headquarters_city || 'Non spécifiée'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pays
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.headquarters_country || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Site web
                  </Typography>
                  {company.company_website_url ? (
                    <Link href={company.company_website_url} target="_blank" rel="noopener noreferrer">
                      {company.company_website_url}
                    </Link>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Non spécifié
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Domaine
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {company.company_domain || 'Non spécifié'}
                  </Typography>
                </Box>
                {company.company_founded && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Année de fondation
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.company_founded}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Description */}
      {company.company_description && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" />
              Description
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {company.company_description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Liens externes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon color="primary" />
            Liens externes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {company.linkedin_url && (
              <Button
                variant="outlined"
                startIcon={<LinkedInIcon />}
                href={company.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none' }}
              >
                LinkedIn
              </Button>
            )}
            {company.company_website_url && (
              <Button
                variant="outlined"
                startIcon={<WebIcon />}
                href={company.company_website_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none' }}
              >
                Site web
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Métriques financières */}
      {(company.revenue_bucket || company.employees_count_growth) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" />
              Métriques financières
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {company.revenue_bucket && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6" color="primary">
                      {company.revenue_bucket}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chiffre d'affaires
                    </Typography>
                  </Box>
                </Grid>
              )}
              {company.employees_count_growth && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="h6" color={company.employees_count_growth > 0 ? 'success.main' : 'error.main'}>
                      {company.employees_count_growth > 0 ? '+' : ''}{company.employees_count_growth}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Croissance employés
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Section Employés */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PeopleIcon color="primary" />
            Employés
            <Badge badgeContent={company.employees?.length || 0} color="primary" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {company.employees && company.employees.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {company.employees.map((employee) => (
                <Paper key={employee.id} elevation={1} sx={{ p: 2, cursor: 'pointer' }}
                  onClick={() => handleContactClick(employee.id)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {employee.full_name || 'Nom non disponible'}
                      </Typography>
                      <Typography variant="body1" color="primary" sx={{ mb: 1 }}>
                        {employee.title || 'Titre non spécifié'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.location || 'Localisation non spécifiée'} • {employee.duration || 'Durée non spécifiée'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={employee.is_current ? 'Actuel' : 'Ancien'}
                        color={employee.is_current ? 'success' : 'default'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(employee.date_from)} - {formatDate(employee.date_to)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun employé enregistré
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Section Contacts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <GroupIcon color="primary" />
            Contacts
            <Badge badgeContent={company.contact_count || 0} color="secondary" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {company.contacts && company.contacts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {company.contacts.map((contact) => (
                <Paper key={contact.id} elevation={1} sx={{ p: 2, cursor: 'pointer' }}
                  onClick={() => handleContactClick(contact.id)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {contact.full_name || 'Nom non disponible'}
                      </Typography>
                      <Typography variant="body1" color="primary" sx={{ mb: 1 }}>
                        {contact.headline || 'Titre non spécifié'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.location || 'Localisation non spécifiée'}, {contact.country || 'Pays non spécifié'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={`${contact.connections_count || 0} connexions`}
                        size="small"
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Score: {contact.lead_quality_score || 0}/100
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun contact enregistré
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter une note */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter une note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Annuler</Button>
          <Button onClick={() => {
            // TODO: Implémenter l'ajout de note
            setNoteDialog(false);
            setNewNote('');
          }} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyDetailComplete;
