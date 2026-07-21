import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Divider, 
  Chip, 
  Button,
  LinearProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  Slider,
  CircularProgress
} from '@mui/material';
import { 
  Mic, 
  Security, 
  LocalGasStation, 
  Co2, 
  Engineering, 
  Search, 
  PlayArrow, 
  Pause, 
  FastForward, 
  Help, 
  WorkspacePremium,
  VolumeUp
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';

function CommandCenter() {
  const { flights, crew, weatherAlerts } = useSimulation();

  // Voice assistant states
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [voiceSpeaking, setSpeaking] = useState(false);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');

  // What-if simulator states
  const [selectedDisruption, setSelectedDisruption] = useState('STORM_5H');
  const [whatIfResults, setWhatIfResults] = useState({
    delayedFlights: 3,
    avgDelayIncrease: 45,
    suggestedAction: 'Divert flight EK201 to LAX; swap standby Captain Jane Smith.'
  });

  // Replay scrubbing states
  const [replayProgress, setReplayProgress] = useState(35);
  const [replayPlaying, setReplayPlaying] = useState(false);

  // Voice AI command handler using Text-To-Speech Synthesis
  const handleVoiceCommand = (commandText) => {
    setVoiceQuery(commandText);
    let reply = "Processing command. Scanning airspace parameters.";
    
    const cmd = commandText.toLowerCase();
    if (cmd.includes('delay')) {
      reply = "Scanning database. Three flights are currently experiencing weather delays at New York JFK.";
    } else if (cmd.includes('weather') || cmd.includes('storm')) {
      reply = "Warning. Severe thunderstorm warning is active at JFK Hub. Restricted slot queues active.";
    } else if (cmd.includes('pilot') || cmd.includes('crew')) {
      reply = "Roster audit complete. Captain John Doe has flagged rest violation. Standby Captain Jane Smith is available.";
    } else if (cmd.includes('report')) {
      reply = "Daily operations report compiled successfully. S3 archive ready for backup sync.";
    } else if (cmd.includes('airport')) {
      reply = "Dubai airport is clear VFR. Delhi is experiencing fog with restricted visibility.";
    }

    setVoiceResponse(reply);
    
    // Web Speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // What-if calculation logic
  const handleWhatIfChange = (disruption) => {
    setSelectedDisruption(disruption);
    if (disruption === 'STORM_5H') {
      setWhatIfResults({
        delayedFlights: 4,
        avgDelayIncrease: 60,
        suggestedAction: 'Divert flight EK201 to LAX. Swap Captain John Doe with Standby Captain Jane Smith to prevent fatigue violations.'
      });
    } else if (disruption === 'AIRPORT_CLOSE') {
      setWhatIfResults({
        delayedFlights: 8,
        avgDelayIncrease: 120,
        suggestedAction: 'Ground all outbound rotations. Re-route inbound sectors to Dubai DXB. Shift crew schedules by 6 hours.'
      });
    } else {
      setWhatIfResults({
        delayedFlights: 2,
        avgDelayIncrease: 30,
        suggestedAction: 'Deploy reserve pilot FO Bob Johnson from standby deck. RDS status synced.'
      });
    }
  };

  // Live scrubbing timer
  useEffect(() => {
    if (!replayPlaying) return;
    const timer = setInterval(() => {
      setReplayProgress(p => (p >= 100 ? 0 : p + 5));
    }, 1000);
    return () => clearInterval(timer);
  }, [replayPlaying]);

  // Compute live system risk score from weather severity
  const activeSeverityStorm = weatherAlerts.some(w => w.active && w.severity === 'SEVERE');
  const systemRiskScore = activeSeverityStorm ? 85 : 32;

  // Search filter matches
  const filteredFlights = flights.filter(f => 
    f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.dest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.captain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Grid container spacing={4}>
      
      {/* 1. Global search header & Voice Assistant */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: 'rgba(21,101,192,0.03)', border: '1px solid rgba(21,101,192,0.1)' }}>
          <CardContent sx={{ p: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
            
            {/* Global Search Bar */}
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Global Search (Flight #, Pilot, Hub Airport...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            {/* Voice assistant trigger */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant={voiceSpeaking ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                onClick={() => handleVoiceCommand("Show delayed flights due to weather")}
                startIcon={voiceSpeaking ? <CircularProgress size={14} color="inherit" /> : <Mic />}
                sx={{ fontWeight: 800 }}
              >
                Voice AI Assistant
              </Button>
              {voiceResponse && (
                <Paper sx={{ px: 2, py: 1, bgcolor: 'background.default', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 650, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VolumeUp fontSize="inherit" color="secondary" /> AI Response: {voiceResponse}
                  </Typography>
                </Paper>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Render search results if query is active */}
      {searchQuery && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Search results found:</Typography>
              <Grid container spacing={2}>
                {filteredFlights.map(f => (
                  <Grid item xs={12} sm={4} key={f.id}>
                    <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Flight {f.flightNumber}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Sector: {f.source} ➔ {f.dest} | Captain: {f.captain}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* 2. Left Column: AI Risk Engine & What-If Planner */}
      <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* AI Risk Engine */}
        <Card sx={{ borderLeft: `6px solid ${systemRiskScore > 50 ? '#D32F2F' : '#2E7D32'}` }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContet: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 850 }}>Operational Risk Index</Typography>
              <Security color={systemRiskScore > 50 ? 'error' : 'success'} />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContet: 'center' }}>
                <CircularProgress variant="determinate" value={systemRiskScore} size={80} strokeWidth={8} color={systemRiskScore > 50 ? 'error' : 'success'} />
                <Typography variant="subtitle1" sx={{ position: 'absolute', fontWeight: 900 }}>{systemRiskScore}%</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Risk level: {systemRiskScore > 50 ? 'SEVERE EXPOSURE' : 'LOW RISK'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Evaluated from convective cells, gate loads, and pilot hours limits.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* AI What-If Simulator */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>AI What-If Simulator</Typography>
            <Typography variant="caption" color="text.secondary">Model operations and forecast impact limits.</Typography>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant={selectedDisruption === 'STORM_5H' ? 'contained' : 'outlined'} size="small" onClick={() => handleWhatIfChange('STORM_5H')} sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  Storm (5 Hrs)
                </Button>
                <Button variant={selectedDisruption === 'AIRPORT_CLOSE' ? 'contained' : 'outlined'} size="small" onClick={() => handleWhatIfChange('AIRPORT_CLOSE')} sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  Close JFK Hub
                </Button>
              </Box>

              <Paper sx={{ p: 2, bgcolor: 'background.default', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Delayed Flights:</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'warning.main' }}>+{whatIfResults.delayedFlights}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Average Delay:</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>+{whatIfResults.avgDelayIncrease} mins</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Suggested AI Action:</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 650, mt: 0.5, lineHeight: 1.5 }}>
                      {whatIfResults.suggestedAction}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </CardContent>
        </Card>

        {/* Gamification Badges */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WorkspacePremium color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 850 }}>Dispatcher Gamification</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>OPERATIONS LEVEL</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>LVL 12 DISPATCHER</Typography>
              </Box>
              <Chip label="960 EXP" color="primary" size="small" sx={{ fontWeight: 800, ml: 'auto' }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip label="🥇 Compliance Pro" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
              <Chip label="⚡ Fast Resolver" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
              <Chip label="🌿 Green Router" size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
            </Box>
          </CardContent>
        </Card>

      </Grid>

      {/* 3. Right Column: Fuel & Carbon, Replay scrubbing, Maintenance */}
      <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Fuel & Carbon emissions metrics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalGasStation color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Fleet Fuel Analytics</Typography>
                </Box>
                <Grid container spacing={1.5} sx={{ fontSize: '0.75rem' }}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="caption">Total Fuel Burned:</Typography>
                    <Typography sx={{ fontWeight: 800 }}>124,500 gal</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="caption">Refueling cost:</Typography>
                    <Typography sx={{ fontWeight: 800 }}>$342,000</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Co2 color="secondary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Carbon Footprint Index</Typography>
                </Box>
                <Grid container spacing={1.5} sx={{ fontSize: '0.75rem' }}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="caption">CO₂ Emissions:</Typography>
                    <Typography sx={{ fontWeight: 800, color: 'error.main' }}>12.4 Tons</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="caption">Efficiency rating:</Typography>
                    <Typography sx={{ fontWeight: 800, color: 'success.main' }}>94.2% ECO SCORE</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Flight Replay Timeline Scrubbing */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Flight Replay & Scrubbing Center</Typography>
            <Typography variant="caption" color="text.secondary">Scrub and inspect completed rotations history timelines.</Typography>

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => setReplayPlaying(!replayPlaying)}
                startIcon={replayPlaying ? <Pause /> : <PlayArrow />}
                sx={{ minWidth: 120, fontWeight: 700 }}
              >
                {replayPlaying ? 'Pause' : 'Replay'}
              </Button>
              
              <Box sx={{ flex: 1 }}>
                <Slider 
                  value={replayProgress} 
                  onChange={(e, val) => setReplayProgress(val)} 
                  aria-labelledby="replay-scrubber-slider" 
                />
              </Box>

              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                {replayProgress}% Progress
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Fleet health & Predictive Maintenance */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Engineering color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Predictive Fleet Maintenance Logs</Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main', mb: 1.5 }}>
                    Healthy Rotations
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>Boeing 777 (Tail N100AA):</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Hydraulics pressure: 3,000 PSI (Optimal). Engine Temp: 680°C.
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>Airbus A380 (Tail N200AA):</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Landing Gear clearance: PASS. Brake Wear: 12% logged.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, border: '1px solid rgba(211,47,47,0.2)', bgcolor: 'rgba(211,47,47,0.02)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.main', mb: 1.5 }}>
                    Active Maintenance Alerts
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'error.main' }}>
                    ⚠️ Airbus A350 (Tail N300AA):
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Predicted brake pad fatigue failure probability: 85% within next 10 flight hours.
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'warning.main' }}>
                    ⚠️ Boeing 787 (Tail N400AA):
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Cabin pressurization valve sensor logs: fluctuation anomaly registered.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

      </Grid>

    </Grid>
  );
}

export default CommandCenter;
