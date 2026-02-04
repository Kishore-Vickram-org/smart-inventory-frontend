import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0b5cab' },
    secondary: { main: '#0f766e' },
    background: {
      default: '#f6f8fc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 900, letterSpacing: 0.2 },
    h5: { fontWeight: 900 },
    h6: { fontWeight: 800 },
    subtitle1: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(1200px 800px at 10% 0%, rgba(11,92,171,0.12), transparent 60%), radial-gradient(1000px 600px at 90% 10%, rgba(15,118,110,0.12), transparent 55%)',
          backgroundAttachment: 'fixed',
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
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          borderRadius: 18,
          borderColor: 'rgba(15, 23, 42, 0.10)',
          boxShadow: '0 10px 28px rgba(2, 6, 23, 0.06)',
          backgroundColor: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 800,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 900,
            color: 'rgba(15,23,42,0.9)',
            backgroundColor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
          },
        },
      },
    },
  },
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
