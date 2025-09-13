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
  Public as PublicIcon,
  BusinessCenter as BusinessCenterIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Language as LanguageIcon2,
  Code as CodeIcon,
  Interests as InterestsIcon,
  School as SchoolIcon2
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Contact, Experience, ContactLanguage, ContactSkill, ContactInterest, ContactEducation } from '../types';

interface ContactDetailProps {
  contactId: number;
  onClose: () => void;
}

const ContactDetailComplete: React.FC<ContactDetailProps> = ({ contactId, onClose }) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleCompanyClick = async (companyName: string, companyId?: number) => {
    console.log('🚀 CLIC sur entreprise:', companyName, 'ID:', companyId);

    // Si on a un company_id valide, l'utiliser directement
    if (companyId) {
      console.log('✅ Utilisation ID direct:', companyId);
      navigate(`/companies/${companyId}`);
      return;
    }

    // Sinon, rechercher par nom
    try {
      console.log('🔍 Recherche par nom:', companyName);
      const response = await fetch(`http://localhost:3003/api/companies/search?q=${encodeURIComponent(companyName)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.companies && data.companies.length > 0) {
          const foundCompany = data.companies[0];
          console.log('✅ Entreprise trouvée:', foundCompany.company_name, 'ID:', foundCompany.id);
          navigate(`/companies/${foundCompany.id}`);
          return;
        }
      }

      // Si rien trouvé, aller à la liste avec recherche
      console.log('❌ Aucune entreprise trouvée, redirection vers liste');
      navigate(`/companies?q=${encodeURIComponent(companyName)}`);

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      navigate('/companies');
    }
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
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header avec photo et informations principales */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            src={contact.profile_picture_url}
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: '#4CAF50',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}
          >
            {contact.full_name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {contact.full_name || 'Nom non disponible'}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              {contact.headline || 'Titre non disponible'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
              <LocationIcon color="action" />
              <Typography variant="body1">
                {contact.location || 'Localisation non disponible'}, {contact.country || 'Pays non disponible'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                icon={<BusinessIcon />}
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
              <Chip
                icon={<GroupIcon />}
                label={`${(contact.connections_count || 0).toLocaleString()} connexions`}
                size="small"
                color="primary"
              />
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier le contact">
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
                <PersonIcon color="primary" />
                Informations personnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nom complet
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.full_name || 'Non disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Poste actuel
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.current_title_normalized || contact.headline || 'Non disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Localisation
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.location || 'Non disponible'}, {contact.country || 'Non disponible'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Expérience
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.years_of_experience || 0} ans ({contact.experience_count || 0} postes)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Connexions LinkedIn
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {(contact.connections_count || 0).toLocaleString()} ({contact.connections_count_bucket || 'Non spécifié'})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Score qualité
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
                    <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '40px' }}>
                      {contact.lead_quality_score || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" />
                Entreprise actuelle
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Entreprise
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.current_company_name || 'Non spécifiée'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Secteur
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.current_company_industry || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Sous-secteur
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.current_company_subindustry || 'Non spécifié'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Département
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contact.department || 'Non spécifié'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      {/* Liens externes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon color="primary" />
            Liens externes
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
                sx={{ textTransform: 'none' }}
              >
                LinkedIn
              </Button>
            )}
            {contact.email && (
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                href={`mailto:${contact.email}`}
                sx={{ textTransform: 'none' }}
              >
                Email
              </Button>
            )}
            {contact.telephone && (
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                href={`tel:${contact.telephone}`}
                sx={{ textTransform: 'none' }}
              >
                Téléphone
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Section Expériences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <WorkIcon color="primary" />
            Expériences professionnelles
            <Badge badgeContent={contact.experiences?.length || 0} color="primary" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {contact.experiences && contact.experiences.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contact.experiences
                .sort((a, b) => {
                  // Trier par ordre chronologique : plus récentes en premier
                  // D'abord les postes actuels, puis par date de fin décroissante
                  if (a.is_current && !b.is_current) return -1;
                  if (!a.is_current && b.is_current) return 1;
                  
                  const dateA = a.date_to ? new Date(a.date_to) : new Date();
                  const dateB = b.date_to ? new Date(b.date_to) : new Date();
                  return dateB.getTime() - dateA.getTime();
                })
                .map((exp, index) => (
                  <Paper key={exp.id} elevation={1} sx={{ 
                    p: 2, 
                    border: exp.is_current ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                    borderRadius: 1,
                    position: 'relative',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    '&:hover': {
                      boxShadow: 2,
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}>
                    {exp.is_current && (
                      <Chip
                        label="ACTUEL"
                        color="success"
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: -6, 
                          right: 8,
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: '16px'
                        }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 3, overflow: 'hidden' }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        color: exp.is_current ? '#2E7D32' : 'text.primary',
                        minWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: '0 0 250px'
                      }}>
                        {exp.title || 'Titre non spécifié'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          minWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: '0 0 200px',
                          '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: '#f5f5f5',
                            padding: '2px 4px',
                            borderRadius: '4px'
                          }
                        }}
                        onClick={() => handleCompanyClick(exp.company_name, exp.company_id)}
                      >
                        {exp.company_name || 'Entreprise non spécifiée'}
                      </Typography>
                      {exp.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '120px', flex: '0 0 120px' }}>
                          <LocationIcon fontSize="small" color="action" sx={{ fontSize: '0.8rem' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {exp.location}
                          </Typography>
                        </Box>
                      )}
                      {exp.duration && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '100px', flex: '0 0 100px' }}>
                          <CalendarIcon fontSize="small" color="action" sx={{ fontSize: '0.8rem' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {exp.duration}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        fontSize: '0.8rem', 
                        whiteSpace: 'nowrap',
                        minWidth: '140px',
                        textAlign: 'center',
                        flex: '0 0 140px'
                      }}>
                        {formatDate(exp.date_from)} - {formatDate(exp.date_to)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flex: 1, justifyContent: 'flex-end' }}>
                        {exp.job_category && (
                          <Chip 
                            label={exp.job_category} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ height: '20px', fontSize: '0.6rem' }}
                          />
                        )}
                        {exp.company_industry && (
                          <Chip 
                            label={exp.company_industry} 
                            size="small" 
                            variant="outlined" 
                            color="secondary"
                            sx={{ height: '20px', fontSize: '0.6rem' }}
                          />
                        )}
                      </Box>
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

      {/* Section Langues */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LanguageIcon2 color="primary" />
            Langues
            <Badge badgeContent={contact.languages?.length || 0} color="secondary" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {contact.languages && contact.languages.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contact.languages
                .sort((a, b) => (a.order_in_profile || 0) - (b.order_in_profile || 0))
                .map((lang) => (
                  <Box key={lang.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {lang.language || 'Langue non spécifiée'}
                    </Typography>
                    <Chip
                      label={lang.proficiency || 'Niveau non spécifié'}
                      size="small"
                      sx={{
                        bgcolor: getProficiencyColor(lang.proficiency || ''),
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune langue enregistrée
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Section Compétences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CodeIcon color="primary" />
            Compétences
            <Badge badgeContent={contact.skills?.length || 0} color="success" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {contact.skills && contact.skills.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {contact.skills.map((skill) => (
                <Chip
                  key={skill.id}
                  label={skill.skill_name || 'Compétence non spécifiée'}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune compétence enregistrée
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Section Formation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <SchoolIcon2 color="primary" />
            Formation
            <Badge badgeContent={contact.education?.length || 0} color="info" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {contact.education && contact.education.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contact.education
                .sort((a, b) => (a.order_in_profile || 0) - (b.order_in_profile || 0))
                .map((edu) => (
                  <Paper key={edu.id} elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {edu.institution || 'Institution non spécifiée'}
                    </Typography>
                    <Typography variant="body1" color="primary" sx={{ mb: 1 }}>
                      {edu.degree || 'Diplôme non spécifié'}
                    </Typography>
                    {edu.field_of_study && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {edu.field_of_study}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                    </Typography>
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

      {/* Section Intérêts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <InterestsIcon color="primary" />
            Intérêts
            <Badge badgeContent={contact.interests_list?.length || 0} color="warning" sx={{ ml: 1 }} />
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {contact.interests_list && contact.interests_list.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {contact.interests_list.map((interest) => (
                <Chip
                  key={interest.id}
                  label={interest.interest_name || 'Intérêt non spécifié'}
                  color="secondary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun intérêt enregistré
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

export default ContactDetailComplete;
