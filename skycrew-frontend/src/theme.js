import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1565C0',
    },
    secondary: {
      main: '#00ACC1',
    },
    success: {
      main: '#2E7D32',
    },
    warning: {
      main: '#FB8C00',
    },
    error: {
      main: '#D32F2F',
    },
    background: {
      default: mode === 'light' ? '#F4F7FB' : '#070F19',
      paper: mode === 'light' ? '#FFFFFF' : '#0B192C',
    },
    text: {
      primary: mode === 'light' ? '#0B192C' : '#F1F6F9',
      secondary: mode === 'light' ? '#5E6E82' : '#A0AEC0',
    }
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    subtitle1: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
    subtitle2: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
    body1: { fontFamily: "'Inter', sans-serif" },
    body2: { fontFamily: "'Inter', sans-serif" },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)',
            transform: 'translateY(-1px)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00ACC1 0%, #00B8D4 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #00B8D4 0%, #00ACC1 100%)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
          boxShadow: mode === 'light' ? '0 10px 30px rgba(0, 0, 0, 0.04)' : '0 10px 30px rgba(0, 0, 0, 0.3)',
          background: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(11, 25, 44, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1565C0',
            }
          }
        }
      }
    }
  }
});
