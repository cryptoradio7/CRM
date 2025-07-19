import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';

const Header = () => {
  const location = useLocation();

  const baseButtonStyle = {
    px: 2.5, 
    py: 1, 
    fontSize: '0.95rem',
    fontWeight: 500,
    borderRadius: 1,
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    color: '#333',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      color: '#4CAF50',
      transform: 'translateY(-1px)',
    }
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    color: '#4CAF50',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.15)',
      color: '#4CAF50',
      transform: 'translateY(-1px)',
    }
  };

  const specialButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
    border: '1px solid #4CAF50',
    '&:hover': {
      backgroundColor: '#45a049',
      color: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
    }
  };

  return (
    <AppBar position="static" sx={{ 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      color: '#333',
    }}>
      <Toolbar sx={{ px: 4, py: 1, minHeight: '80px' }}>
        {/* Logo et nom */}
        <Box 
          component={RouterLink}
          to="/dashboard"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            }
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#4CAF50', 
              mr: 2,
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
            }}
          >
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: '#4CAF50',
                fontSize: '1.4rem',
                lineHeight: 1.2,
              }}
            >
              Agile Vizion CRM
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                fontSize: '0.75rem',
                fontWeight: 400,
              }}
            >
              Agile IT, secure, high value.
            </Typography>
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            component={RouterLink} 
            to="/dashboard"
            sx={location.pathname === '/dashboard' ? activeButtonStyle : baseButtonStyle}
            disableRipple={false}
          >
            Dashboard
          </Button>
          <Button 
            component={RouterLink} 
            to="/prospects"
            sx={location.pathname === '/prospects' ? activeButtonStyle : baseButtonStyle}
            disableRipple={false}
          >
            Contacts
          </Button>
          <Button 
            component={RouterLink} 
            to="/map"
            sx={location.pathname === '/map' ? activeButtonStyle : baseButtonStyle}
            disableRipple={false}
          >
            Carte
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
