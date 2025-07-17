import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { prospectsApi } from '../services/api';
import { Prospect } from '../types';

const ProspectsList: React.FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState<Prospect | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspects();
  }, []);

  useEffect(() => {
    filterProspects();
  }, [prospects, searchTerm, statusFilter]);

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

  const filterProspects = () => {
    let filtered = prospects;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(prospect =>
        prospect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prospect.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prospect => prospect.status === statusFilter);
    }

    setFilteredProspects(filtered);
  };

  const handleDelete = async (prospect: Prospect) => {
    setProspectToDelete(prospect);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (prospectToDelete?.id) {
      try {
        await prospectsApi.delete(prospectToDelete.id);
        await fetchProspects();
        setDeleteDialogOpen(false);
        setProspectToDelete(null);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getStatusColor = (status: Prospect['status']) => {
    const colors = {
      new: '#2196f3',
      contacted: '#ff9800',
      qualified: '#9c27b0',
      proposal: '#f44336',
      won: '#4caf50',
      lost: '#757575'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Prospect['status']) => {
    const labels = {
      new: 'Nouveau',
      contacted: 'Contacté',
      qualified: 'Qualifié',
      proposal: 'Proposition',
      won: 'Gagné',
      lost: 'Perdu'
    };
    return labels[status];
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Prospects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/prospects/new')}
        >
          Nouveau Prospect
        </Button>
      </Box>

      {/* Filtres */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Rechercher"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="new">Nouveau</MenuItem>
            <MenuItem value="contacted">Contacté</MenuItem>
            <MenuItem value="qualified">Qualifié</MenuItem>
            <MenuItem value="proposal">Proposition</MenuItem>
            <MenuItem value="won">Gagné</MenuItem>
            <MenuItem value="lost">Perdu</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Entreprise</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProspects.map((prospect) => (
              <TableRow key={prospect.id}>
                <TableCell>{prospect.name}</TableCell>
                <TableCell>{prospect.email || '-'}</TableCell>
                <TableCell>{prospect.phone || '-'}</TableCell>
                <TableCell>{prospect.company || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(prospect.status)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(prospect.status),
                      color: 'white'
                    }}
                  />
                </TableCell>
                <TableCell>
                  {prospect.created_at ? new Date(prospect.created_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/prospects/${prospect.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(prospect)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le prospect "{prospectToDelete?.name}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProspectsList; 