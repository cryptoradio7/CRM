import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Badge,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Work as WorkIcon,
  School as SchoolIcon,
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
  Public as PublicIcon
} from '@mui/icons-material';

interface Contact {
  id: number;
  lead_id: number;
  full_name: string;
  headline: string;
  summary: string;
  location: string;
  country: string;
  connections_count: number;
  lead_quality_score: number;
  linkedin_url: string;
  years_of_experience: number;
  department: string;
  current_title_normalized: string;
  current_company_name?: string;
  current_company_industry?: string;
  current_company_subindustry?: string;
  email?: string;
  telephone?: string;
  experiences?: Experience[];
  languages?: Language[];
  skills?: Skill[];
  interests?: Interest[];
  education?: Education[];
}

interface Experience {
  id: number;
  title: string;
  title_normalized?: string;
  department?: string;
  date_from: string;
  date_to: string;
  duration: string;
  description: string;
  location: string;
  is_current: boolean;
  order_in_profile: number;
  company_name: string;
  company_id?: number;
  company_size?: string;
  company_type?: string;
  company_industry?: string;
  company_logo_url?: string;
  company_description?: string;
  company_website_url?: string;
  company_linkedin_url?: string;
  company_employee_count?: number;
  company_followers_count?: number;
  company_headquarters_city?: string;
  company_headquarters_country?: string;
}

interface Language {
  id: number;
  language: string;
  proficiency: string;
  order_in_profile: number;
}

interface Skill {
  id: number;
  skill_name: string;
  order_in_profile: number;
}

interface Interest {
  id: number;
  interest_name: string;
  order_in_profile: number;
}

interface Education {
  id: number;
  degree: string;
  end_date?: string;
  start_date?: string;
  institution: string;
  field_of_study: string;
  order_in_profile: number;
}

interface ContactDetailProps {
  contactId: number;
  onClose: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contactId, onClose }) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [noteDialog, setNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchContactDetails();
  }, [contactId]);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3003/api/contacts/${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getProficiencyColor = (proficiency: string) => {
    if (proficiency.includes('Native') || proficiency.includes('Bilingual')) return '#4CAF50';
    if (proficiency.includes('Professional')) return '#2196F3';
    if (proficiency.includes('Limited')) return '#FF9800';
    return '#9E9E9E';
  };

  const handleCompanyClick = async (companyName: string) => {
    try {
      console.log('🔍 Recherche entreprise:', companyName);
      
      // Recherche intelligente avec plusieurs stratégies
      let foundCompany = null;
      
      // Stratégie 1: Recherche exacte
      let response = await fetch(`http://localhost:3003/api/companies/search?q=${encodeURIComponent(companyName)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.companies && data.companies.length > 0) {
          foundCompany = data.companies[0];
          console.log('✅ Trouvé par recherche exacte:', foundCompany.company_name);
        }
      }
      
      // Stratégie 2: Recherche par correspondances partielles connues
      if (!foundCompany) {
        const partialMatches: { [key: string]: string } = {
          'cardif lux vie': 'BNP Paribas Cardif',
          'cardif': 'BNP Paribas Cardif',
          'bgl bnp paribas': 'BGL BNP Paribas',
          'bgl': 'BGL BNP Paribas',
          'bnp paribas cardif': 'BNP Paribas Cardif',
          'bnp': 'BNP Paribas Cardif',
          'paribas': 'BNP Paribas Cardif',
          'fortis luxembourg assurances': 'Fortis Luxembourg Assurances',
          'fortis': 'Fortis Luxembourg Assurances',
          'patriotique assurances ing': 'Patriotique Assurances ING',
          'patriotique': 'Patriotique Assurances ING',
          'royal touring club': 'Royal Touring Club',
          'royal': 'Royal Touring Club'
        };
        
        const lowerName = companyName.toLowerCase();
        for (const [key, mappedName] of Object.entries(partialMatches)) {
          if (lowerName.includes(key)) {
            console.log(`🔍 Recherche avec mapping: ${key} -> ${mappedName}`);
            response = await fetch(`http://localhost:3003/api/companies/search?q=${encodeURIComponent(mappedName)}`);
            if (response.ok) {
              const data = await response.json();
              if (data.companies && data.companies.length > 0) {
                foundCompany = data.companies[0];
                console.log('✅ Trouvé par mapping:', foundCompany.company_name);
                break;
              }
            }
          }
        }
      }
      
      // Stratégie 3: Recherche par mots-clés si pas de résultat exact
      if (!foundCompany) {
        const keywords = companyName.split(' ').filter(word => word.length > 2);
        for (const keyword of keywords) {
          console.log(`🔍 Recherche par mot-clé: ${keyword}`);
          response = await fetch(`http://localhost:3003/api/companies/search?q=${encodeURIComponent(keyword)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.companies && data.companies.length > 0) {
              // Vérifier si le nom de l'entreprise contient des mots-clés similaires
              const matchingCompany = data.companies.find(company => 
                company.company_name.toLowerCase().includes(keyword.toLowerCase()) ||
                keyword.toLowerCase().includes(company.company_name.toLowerCase().split(' ')[0])
              );
              if (matchingCompany) {
                foundCompany = matchingCompany;
                console.log('✅ Trouvé par mot-clé:', foundCompany.company_name);
                break;
              }
            }
          }
        }
      }
      
      if (foundCompany) {
        // Entreprise trouvée, rediriger vers sa fiche
        console.log('🚀 Redirection vers:', `/companies/${foundCompany.id}`);
        navigate(`/companies/${foundCompany.id}`);
      } else {
        // Aucune entreprise trouvée, rediriger vers la liste avec recherche
        console.log('❌ Aucune entreprise trouvée, redirection vers liste');
        navigate(`/companies?q=${encodeURIComponent(companyName)}`);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'entreprise:', error);
      // En cas d'erreur, rediriger vers la liste des entreprises
      navigate('/companies');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Présent';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'Sales': '#E3F2FD',
      'Finance': '#E8F5E8',
      'Marketing': '#FFF3E0',
      'Technology': '#F3E5F5',
      'Human Resources': '#FCE4EC',
      'Operations': '#E0F2F1',
      'Administrative': '#F5F5F5'
    };
    return colors[department] || '#F5F5F5';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Chargement du contact...</Typography>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">Contact non trouvé</Typography>
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
              bgcolor: '#4CAF50',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {(contact.full_name || '?').split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {contact.full_name || 'Nom non disponible'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {contact.headline || 'Titre non disponible'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <LocationIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {contact.location || 'Localisation non disponible'}, {contact.country || 'Pays non disponible'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={contact.department || 'Non spécifié'}
                size="small"
                sx={{ 
                  bgcolor: getDepartmentColor(contact.department || ''),
                  color: '#333',
                  fontWeight: 500
                }}
              />
              <Chip
                icon={<StarIcon />}
                label={`Score: ${contact.lead_quality_score || 0}/100`}
                size="small"
                sx={{ 
                  bgcolor: getQualityColor(contact.lead_quality_score || 0),
                  color: 'white',
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier le contact">
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
          <Tab icon={<PersonIcon />} label="Profil" />
          <Tab icon={<TimelineIcon />} label="Expériences" />
          <Tab icon={<LanguageIcon />} label="Compétences" />
          <Tab icon={<PsychologyIcon />} label="Intérêts" />
          <Tab icon={<SchoolIcon />} label="Formation" />
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
                  <PersonIcon color="primary" />
                  Informations personnelles
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nom complet
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {contact.full_name || 'Nom non disponible'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Titre actuel
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {contact.current_title_normalized || contact.headline}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Localisation
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {contact.location || 'Localisation non disponible'}, {contact.country || 'Pays non disponible'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Années d'expérience
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {contact.years_of_experience || 0} ans
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Connexions LinkedIn
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {(contact.connections_count || 0).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Score de qualité
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={contact.lead_quality_score || 0}
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: '#E0E0E0'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 35 }}>
                        {contact.lead_quality_score || 0}%
                      </Typography>
                    </Box>
                  </Grid>
                  {contact.current_company_name && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Entreprise actuelle
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 500,
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          onClick={() => handleCompanyClick(contact.current_company_name!)}
                        >
                          {contact.current_company_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Secteur d'activité
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {contact.current_company_industry} {contact.current_company_subindustry && `- ${contact.current_company_subindustry}`}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {contact.email && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {contact.email}
                      </Typography>
                    </Grid>
                  )}
                  {contact.telephone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Téléphone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {contact.telephone}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Résumé */}
            {contact.summary && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyIcon color="primary" />
                    Résumé professionnel
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {contact.summary}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Liens */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon color="primary" />
                  Liens et contacts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {contact.linkedin_url && (
                    <Button
                      variant="outlined"
                      startIcon={<LinkedInIcon />}
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </Button>
                  )}
                  {contact.email && (
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      href={`mailto:${contact.email}`}
                    >
                      Email
                    </Button>
                  )}
                  {contact.telephone && (
                    <Button
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      href={`tel:${contact.telephone}`}
                    >
                      Téléphone
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
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
                      Expériences
                    </Typography>
                    <Chip 
                      label={contact.experiences?.length || 0} 
                      size="small" 
                      color="primary" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Langues
                    </Typography>
                    <Chip 
                      label={contact.languages?.length || 0} 
                      size="small" 
                      color="secondary" 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Compétences
                    </Typography>
                    <Chip 
                      label={contact.skills?.length || 0} 
                      size="small" 
                      color="success" 
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Langues */}
            {contact.languages && contact.languages.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon color="primary" />
                    Langues
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {contact.languages.map((lang) => (
                      <Box key={lang.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lang.language}
                        </Typography>
                        <Chip
                          label={lang.proficiency}
                          size="small"
                          sx={{
                            bgcolor: getProficiencyColor(lang.proficiency),
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab Expériences */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" />
              Parcours professionnel
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {contact.experiences && contact.experiences.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {contact.experiences
                  .sort((a, b) => a.order_in_profile - b.order_in_profile)
                  .map((exp) => (
                    <Paper key={exp.id} elevation={1} sx={{ p: 3, position: 'relative' }}>
                      {exp.is_current && (
                        <Chip
                          label="Poste actuel"
                          size="small"
                          color="success"
                          sx={{ position: 'absolute', top: 16, right: 16 }}
                        />
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#4CAF50', width: 48, height: 48 }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {exp.title}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            color="primary" 
                            sx={{ 
                              fontWeight: 500, 
                              mb: 1, 
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={() => handleCompanyClick(exp.company_name)}
                          >
                            {exp.company_name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(exp.date_from)} - {formatDate(exp.date_to)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • {exp.duration}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {exp.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {exp.department && <Chip label={exp.department} size="small" variant="outlined" />}
                        {exp.company_industry && <Chip label={exp.company_industry} size="small" variant="outlined" />}
                        {exp.company_size && <Chip label={exp.company_size} size="small" variant="outlined" />}
                      </Box>
                      
                      {exp.description && (
                        <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
                          {exp.description.replace(/<[^>]*>/g, '')}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {exp.company_website_url && (
                          <Button
                            size="small"
                            startIcon={<PublicIcon />}
                            href={exp.company_website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Site web
                          </Button>
                        )}
                        {exp.company_linkedin_url && (
                          <Button
                            size="small"
                            startIcon={<LinkedInIcon />}
                            href={exp.company_linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune expérience professionnelle enregistrée
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Compétences */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" />
              Compétences et langues
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {/* Compétences */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Compétences
                </Typography>
                {contact.skills && contact.skills.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {contact.skills.map((skill) => (
                      <Chip
                        key={skill.id}
                        label={skill.skill_name}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune compétence enregistrée
                  </Typography>
                )}
              </Grid>
              
              {/* Langues */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Langues
                </Typography>
                {contact.languages && contact.languages.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {contact.languages.map((lang) => (
                      <Box key={lang.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lang.language}
                        </Typography>
                        <Chip
                          label={lang.proficiency}
                          size="small"
                          sx={{
                            bgcolor: getProficiencyColor(lang.proficiency),
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune langue enregistrée
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tab Intérêts */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FavoriteIcon color="primary" />
              Centres d'intérêt
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {contact.interests && contact.interests.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {contact.interests.map((interest) => (
                  <Chip
                    key={interest.id}
                    label={interest.interest_name}
                    variant="outlined"
                    color="secondary"
                    icon={<FavoriteIcon />}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucun centre d'intérêt enregistré
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Formation */}
      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" />
              Formation et éducation
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {contact.education && contact.education.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {contact.education
                  .sort((a, b) => a.order_in_profile - b.order_in_profile)
                  .map((edu) => (
                    <Paper key={edu.id} elevation={1} sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#2196F3', width: 48, height: 48 }}>
                          <SchoolIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {edu.degree} - {edu.field_of_study}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
                            {edu.institution}
                          </Typography>
                          {(edu.start_date || edu.end_date) && (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {edu.start_date ? formatDate(edu.start_date) : 'Date inconnue'} - {edu.end_date ? formatDate(edu.end_date) : 'En cours'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune formation enregistrée
              </Typography>
            )}
          </CardContent>
        </Card>
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

export default ContactDetail;


