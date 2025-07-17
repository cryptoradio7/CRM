import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <BusinessIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CRM Pro
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/prospects"
          >
            Prospects
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/prospects/new"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Nouveau Prospect
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 