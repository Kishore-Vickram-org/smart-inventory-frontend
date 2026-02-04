import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import harborBg from '../assets/harbor-bg.svg'

export default function AppShell({ children }) {
  const location = useLocation()
  const tab = location.pathname.startsWith('/locations') ? '/locations' : '/'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',

        '&::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.95,
          backgroundImage: `url(${harborBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'saturate(1.08) contrast(1.05) brightness(1.02)',
          transform: 'translate3d(0, 0, 0)',
          animation: 'harborFloat 22s ease-in-out infinite alternate',
        },
        '& .harbor-bloom': {
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.55,
          backgroundImage:
            'radial-gradient(900px 650px at 8% 0%, rgba(11,92,171,0.22), transparent 62%), radial-gradient(800px 520px at 92% 8%, rgba(15,118,110,0.18), transparent 58%), radial-gradient(700px 520px at 40% 98%, rgba(99,102,241,0.12), transparent 60%)',
          filter: 'saturate(1.05)',
          mixBlendMode: 'soft-light',
          animation: 'harborFloat 18s ease-in-out infinite alternate',
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.10) 1px, transparent 1px)',
          backgroundSize: '64px 64px, 64px 64px',
          maskImage: 'radial-gradient(800px 550px at 50% 10%, #000 45%, transparent 72%)',
          animation: 'harborShimmer 10s ease-in-out infinite',
        },
      }}
    >
      <Box className="harbor-bloom" />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255,255,255,0.78)',
          color: 'text.primary',
          zIndex: 1,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }} noWrap>
              Harbor Inventory
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
              Simple inventory CRUD • React frontend + Spring Boot API
            </Typography>
          </Box>

          <Tabs
            value={tab}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': { minHeight: 44 },
              '& .MuiTabs-indicator': { height: 3, borderRadius: 999 },
            }}
          >
            <Tab label="Items" value="/" component={RouterLink} to="/" />
            <Tab label="Locations" value="/locations" component={RouterLink} to="/locations" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, width: '100%', position: 'relative', zIndex: 1 }}>
        <Container maxWidth={false} sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 4 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
