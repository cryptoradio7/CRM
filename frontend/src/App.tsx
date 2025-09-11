import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Header from './components/Header';
import ProspectsList from './pages/ProspectsList';
import ProspectForm from './pages/ProspectForm';
import ContactsList from './pages/ContactsList';
import ContactForm from './pages/ContactForm';
import CompaniesList from './pages/CompaniesList';
import CompanyForm from './pages/CompanyForm';
import SystemDashboard from './pages/SystemDashboard';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#45a049',
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          <Header />
          <Box component="main" sx={{ flex: 1, p: 3, width: '100%' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/contacts" replace />} />
              <Route path="/contacts" element={<ContactsList />} />
              <Route path="/contacts/new" element={<ContactForm />} />
              <Route path="/contacts/:id/edit" element={<ContactForm />} />
              <Route path="/companies" element={<CompaniesList />} />
              <Route path="/companies/new" element={<CompanyForm />} />
              <Route path="/companies/:id" element={<CompanyForm />} />
              <Route path="/companies/:id/edit" element={<CompanyForm />} />
              <Route path="/prospects" element={<ProspectsList />} />
              <Route path="/prospects/new" element={<ProspectForm />} />
              <Route path="/prospects/:id/edit" element={<ProspectForm />} />
              <Route path="/system" element={<SystemDashboard />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
