'use client';
import { createTheme } from '@mui/material/styles';

// Claude's actual color palette
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ab6800', // Claude's signature orange/amber
      light: '#fbbf24',
      dark: '#92400e',
    },
    secondary: {
      main: '#1e293b',
      light: '#334155',
      dark: '#0f172a',
    },
    background: {
      default: '#ffffff', // Pure white like Claude
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Very dark slate
      secondary: '#64748b', // Slate gray
    },
    divider: '#e2e8f0',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9', 
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: '#0f172a',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.33,
      color: '#0f172a',
    },
    h3: {
      fontSize: '1.25rem', 
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#0f172a',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      color: '#0f172a',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748b',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 6,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#ab6800',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#92400e',
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#0f172a',
          '&:hover': {
            borderColor: '#ab6800',
            backgroundColor: '#fef3c7',
          },
        },
        text: {
          color: '#0f172a',
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#64748b',
          '&:hover': {
            backgroundColor: '#f8fafc',
            color: '#0f172a',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ab6800',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          border: '1px solid #e2e8f0',
        },
      },
    },
  },
});