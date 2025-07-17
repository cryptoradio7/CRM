import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { prospectsApi } from '../services/api';
import { Prospect } from '../types';

const Dashboard: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const data = await prospectsApi.getAll();
        setProspects(data);
      } catch (error) {
        console.error('Erreur lors du chargement des prospects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, []);

  const getStatusCount = (status: Prospect['status']) => {
    return prospects.filter(p => p.status === status).length;
  };

  const getStatusPercentage = (status: Prospect['status']) => {
    if (prospects.length === 0) return 0;
    return Math.round((getStatusCount(status) / prospects.length) * 100);
  };

  const statusColors = {
    new: '#2196f3',
    contacted: '#ff9800',
    qualified: '#9c27b0',
    proposal: '#f44336',
    won: '#4caf50',
    lost: '#757575'
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        WIN le game
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistiques générales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{prospects.length}</Typography>
                  <Typography color="textSecondary">Total Prospects</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{getStatusCount('qualified')}</Typography>
                  <Typography color="textSecondary">Qualifiés</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{getStatusCount('won')}</Typography>
                  <Typography color="textSecondary">Gagnés</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{getStatusCount('new')}</Typography>
                  <Typography color="textSecondary">Nouveaux</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Répartition par statut */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition par Statut
              </Typography>
              <Grid container spacing={2}>
                {(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const).map((status) => (
                  <Grid item xs={12} sm={6} md={4} key={status}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip 
                        label={`${status.charAt(0).toUpperCase() + status.slice(1)} (${getStatusCount(status)})`}
                        sx={{ backgroundColor: statusColors[status], color: 'white' }}
                      />
                      <Typography variant="body2">
                        {getStatusPercentage(status)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={getStatusPercentage(status)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: statusColors[status]
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 