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
  ListItemAvatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Work as WorkIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Domain as DomainIcon,
  Category as CategoryIcon,
  Scale as ScaleIcon,
  Star as StarIcon,
  Link as LinkIcon
} from '@mui/icons-material';

interface Company {
  id: number;
  company_id: number;
  company_name: string;
  company_description: string;
  company_industry: string;
  company_subindustry: string;
  company_size: string;
  company_website_url: string;
  headquarters_city: string;
  headquarters_country: string;
  employee_count: number;
  revenue_bucket: string;
  company_type: string;
  contacts?: Contact[];
  experiences?: Experience[];
}

interface Contact {
  id: number;
  full_name: string;
  headline: string;
  location: string;
  country: string;
  department: string;
  current_title_normalized: string;
  lead_quality_score: number;
  linkedin_url: string;
  is_current: boolean;
}

interface Experience {
  id: number;
  title: string;
  title_normalized: string;
  department: string;
  date_from: string;
  date_to: string;
  duration: string;
  is_current: boolean;
  contact: {
    id: number;
    full_name: string;
    headline: string;
    lead_quality_score: number;
  };
}

interface CompanyDetailProps {
  companyId: number;
  onClose: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ companyId, onClose }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
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

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'Financial Services': '#E3F2FD',
      'Technology': '#E8F5E8',
      'Healthcare': '#FFF3E0',
      'Manufacturing': '#F3E5F5',
      'Consulting': '#FCE4EC',
      'Education': '#E0F2F1',
      'Retail': '#F5F5F5',
      'Real Estate': '#FFF8E1'
    };
    return colors[industry] || '#F5F5F5';
  };

  const getSizeColor = (size: string) => {
    const colors: { [key: string]: string } = {
      '1-10': '#4CAF50',
      '11-50': '#8BC34A',
      '51-200': '#FFC107',
      '201-500': '#FF9800',
      '501-1000': '#FF5722',
      '1001-5000': '#F44336',
      '5001-10000': '#9C27B0',
      '10000+': '#673AB7'
    };
    return colors[size] || '#9E9E9E';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Public Company': '#4CAF50',
      'Privately Held': '#2196F3',
      'Non-Profit': '#FF9800',
      'Government': '#9C27B0',
      'Educational': '#00BCD4'
    };
    return colors[type] || '#9E9E9E';
  };

  const formatEmployeeCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K employés`;
    }
    return `${count.toLocaleString()} employés`;
  };

  const getRevenueColor = (revenue: string) => {
    if (revenue.includes('$30M+') || revenue.includes('$100M+')) return '#4CAF50';
    if (revenue.includes('$10M') || revenue.includes('$30M')) return '#8BC34A';
    if (revenue.includes('$1M') || revenue.includes('$10M')) return '#FFC107';
    if (revenue.includes('$500K') || revenue.includes('$1M')) return '#FF9800';
    return '#9E9E9E';
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header avec actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#2196F3',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {company.company_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {company.company_name}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {company.company_industry}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {company.headquarters_city}, {company.headquarters_country}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={company.company_industry}
                size="small"
                sx={{ 
                  bgcolor: getIndustryColor(company.company_industry),
                  color: '#333',
                  fontWeight: 500
                }}
              />
              <Chip
                label={company.company_size}
                size="small"
                sx={{ 
                  bgcolor: getSizeColor(company.company_size),
                  color: 'white',
                  fontWeight: 500
                }}
              />
              <Chip
                label={company.company_type}
                size="small"
                sx={{ 
                  bgcolor: getTypeColor(company.company_type),
                  color: 'white',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier l'entreprise">
            <IconButton onClick={() => setEditMode(!editMode)} color="primary">
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

      {/* Tabs de navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<BusinessIcon />} label="Informations" />
          <Tab icon={<GroupIcon />} label="Contacts" />
          <Tab icon={<TimelineIcon />} label="Expériences" />
          <Tab icon={<TrendingUpIcon />} label="Statistiques" />
        </Tabs>
      </Box>

      {/* Contenu des tabs */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="primary" />
                  Informations générales
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nom de l'entreprise
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.company_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Secteur d'activité
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.company_industry}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sous-secteur
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.company_subindustry || 'Non spécifié'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Taille de l'entreprise
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.company_size} ({formatEmployeeCount(company.employee_count)})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Siège social
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.headquarters_city}, {company.headquarters_country}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Type d'entreprise
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.company_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Chiffre d'affaires
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {company.revenue_bucket || 'Non spécifié'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Site web
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<PublicIcon />}
                      href={company.company_website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visiter le site
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Description */}
            {company.company_description && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyIcon color="primary" />
                    Description de l'entreprise
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {company.company_description}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar avec statistiques */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Statistiques
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Employés
                    </Typography>
                    <Chip 
                      label={formatEmployeeCount(company.employee_count)} 
                      size="small" 
                      color="primary" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Contacts
                    </Typography>
                    <Chip 
                      label={company.contacts?.length || 0} 
                      size="small" 
                      color="secondary" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Expériences
                    </Typography>
                    <Chip 
                      label={company.experiences?.length || 0} 
                      size="small" 
                      color="success" 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Informations financières */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="primary" />
                  Informations financières
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      CA estimé
                    </Typography>
                    <Chip 
                      label={company.revenue_bucket || 'Non spécifié'} 
                      size="small" 
                      sx={{
                        bgcolor: getRevenueColor(company.revenue_bucket || ''),
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip 
                      label={company.company_type} 
                      size="small" 
                      sx={{
                        bgcolor: getTypeColor(company.company_type),
                        color: 'white'
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab Contacts */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon color="primary" />
              Contacts de l'entreprise
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {company.contacts && company.contacts.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contact</TableCell>
                      <TableCell>Poste</TableCell>
                      <TableCell>Département</TableCell>
                      <TableCell>Localisation</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {company.contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50' }}>
                              {contact.full_name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {contact.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {contact.headline}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {contact.current_title_normalized || contact.headline}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={contact.department} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {contact.location}, {contact.country}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={contact.lead_quality_score}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">
                              {contact.lead_quality_score}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={contact.is_current ? 'Actuel' : 'Ancien'}
                            size="small"
                            color={contact.is_current ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<LinkedInIcon />}
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucun contact enregistré pour cette entreprise
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Expériences */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" />
              Historique des expériences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {company.experiences && company.experiences.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {company.experiences
                  .sort((a, b) => new Date(b.date_from).getTime() - new Date(a.date_from).getTime())
                  .map((exp) => (
                    <Paper key={exp.id} elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {exp.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exp.contact.full_name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {exp.is_current && (
                            <Chip label="Actuel" size="small" color="success" />
                          )}
                          <Chip label={exp.department} size="small" variant="outlined" />
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(exp.date_from).toLocaleDateString('fr-FR')} - {exp.date_to ? new Date(exp.date_to).toLocaleDateString('fr-FR') : 'Présent'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {exp.duration}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Score de qualité: {exp.contact.lead_quality_score}%
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<LinkedInIcon />}
                          href={`https://linkedin.com/in/${exp.contact.full_name.toLowerCase().replace(/\s+/g, '-')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Profil LinkedIn
                        </Button>
                      </Box>
                    </Paper>
                  ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune expérience enregistrée pour cette entreprise
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Statistiques */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="primary" />
                  Répartition par département
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {/* TODO: Implémenter les statistiques par département */}
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Statistiques en cours de développement
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Évolution des contacts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {/* TODO: Implémenter le graphique d'évolution */}
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Graphiques en cours de développement
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog pour ajouter une note */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Contenu de la note"
            fullWidth
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            variant="outlined"
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

export default CompanyDetail;


