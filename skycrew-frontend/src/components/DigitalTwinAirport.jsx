import React, { useState, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  LocalAirport, 
  SettingsInputComponent, 
  FlightTakeoff, 
  Commute, 
  PinDrop, 
  LocalGasStation,
  Engineering,
  Traffic
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function DigitalTwinAirport() {
  const [activeAirport, setActiveAirport] = useState('DXB'); // DXB, SIN, JFK
  const [vehicles, setVehicles] = useState([
    { id: 1, name: 'Fuel Truck #3', type: 'FUEL', progress: 0.1, status: 'EN ROUTE' },
    { id: 2, name: 'Baggage Loader #8', type: 'BAG', progress: 0.45, status: 'LOADING' },
    { id: 3, name: 'Catering Bus #1', type: 'CATERING', progress: 0.8, status: 'DOCKING' }
  ]);

  const [trafficQueue, setTrafficQueue] = useState({
    landing: ['EK201', 'QR703'],
    takeoff: ['SQ308', 'AI101'],
    runwayOccupancy: 35,
    gateOccupancy: 82
  });

  // Ticking vehicle movement coordinates
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        let nextProg = v.progress + 0.05;
        let nextStatus = v.status;
        if (nextProg >= 1.0) {
          nextProg = 0.0;
          nextStatus = v.status === 'EN ROUTE' ? 'SERVICE_ACTIVE' : 'EN ROUTE';
        }
        return { ...v, progress: nextProg, status: nextStatus };
      }));

      setTrafficQueue(prev => ({
        ...prev,
        runwayOccupancy: Math.max(10, Math.min(95, prev.runwayOccupancy + Math.floor(Math.random() * 11) - 5)),
        gateOccupancy: Math.max(40, Math.min(100, prev.gateOccupancy + Math.floor(Math.random() * 7) - 3))
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Grid container spacing={4}>
      
      {/* Selector Hub header */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: 'rgba(0,172,193,0.03)', border: '1px solid rgba(0,172,193,0.1)' }}>
          <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContet: 'space-between', alignItems: 'center', p: 3, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Digital Twin Airport Simulator</Typography>
              <Typography variant="caption" color="text.secondary">Real-time taxi tracks, docking gates, ground vehicles, and runway occupancy metrics.</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
              {['DXB', 'SIN', 'JFK'].map(hub => (
                <Button
                  key={hub}
                  variant={activeAirport === hub ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setActiveAirport(hub)}
                  sx={{ fontWeight: 700 }}
                >
                  {hub} Digital Twin
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* SVG Canvas Twin Animation */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>
              Live Airport Layout Visual ({activeAirport})
            </Typography>

            <Box 
              sx={{ 
                position: 'relative', 
                height: 380, 
                bgcolor: '#070F19', 
                borderRadius: 4, 
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden'
              }}
            >
              {/* Conic Rotating Radar */}
              <Box className="radar-sweep-line" sx={{ opacity: 0.12 }} />

              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                {/* Runways */}
                <line x1="50" y1="320" x2="650" y2="320" stroke="rgba(255,255,255,0.15)" strokeWidth="16" strokeDasharray="15,10" />
                <line x1="50" y1="320" x2="650" y2="320" stroke="#FB8C00" strokeWidth="2" strokeDasharray="5,15" />
                <text x="70" y="310" fill="#FB8C00" fontSize="10" fontFamily="monospace">RUNWAY 12L/30R</text>

                {/* Taxiway lanes */}
                <path d="M 100 240 Q 200 180 300 240 T 500 240" fill="none" stroke="rgba(0, 172, 193, 0.25)" strokeWidth="6" strokeDasharray="5,5" />
                <text x="180" y="210" fill="rgba(0,172,193,0.6)" fontSize="9" fontFamily="monospace">TAXIWAY CHARLIE</text>

                {/* Gate Bays */}
                {/* Gate A1 */}
                <rect x="150" y="50" width="80" height="60" fill="rgba(30,62,98,0.25)" stroke="rgba(255,255,255,0.1)" rx="8" />
                <text x="175" y="42" fill="#fff" fontSize="10" fontWeight="bold">GATE A1</text>
                
                {/* Gate A2 */}
                <rect x="350" y="50" width="80" height="60" fill="rgba(30,62,98,0.25)" stroke="rgba(255,255,255,0.1)" rx="8" />
                <text x="375" y="42" fill="#fff" fontSize="10" fontWeight="bold">GATE A2</text>

                {/* Blinking airport taxiway lights */}
                <circle cx="100" cy="240" r="3" fill="#2E7D32" />
                <circle cx="200" cy="210" r="3" fill="#2E7D32" />
                <circle cx="300" cy="240" r="3" fill="#2E7D32" />
                <circle cx="400" cy="225" r="3" fill="#2E7D32" />

                {/* Moving Ground vehicle indicator */}
                {vehicles.map(v => {
                  const pathX = 100 + v.progress * 400;
                  const pathY = 240 + Math.sin(v.progress * Math.PI) * 30;
                  return (
                    <g key={v.id}>
                      <circle cx={pathX} cy={pathY} r="6" fill={v.type === 'FUEL' ? '#D32F2F' : '#00ACC1'} />
                      <text x={pathX + 8} y={pathY + 3} fill="#fff" fontSize="8" fontFamily="monospace">{v.name}</text>
                    </g>
                  );
                })}

                {/* Docked Plane at Gate A1 */}
                <text x="165" y="85" fontSize="24">✈️</text>
                <text x="165" y="102" fill="rgba(0,172,193,0.8)" fontSize="8" fontFamily="monospace" fontWeight="bold">DOCKING: EK201</text>
              </svg>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Traffic Metrics Column */}
      <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* ATC stats */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Traffic color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Air Traffic Controller</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.7rem' }}>
                  <Typography color="text.secondary" variant="caption">Runway Slot Load:</Typography>
                  <Typography sx={{ fontWeight: 700 }} color={trafficQueue.runwayOccupancy > 80 ? 'error.main' : 'text.primary'}>
                    {trafficQueue.runwayOccupancy}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={trafficQueue.runwayOccupancy} color={trafficQueue.runwayOccupancy > 80 ? 'error' : 'primary'} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.7rem' }}>
                  <Typography color="text.secondary" variant="caption">Gate Occupancy index:</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{trafficQueue.gateOccupancy}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={trafficQueue.gateOccupancy} color="secondary" />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  LANDING QUEUE
                </Typography>
                <List size="small" sx={{ p: 0 }}>
                  {trafficQueue.landing.map(f => (
                    <ListItem key={f} sx={{ p: 0, py: 0.5 }}>
                      <Chip label={f} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.6rem', fontWeight: 800 }} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  TAKEOFF QUEUE
                </Typography>
                <List size="small" sx={{ p: 0 }}>
                  {trafficQueue.takeoff.map(f => (
                    <ListItem key={f} sx={{ p: 0, py: 0.5 }}>
                      <Chip label={f} size="small" variant="outlined" color="secondary" sx={{ fontSize: '0.6rem', fontWeight: 800 }} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Ground Support Fleet status */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Ground Support Equipment</Typography>
            <Typography variant="caption" color="text.secondary">Live metrics for ground fleet support services.</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              {vehicles.map(v => (
                <Paper key={v.id} sx={{ p: 1.5, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 750, fontSize: '0.85rem' }}>{v.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Services: {v.type}</Typography>
                  </Box>
                  <Chip label={v.status} size="small" color={v.status === 'LOADING' ? 'warning' : 'primary'} sx={{ fontSize: '0.6rem', fontWeight: 800 }} />
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

      </Grid>
    </Grid>
  );
}

export default DigitalTwinAirport;
