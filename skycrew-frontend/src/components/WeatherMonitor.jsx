import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  Grid, 
  Divider, 
  Paper,
  CircularProgress,
  Slider,
  Avatar
} from '@mui/material';
import { 
  Thunderstorm, 
  WbSunny, 
  Warning, 
  Air, 
  Visibility, 
  Speed, 
  AddAlert, 
  CheckCircle,
  Schedule,
  Dangerous,
  LocalHospital,
  Build,
  CancelPresentation,
  CheckCircleOutlined,
  FlightLand
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';

function WeatherMonitor() {
  const {
    weatherAlerts,
    setWeatherAlerts,
    setCrew,
    setFlights,
    triggerAwsUpload,
    runAiPipeline,
    addEventLog
  } = useSimulation();

  // Trigger form state
  const [airportCode, setAirportCode] = useState('KJFK');
  const [severity, setSeverity] = useState('SEVERE');
  const [weatherType, setWeatherType] = useState('STORM');
  const [message, setMessage] = useState('Heavy rain, wind shear alerts active METAR KJFK');

  const handleDeactivate = (id, code) => {
    setWeatherAlerts(prev => prev.map(w => w.id === id ? { ...w, active: false } : w));
    addEventLog(`✅ Meteorology alert resolved at ${code}`, 'WEATHER');
  };

  const handleCustomTrigger = (action) => {
    // 1. Run S3 / RDS mock upload triggers
    triggerAwsUpload(`telemetry_${action.toLowerCase()}_log.pdf`);

    // 2. Resolve target action logic
    switch (action) {
      case 'STORM':
        setWeatherAlerts(prev => {
          const copy = [...prev];
          copy[0] = { ...copy[0], severity: 'SEVERE', message: 'Convective storm warning: wind shear gusting 40kts', active: true };
          return copy;
        });
        addEventLog('⛈ Simulation Triggered: Severe wind shear storm approaching JFK', 'WEATHER');
        runAiPipeline('AA100');
        break;

      case 'FOG':
        setWeatherAlerts(prev => {
          const copy = [...prev];
          copy[0] = { ...copy[0], severity: 'MODERATE', message: 'Low visibility fog: restricted CAT III landings', active: true };
          return copy;
        });
        addEventLog('🌫 Simulation Triggered: Dense low visibility fog advisory active at LAX', 'WEATHER');
        runAiPipeline('AA200');
        break;

      case 'SNOW':
        setWeatherAlerts(prev => {
          const copy = [...prev];
          copy[2] = { ...copy[2], severity: 'MODERATE', message: 'Heavy snow: active de-icing rotation schedules', active: true };
          return copy;
        });
        addEventLog('🌨 Simulation Triggered: Blizzard advisory & active runway de-icing at ORD', 'WEATHER');
        break;

      case 'PILOT_SICK':
        setCrew(prev => prev.map(c => c.id === 1 ? { ...c, available: false } : c));
        addEventLog('🤒 Simulation Triggered: Captain John Doe flagged sick at JFK base', 'AI');
        runAiPipeline('AA300'); // Triggers crew replacement AI flow
        break;

      case 'CREW_SICK':
        setCrew(prev => prev.map(c => c.id === 5 ? { ...c, available: false } : c));
        addEventLog('🤕 Simulation Triggered: Cabin Crew Attendant Tom Brown flagged sick', 'AI');
        break;

      case 'MAINTENANCE':
        addEventLog('🛠 Simulation Triggered: Boeing 737 Tail N100AA flagged for structural maintenance checks', 'FLIGHT');
        break;

      case 'EMERGENCY':
        addEventLog('🚨 EMERGENCY: Flight AA100 declared fuel wind shear emergency landing request at JFK', 'FLIGHT');
        break;

      case 'CANCEL_FLIGHT':
        setFlights(prev => prev.map(f => f.id === 1 ? { ...f, status: 'CANCELLED' } : f));
        addEventLog('❌ Operations Cancelled: Flight AA100 cancelled due to severe grid lock', 'FLIGHT');
        break;

      case 'FORCE_LANDING':
        addEventLog('🛬 Force Landing: Flight AA200 ordered to divert to standby runway', 'FLIGHT');
        break;

      case 'CLOSE_AIRPORT':
        addEventLog('🏢 Airport Shutdown: JFK Hub Control terminated all active runway slots', 'WEATHER');
        break;

      case 'RUNWAY_CLOSED':
        addEventLog('⚡ Runway Closed: ORD Runway 04R closed due to debris inspection', 'WEATHER');
        break;

      case 'CONGESTION':
        addEventLog('🌪 Congestion Warning: LAX airspace experiencing heavy holding patterns', 'FLIGHT');
        break;

      default:
        break;
    }
  };

  return (
    <Grid container spacing={4}>
      
      {/* Left Column: Simulated Radar Sweep Visual */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Meteorological Radar</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 4 }}>Simulated airspace radar sweep coordinates (KJFK/KORD/KLAX hubs)</Typography>
            </Box>

            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                borderRadius: '50%', 
                border: '2px solid rgba(0, 172, 193, 0.3)',
                position: 'relative',
                background: 'radial-gradient(circle, rgba(0, 172, 193, 0.05) 0%, rgba(11, 25, 44, 0.4) 100%)',
                overflow: 'hidden',
                boxShadow: '0 0 20px rgba(0, 172, 193, 0.1)',
                my: 2
              }}
            >
              <Box className="radar-sweep-line" />
              <Box className="radar-point" sx={{ top: '40%', left: '35%' }} />
              <Box className="radar-point-pulse" sx={{ top: '30%', left: '70%' }} />
              <Box className="radar-point" sx={{ top: '75%', left: '60%' }} />
              <Box sx={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '15%', borderRadius: '50%', border: '1px dashed rgba(0, 172, 193, 0.15)' }} />
              <Box sx={{ position: 'absolute', top: '35%', left: '35%', right: '35%', bottom: '35%', borderRadius: '50%', border: '1px dashed rgba(0, 172, 193, 0.15)' }} />
            </Box>

            <Box sx={{ width: '100%', mt: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <Typography color="text.secondary">Radar Feed status:</Typography>
                <Typography sx={{ fontWeight: 700, color: 'success.main' }}>ONLINE (99.8% ACCURACY)</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column: Station reports & Simulation triggers */}
      <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Active weather advisories list */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Active Hub Advisories</Typography>
            <Typography variant="caption" color="text.secondary">Meteorology maps tracked by the dispatchers.</Typography>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 180, overflowY: 'auto', pr: 1 }}>
              {weatherAlerts.map(a => (
                <Paper 
                  key={a.id} 
                  sx={{ 
                    p: 2, 
                    border: '1px solid',
                    borderColor: a.active ? (a.severity === 'SEVERE' ? 'rgba(211,47,47,0.2)' : 'rgba(251,140,0,0.2)') : 'rgba(0,0,0,0.06)',
                    bgcolor: a.active ? (a.severity === 'SEVERE' ? 'rgba(211,47,47,0.02)' : 'rgba(251,140,0,0.02)') : 'transparent',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: a.active ? (a.severity === 'SEVERE' ? 'error.main' : 'warning.main') : 'action.disabledBackground', color: '#fff', width: 32, height: 32 }}>
                      {a.severity === 'SEVERE' ? <Thunderstorm fontSize="small" /> : <WbSunny fontSize="small" />}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{a.airportCode}</Typography>
                        <Chip label={a.severity} color={a.severity === 'SEVERE' ? 'error' : 'warning'} size="small" sx={{ fontSize: '0.55rem', height: 16, fontWeight: 800 }} />
                        {!a.active && <Chip label="CLEARED" size="small" variant="outlined" sx={{ fontSize: '0.55rem', height: 16 }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{a.message}</Typography>
                    </Box>
                  </Box>

                  {a.active && (
                    <Button 
                      variant="outlined" 
                      color="success" 
                      size="small"
                      onClick={() => handleDeactivate(a.id, a.airportCode)}
                      sx={{ fontSize: '0.65rem', fontWeight: 700, borderRadius: 2 }}
                    >
                      Clear alert
                    </Button>
                  )}
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Live Disruption Simulation Trigger buttons catalog */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>AOCC Operational Disruption Injectors</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Select any operational contingency below to inject simulation events into the live timeline.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="error" startIcon={<Thunderstorm />} onClick={() => handleCustomTrigger('STORM')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Simulate Storm
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="warning" startIcon={<Air />} onClick={() => handleCustomTrigger('FOG')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Simulate Fog
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="info" startIcon={<Dangerous />} onClick={() => handleCustomTrigger('SNOW')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Simulate Snow
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="error" startIcon={<LocalHospital />} onClick={() => handleCustomTrigger('PILOT_SICK')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Pilot Sick
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="warning" startIcon={<LocalHospital />} onClick={() => handleCustomTrigger('CREW_SICK')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Cabin Crew Sick
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="secondary" startIcon={<Build />} onClick={() => handleCustomTrigger('MAINTENANCE')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Maintenance
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="contained" color="error" startIcon={<Warning />} onClick={() => handleCustomTrigger('EMERGENCY')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Emergency Landing
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="error" startIcon={<CancelPresentation />} onClick={() => handleCustomTrigger('CANCEL_FLIGHT')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Cancel Flight
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="secondary" startIcon={<FlightLand />} onClick={() => handleCustomTrigger('FORCE_LANDING')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  Force Landing
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="error" onClick={() => handleCustomTrigger('CLOSE_AIRPORT')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  🏢 Close Airport
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="warning" onClick={() => handleCustomTrigger('RUNWAY_CLOSED')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  ⚡ Runway Closed
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" color="primary" onClick={() => handleCustomTrigger('CONGESTION')} sx={{ py: 1.25, fontWeight: 700, fontSize: '0.7rem' }}>
                  🌪 Airport Congestion
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

      </Grid>
    </Grid>
  );
}

export default WeatherMonitor;
