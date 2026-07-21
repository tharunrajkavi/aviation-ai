import React, { useState } from 'react';
import FlightMap from './FlightMap';
import CrewRoster from './CrewRoster';
import AIChatPanel from './AIChatPanel';
import FlightsManager from './FlightsManager';
import CrewManager from './CrewManager';
import WeatherMonitor from './WeatherMonitor';
import AIWorkflow from './AIWorkflow';
import ReportsPanel from './ReportsPanel';
import AirportManager from './AirportManager';
import SettingsProfile from './SettingsProfile';
import LiveAnalytics from './LiveAnalytics';
import DigitalTwinAirport from './DigitalTwinAirport';
import CommandCenter from './CommandCenter';
import AWSMonitoring from './AWSMonitoring';
import { useSimulation } from '../context/SimulationContext';

// Material UI
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Breadcrumbs,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tooltip as MuiTooltip,
  Alert
} from '@mui/material';

// Icons
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard as DashIcon,
  FlightTakeoff,
  People,
  AdminPanelSettings,
  Cloud,
  Psychology,
  Chat,
  Map,
  Assessment,
  Business,
  Settings,
  Notifications,
  PowerSettingsNew,
  TrendingUp,
  Warning,
  CheckCircle,
  WbSunny,
  Thunderstorm,
  ArrowForward,
  Brightness4,
  Brightness7,
  QueryStats,
  History,
  PlayArrow,
  Pause,
  Stop,
  Replay,
  Speed,
  CloudUpload,
  CloudQueue
} from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';

const DRAWER_WIDTH = 260;

function Dashboard({ user, onLogout, toggleColorMode, mode }) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Bind to Simulation Context
  const {
    status,
    speed,
    simTime,
    metrics,
    flights,
    crew,
    weatherAlerts,
    events,
    awsStatus,
    aiWorkflow,
    setWeatherAlerts,
    setCrew,
    setFlights,
    triggerAwsUpload,
    runAiPipeline,
    addEventLog,
    handleStart,
    handlePause,
    handleStop,
    handleReset,
    setSpeed
  } = useSimulation();

  const [notifAnchor, setNotifAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const triggerAIEngine = (flight) => {
    runAiPipeline(flight.flightNumber);
  };

  const handleApplySwap = () => {
    setCrew(prev => prev.map(c => c.id === 1 ? { ...c, available: true, restHoursRemaining: 12.0 } : c));
    addEventLog(`👨✈ AI Swapped Captain on flight deck. Roster violations resolved.`, 'AI');
  };

  const sidebarLinks = [
    { id: 'overview', label: 'AOCC Control Center', icon: <DashIcon /> },
    { id: 'command', label: 'Command Center Mode', icon: <AdminPanelSettings /> },
    { id: 'twin', label: 'Digital Twin Airport', icon: <Business /> },
    { id: 'aws', label: 'AWS Cloud Diagnostics', icon: <CloudQueue /> },
    { id: 'flights', label: 'Airspace Scheduling', icon: <FlightTakeoff /> },
    { id: 'crew', label: 'Crew Registry', icon: <People /> },
    { id: 'roster', label: 'Compliance Registry', icon: <AdminPanelSettings /> },
    { id: 'weather', label: 'Weather Stations', icon: <Cloud /> },
    { id: 'workflow', label: 'LangGraph Flow', icon: <Psychology /> },
    { id: 'ai', label: 'AI Operations Chat', icon: <Chat /> },
    { id: 'map', label: 'Live Airspace Map', icon: <Map /> },
    { id: 'analytics', label: 'AOCC Live Analytics', icon: <QueryStats /> },
    { id: 'reports', label: 'Operations Reports', icon: <Assessment /> },
    { id: 'airports', label: 'Airport Catalog', icon: <Business /> },
    { id: 'settings', label: 'Rules & Settings', icon: <Settings /> }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Floating Top App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          background: mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(11,25,44,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          boxShadow: 'none',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setOpen(!open)} edge="start">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: '0.05em', display: { xs: 'none', sm: 'block' } }}>
              AOCC DISPATCH MATRIX
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* Live Clock Display */}
            <Chip 
              label={`UTC Time: ${simTime.toLocaleTimeString()}`} 
              color="primary" 
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1 }}
            />

            {/* Theme Toggle */}
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications badge */}
            <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
              <Badge badgeContent={weatherAlerts.filter(w => w.active).length} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              PaperProps={{ sx: { width: 320, mt: 1.5, borderRadius: 3 } }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContet: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>AOCC Alerts Center</Typography>
              </Box>
              <Divider />
              {weatherAlerts.filter(w => w.active).map(w => (
                <MenuItem key={w.id} sx={{ py: 1.5, flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Box sx={{ display: 'flex', width: '100%', justifyContet: 'space-between', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                      ⚠ Weather Warning: {w.airportCode}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {w.message}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>

            {/* Profile Menu */}
            <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 700 }}>
                {user?.username?.substring(0, 2).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              PaperProps={{ sx: { width: 220, mt: 1.5, borderRadius: 3 } }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.username}</Typography>
                <Chip label={user?.role?.replace('ROLE_', '')} color="primary" size="small" sx={{ mt: 1, fontWeight: 700, fontSize: '0.65rem' }} />
              </Box>
              <Divider />
              <MenuItem onClick={onLogout} sx={{ py: 1.5, color: 'error.main', gap: 1 }}>
                <PowerSettingsNew size="small" />
                <Typography variant="body2" sx={{ fontWeight: 650 }}>Disconnect Console</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Collapsible Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            ...(!open && {
              width: 0,
              overflowX: 'hidden',
            }),
            background: mode === 'light' ? '#FFFFFF' : '#0B192C',
            borderRight: '1px solid',
            borderColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.1rem', letterSpacing: '0.05em' }}>
              SKYCREW AOCC
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeft />
          </IconButton>
        </Box>

        <List sx={{ px: 1.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {sidebarLinks.map((link) => (
            <ListItem key={link.id} disablePadding>
              <ListItemButton
                selected={activeTab === link.id}
                onClick={() => setActiveTab(link.id)}
                sx={{
                  borderRadius: 3,
                  py: 1.25,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '& .MuiListItemIcon-root': { color: '#ffffff' },
                    '&:hover': { bgcolor: 'primary.dark' }
                  },
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: activeTab === link.id ? '#ffffff' : 'text.secondary' }}>
                  {link.icon}
                </ListItemIcon>
                <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 650 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main View Area */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, mt: 8, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, overflowX: 'hidden' }}>
        
        {/* AWS Simulation status popup banner */}
        <AnimatePresence>
          {awsStatus.active && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ position: 'fixed', top: 80, right: 30, zIndex: 1000 }}>
              <Alert 
                severity="info" 
                icon={<CloudUpload />}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    href={
                      awsStatus.type === 'S3' 
                        ? 'https://s3.console.aws.amazon.com/' 
                        : awsStatus.type === 'RDS' 
                          ? 'https://console.aws.amazon.com/rds/' 
                          : awsStatus.type === 'CLOUDWATCH' 
                            ? 'https://console.aws.amazon.com/cloudwatch/' 
                            : 'https://console.aws.amazon.com/'
                    }
                    target="_blank"
                    sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                  >
                    Console
                  </Button>
                }
                sx={{ 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(21,101,192,0.2)',
                  borderRadius: 3,
                  fontWeight: 650,
                  fontSize: '0.75rem' 
                }}
              >
                {awsStatus.message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breadcrumbs */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.75rem', mb: 1 }}>
            <Typography color="text.secondary">Home</Typography>
            <Typography color="text.secondary">AOCC Dashboard</Typography>
            <Typography color="text.primary" sx={{ fontWeight: 700 }}>
              {sidebarLinks.find(l => l.id === activeTab)?.label}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {sidebarLinks.find(l => l.id === activeTab)?.label} Center
          </Typography>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {activeTab === 'overview' && (
              <Grid container spacing={4}>
                
                {/* AOCC Simulation Controller Board */}
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'rgba(21, 101, 192, 0.03)', border: '1px dashed rgba(21, 101, 192, 0.2)' }}>
                    <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContet: 'space-between', alignItems: 'center', p: 3, gap: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>AOCC SIMULATION CONTROLLER</Typography>
                          <Chip 
                            label={status} 
                            color={status === 'RUNNING' ? 'success' : status === 'PAUSED' ? 'warning' : 'default'} 
                            size="small" 
                            sx={{ fontWeight: 800, fontSize: '0.65rem', animation: status === 'RUNNING' ? 'pulse 2s infinite' : 'none' }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">Control the global clock, flight tracking intervals, and AI triggers.</Typography>
                      </Box>

                      {/* Control buttons */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, ml: 'auto' }}>
                        <Button 
                          variant={status === 'RUNNING' ? 'contained' : 'outlined'} 
                          color="success" 
                          size="small" 
                          onClick={handleStart}
                          startIcon={<PlayArrow />}
                          sx={{ fontWeight: 700 }}
                        >
                          Start
                        </Button>
                        <Button 
                          variant={status === 'PAUSED' ? 'contained' : 'outlined'} 
                          color="warning" 
                          size="small" 
                          onClick={handlePause}
                          startIcon={<Pause />}
                          sx={{ fontWeight: 700 }}
                        >
                          Pause
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small" 
                          onClick={handleStop}
                          startIcon={<Stop />}
                          sx={{ fontWeight: 700 }}
                        >
                          Stop
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small" 
                          onClick={handleReset}
                          startIcon={<Replay />}
                          sx={{ fontWeight: 700 }}
                        >
                          Reset
                        </Button>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        {/* Speed select pills */}
                        <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.15)', p: 0.5, borderRadius: 2.5, gap: 0.5 }}>
                          {[1, 2, 5, 10].map(s => (
                            <Button
                              key={s}
                              size="small"
                              onClick={() => setSpeed(s)}
                              sx={{
                                minWidth: 42,
                                py: 0.5,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                borderRadius: 2,
                                bgcolor: speed === s ? 'primary.main' : 'transparent',
                                color: speed === s ? '#fff' : 'text.secondary',
                                '&:hover': { bgcolor: speed === s ? 'primary.dark' : 'rgba(255,255,255,0.05)' }
                              }}
                            >
                              {s}x
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Live KPI widgets Grid */}
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderLeft: '4px solid #1565C0' }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            Airborne / Boarding Flights
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                              {metrics.airborne} <span style={{ fontSize: '0.9rem', color: '#5E6E82' }}>/ {metrics.boarding}</span>
                            </Typography>
                            <Chip label="LIVE" color="primary" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderLeft: '4px solid #FB8C00' }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            Delayed / Landed today
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 800 }}>
                              {metrics.delayed} <span style={{ fontSize: '0.9rem', color: '#5E6E82' }}>/ {metrics.landed}</span>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Avg: {metrics.avgDelay}m</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderLeft: '4px solid #2E7D32' }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            On-Time Performance (OTP)
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 800 }}>
                              {metrics.otp}%
                            </Typography>
                            <TrendingUp sx={{ color: 'success.main' }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ borderLeft: '4px solid #00ACC1' }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            FAA Compliance score
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 800 }}>
                              {metrics.complianceScore}%
                            </Typography>
                            <Chip label="PASSING" color="success" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Left Column: Live Activity Feed */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <History color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 850 }}>Live Operational Feed</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: 380, overflowY: 'auto', pr: 1 }}>
                        {events.map(evt => (
                          <Box 
                            key={evt.id} 
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'background.default', 
                              border: '1px solid rgba(0,0,0,0.05)', 
                              borderRadius: 3 
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Chip 
                                label={evt.type} 
                                color={evt.type === 'FLIGHT' ? 'primary' : evt.type === 'WEATHER' ? 'error' : 'secondary'} 
                                size="small" 
                                sx={{ fontSize: '0.55rem', height: 16, fontWeight: 800 }} 
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.65rem' }}>
                                {evt.timestamp}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 650 }}>
                              {evt.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right Column: Airspace Table */}
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Airspace Dispatch Schedule</Typography>
                      
                      <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Flight</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Departure/Arrival (UTC)</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {flights.map(f => (
                              <TableRow key={f.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  {f.flightNumber}
                                  <Button 
                                    size="small" 
                                    href={
                                      f.airline === 'EMIRATES' ? 'https://www.emirates.com' :
                                      f.airline === 'QATAR' ? 'https://www.qatarairways.com' :
                                      f.airline === 'SINGAPORE' ? 'https://www.singaporeair.com' :
                                      f.airline === 'LUFTHANSA' ? 'https://www.lufthansa.com' :
                                      f.airline === 'DELTA' ? 'https://www.delta.com' :
                                      f.airline === 'AIRINDIA' ? 'https://www.airindia.in' : 'https://www.google.com'
                                    }
                                    target="_blank"
                                    sx={{ display: 'block', fontSize: '0.65rem', p: 0, textTransform: 'capitalize', color: 'primary.main', minWidth: 'auto', textAlign: 'left', fontWeight: 700 }}
                                  >
                                    {f.airline.toLowerCase()}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  {f.source} ➔ {f.dest}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                  DEP: {new Date(f.departureTime).toLocaleTimeString()} / ARR: {new Date(f.arrivalTime).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={f.status} 
                                    size="small" 
                                    color={f.status === 'SCHEDULED' ? 'primary' : f.status === 'DELAYED' ? 'warning' : 'success'}
                                    sx={{ fontWeight: 800, fontSize: '0.6rem' }}
                                  />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={() => triggerAIEngine(f)}
                                    sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                                  >
                                    🤖 Optimize
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* AI workflow animation details box */}
                {aiWorkflow.active && (
                  <Grid item xs={12}>
                    <Card sx={{ border: '1px solid', borderColor: 'primary.main', boxShadow: '0 8px 32px rgba(21,101,192,0.1)' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><Psychology /></Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                LangGraph Optimization Workflow: Flight {aiWorkflow.flightNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">Continuous pipeline re-scheduler audits</Typography>
                            </Box>
                          </Box>
                          <IconButton onClick={() => setAiWorkflow({ active: false, activeStep: -1, flightNumber: '', logs: '', completed: false })}>✕</IconButton>
                        </Box>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Active Pipeline logs:</Typography>
                            <Paper sx={{ p: 2, bgcolor: 'background.default', fontFamily: 'monospace', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                              {aiWorkflow.logs}
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContet: 'center' }}>
                            {aiWorkflow.completed ? (
                              <Box sx={{ textAlign: 'center' }}>
                                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Swap recommendation ready</Typography>
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  onClick={handleApplySwap}
                                  sx={{ mt: 1.5, fontSize: '0.7rem' }}
                                >
                                  Approve swap
                                </Button>
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: 'center' }}>
                                <CircularProgress size={32} sx={{ mb: 1 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Step {aiWorkflow.activeStep}/6 running...
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

              </Grid>
            )}

            {activeTab === 'command' && <CommandCenter />}
            {activeTab === 'twin' && <DigitalTwinAirport />}
            {activeTab === 'aws' && <AWSMonitoring />}
            {activeTab === 'flights' && <FlightsManager />}
            {activeTab === 'crew' && <CrewManager />}
            {activeTab === 'roster' && <CrewRoster />}
            {activeTab === 'weather' && <WeatherMonitor />}
            {activeTab === 'workflow' && <AIWorkflow />}
            {activeTab === 'ai' && <AIChatPanel />}
            {activeTab === 'map' && <FlightMap />}
            {activeTab === 'analytics' && <LiveAnalytics />}
            {activeTab === 'reports' && <ReportsPanel />}
            {activeTab === 'airports' && <AirportManager />}
            {activeTab === 'settings' && <SettingsProfile user={user} />}
          </motion.div>
        </AnimatePresence>
      </Box>

    </Box>
  );
}

export default Dashboard;
