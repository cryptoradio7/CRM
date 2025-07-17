import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProspectsList from './pages/ProspectsList';
import ProspectForm from './pages/ProspectForm';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prospects" element={<ProspectsList />} />
            <Route path="/prospects/new" element={<ProspectForm />} />
            <Route path="/prospects/:id/edit" element={<ProspectForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 