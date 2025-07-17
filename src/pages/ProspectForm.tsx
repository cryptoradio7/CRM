import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { prospectsApi } from '../services/api';
import { Prospect } from '../types';

const ProspectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<Prospect>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditing && id) {
      fetchProspect(parseInt(id));
    }
  }, [id, isEditing]);

  const fetchProspect = async (prospectId: number) => {
    setLoading(true);
    try {
      // Pour l'instant, on simule la récupération
      // TODO: Ajouter l'endpoint getById dans l'API
      const prospects = await prospectsApi.getAll();
      const prospect = prospects.find(p => p.id === prospectId);
      if (prospect) {
        setFormData(prospect);
      }
    } catch (error) {
      setError('Erreur lors du chargement du prospect');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing && id) {
        await prospectsApi.update(parseInt(id), formData);
      } else {
        await prospectsApi.create(formData as Omit<Prospect, 'id' | 'created_at'>);
      }
      navigate('/prospects');
    } catch (error) {
      setError('Erreur lors de la sauvegarde');
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Prospect) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Modifier le Prospect' : 'Nouveau Prospect'}
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom *"
                value={formData.name || ''}
                onChange={handleChange('name')}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange('email')}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.phone || ''}
                onChange={handleChange('phone')}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Entreprise"
                value={formData.company || ''}
                onChange={handleChange('company')}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status || 'new'}
                  label="Statut"
                  onChange={handleChange('status')}
                >
                  <MenuItem value="new">Nouveau</MenuItem>
                  <MenuItem value="contacted">Contacté</MenuItem>
                  <MenuItem value="qualified">Qualifié</MenuItem>
                  <MenuItem value="proposal">Proposition</MenuItem>
                  <MenuItem value="won">Gagné</MenuItem>
                  <MenuItem value="lost">Perdu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/prospects')}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || !formData.name}
                  startIcon={saving ? <CircularProgress size={20} /> : undefined}
                >
                  {saving ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProspectForm; 