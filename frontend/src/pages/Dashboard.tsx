import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent, Box, Container, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Alert, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  metrics: {
    totalProspects: number;
    activeProspects: number;
    newThisMonth: number;
    conversionRate: number;
    totalClients: number;
    totalNA: number;
    growthRate: number;
  };
  recentActivity: Array<{
    id: number;
    nom: string;
    prenom?: string;
    entreprise?: string;
    statut: string;
    date_creation: string;
  }>;
  statusDistribution: Array<{
    statut: string;
    count: number;
  }>;
  regionDistribution: Array<{
    region: string;
    count: number;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('🔄 Chargement des statistiques du dashboard...');
      const response = await fetch(`http://localhost:3003/api/dashboard/stats?t=${Date.now()}`);
      console.log('📡 Réponse reçue:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Données reçues:', data);
        console.log('🎯 activeProspects:', data.metrics?.activeProspects);
        setStats(data);
      } else {
        console.error('❌ Erreur HTTP:', response.status, response.statusText);
        setError('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCardClick = (filterType: string, filterValue: string) => {
    if (filterType === 'status') {
      navigate(`/prospects?status=${encodeURIComponent(filterValue)}`);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Clients':
        return 'success';
              case 'Prospects':
        return 'warning';
      case 'N/A':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des statistiques...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Aucune donnée disponible</Alert>
      </Container>
    );
  }

  const metricsCards = [
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      value: `${stats.metrics.totalClients} / ${stats.metrics.totalProspects}`,
      label: "Clients / Total",
      color: "#4CAF50",
      trend: null
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      value: (() => {
        const value = stats.metrics.activeProspects.toString();
        console.log('🎯 Valeur affichée pour "Prospects":', value);
        return value;
      })(),
              label: "Prospects",
      color: "#FF9800",
      trend: null
    },
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      value: (() => {
        const value = stats.metrics.totalClients.toString();
        console.log('🎯 Valeur affichée pour "Clients":', value);
        return value;
      })(),
      label: "Clients",
      color: "#2196F3",
      trend: null
    },
    {
      icon: <CancelIcon sx={{ fontSize: 40, color: '#9E9E9E' }} />,
      value: stats.metrics.totalNA.toString(),
      label: "N/A",
      color: "#9E9E9E",
      trend: null
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      value: `${stats.metrics.conversionRate}%`,
      label: "Taux de conversion",
      color: "#9C27B0",
      trend: null
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Titre principal */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            color: '#333',
            mb: 1,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 3,
              backgroundColor: '#4CAF50',
              borderRadius: 2,
            }
          }}
        >
          Tableau de bord
        </Typography>
      </Box>
      
      {/* Cartes de statistiques */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
        gap: 4, 
        mb: 6 
      }}>
        {metricsCards.map((stat, index) => (
          <Card 
            key={index}
            onClick={() => {
              if (stat.label === "Clients") {
                handleCardClick('status', 'Client');
              } else if (stat.label === "Prospects") {
                handleCardClick('status', 'Prospects');
              } else if (stat.label === "N/A") {
                handleCardClick('status', 'N/A');
              }
            }}
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: (stat.label === "Clients" || stat.label === "Prospects" || stat.label === "N/A") ? 'pointer' : 'default',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: stat.label === "Clients"
                  ? '0 8px 30px rgba(33, 150, 243, 0.25)' // Blue for Clients
                  : stat.label === "Prospects"
                  ? '0 8px 30px rgba(255, 152, 0, 0.25)' // Orange for Prospects
                  : stat.label === "N/A"
                  ? '0 8px 30px rgba(158, 158, 158, 0.25)' // Gray for N/A
                  : '0 8px 30px rgba(0,0,0,0.15)', // Default for non-clickable cards
              }
            }}
          >
            <CardContent 
              sx={{ 
                textAlign: 'center',
                py: 4,
                px: 3,
              }}
            >
              <Box sx={{ mb: 2 }}>
                {stat.icon}
              </Box>
              <Typography 
                variant="h3" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  color: stat.color,
                  mb: 1,
                  fontSize: '2.5rem',
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  mb: 1
                }}
              >
                {stat.label}
              </Typography>
              {stat.trend !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {stat.trend >= 0 ? (
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336' }} />
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: stat.trend >= 0 ? '#4CAF50' : '#f44336',
                      fontWeight: 600
                    }}
                  >
                    {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Section activité récente */}
      <Box sx={{ 
        backgroundColor: '#f8f9fa',
        borderRadius: 3,
        p: 4,
        border: '1px solid #e9ecef',
        mb: 4
      }}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: '#333',
            mb: 3
          }}
        >
          Activité récente
        </Typography>
        {stats.recentActivity.length > 0 ? (
          <List>
            {stats.recentActivity.map((activity) => (
              <ListItem key={activity.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getStatusColor(activity.statut) === 'success' ? '#4CAF50' : '#FF9800' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${activity.prenom || ''} ${activity.nom}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.entreprise || 'Aucune entreprise'} • {formatDate(activity.date_creation)}
                      </Typography>
                      <Chip 
                        label={activity.statut} 
                        size="small"
                        color={getStatusColor(activity.statut) as any}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              fontStyle: 'italic'
            }}
          >
            Aucune activité récente à afficher.
          </Typography>
        )}
      </Box>


    </Container>
  );
};

export default Dashboard;
