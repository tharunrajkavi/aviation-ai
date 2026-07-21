import React, { useState, useEffect, createContext, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { getTheme } from './theme';
import { SimulationProvider } from './context/SimulationContext';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  
  // Detect theme from localStorage or default to dark
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const nextMode = prevMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextMode);
        
        // Update DOM classes for clean global css integrations
        if (nextMode === 'light') {
          document.body.classList.add('light-mode');
          document.body.style.backgroundColor = '#F4F7FB';
          document.body.style.color = '#0B192C';
        } else {
          document.body.classList.remove('light-mode');
          document.body.style.backgroundColor = '#070F19';
          document.body.style.color = '#F1F6F9';
        }
        return nextMode;
      });
    }
  }), []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser({ username: storedUsername, role: storedRole });
    }

    // Initialize initial DOM styling
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#F4F7FB';
      document.body.style.color = '#0B192C';
    } else {
      document.body.classList.remove('light-mode');
      document.body.style.backgroundColor = '#070F19';
      document.body.style.color = '#F1F6F9';
    }
  }, [mode]);

  const handleLogin = (newToken, username, role) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setToken(newToken);
    setUser({ username, role });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SimulationProvider>
          <Router>
            <Routes>
              <Route 
                path="/login" 
                element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/" 
                element={token ? <Dashboard user={user} onLogout={handleLogout} toggleColorMode={colorMode.toggleColorMode} mode={mode} /> : <Navigate to="/login" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </SimulationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
