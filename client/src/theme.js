import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c9a959', // Warm gold
      light: '#d4bc7b',
      dark: '#a68a3c',
    },
    secondary: {
      main: '#8b6b5c', // Warm taupe
    },
    background: {
      default: '#0d0d0d', // Deep black
      paper: '#1a1a1a', // Charcoal
    },
    text: {
      primary: '#e8e4de', // Warm white
      secondary: '#9a958e', // Muted warm gray
    },
    divider: 'rgba(201, 169, 89, 0.15)',
  },
  typography: {
    fontFamily: '"Lora", "Georgia", serif',
    h1: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    h2: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    h3: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.03em',
    },
    h4: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.03em',
    },
    h5: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.03em',
    },
    h6: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.08em',
    },
    subtitle1: {
      fontFamily: '"Lora", "Georgia", serif',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 400,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontSize: '0.7rem',
    },
    body1: {
      fontFamily: '"Lora", "Georgia", serif',
      fontSize: '1rem',
    },
    body2: {
      fontFamily: '"Lora", "Georgia", serif',
    },
    button: {
      fontFamily: '"Cinzel", "Georgia", serif',
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: '"Lora", "Georgia", serif',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          borderRadius: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          letterSpacing: '0.03em',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: '#141414',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 500,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

export default theme;
