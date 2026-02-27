import { createTheme } from '@mui/material/styles';

const ceoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#112B44' },            // Rich navy blue
    secondary: { main: '#F6B800' },          // Executive gold
    background: {
      default: '#F4F6F8',
      paper: '#fff',
    },
    success: { main: '#2BC88B' },
    error: { main: '#E23F3F' },
  },
  typography: {
    fontFamily: [
      'Inter', 'Roboto', 'Arial', 'sans-serif'
    ].join(','),
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(18,28,56,0.10), 0 1.5px 6px 0 rgba(18,28,56,0.032)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    }
  }
});

export default ceoTheme;