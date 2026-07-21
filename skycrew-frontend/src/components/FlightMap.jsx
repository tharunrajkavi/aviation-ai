import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Chip, 
  Divider,
  Paper 
} from '@mui/material';
import { Speed, Height, LocalGasStation, Security, Sync, FlightTakeoff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSimulation, AIRPORTS, AIRLINES, AIRCRAFT_TYPES } from '../context/SimulationContext';

// Fix Leaflet marker icons utilizing DivIcon SVG styles
const getAirportIcon = (code) => L.divIcon({
  html: `<div style="width: 34px; height: 34px; border-radius: 50%; background: #0B192C; border: 2px solid #00ACC1; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 9px; color: #fff; box-shadow: 0 4px 12px rgba(0,172,193,0.35);">${code}</div>`,
  className: 'custom-airport-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const getPlaneIcon = (color) => L.divIcon({
  html: `<div style="font-size: 22px; color: ${color}; transform: rotate(45deg); text-shadow: 0 2px 6px rgba(0,0,0,0.4); transition: all 0.5s linear;">✈️</div>`,
  className: 'custom-plane-icon',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const getPlaneCoords = (srcCode, destCode, progress) => {
  const src = AIRPORTS[srcCode]?.coords;
  const dest = AIRPORTS[destCode]?.coords;
  if (!src || !dest) return [20.0, 77.0];
  
  const lat = src[0] + (dest[0] - src[0]) * progress;
  const lng = src[1] + (dest[1] - src[1]) * progress;
  return [lat, lng];
};

const getFlightHeading = (srcCode, destCode) => {
  const src = AIRPORTS[srcCode]?.coords;
  const dest = AIRPORTS[destCode]?.coords;
  if (!src || !dest) return 90;
  
  const dLng = dest[1] - src[1];
  const dLat = dest[0] - src[0];
  const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  return Math.round((angle + 360) % 360);
};

function FlightMap() {
  const { flights } = useSimulation();
  const [selectedFlight, setSelectedFlight] = useState(null);

  const getAirlineDomain = (code) => {
    const domains = {
      EMIRATES: 'https://www.emirates.com',
      QATAR: 'https://www.qatarairways.com',
      SINGAPORE: 'https://www.singaporeair.com',
      LUFTHANSA: 'https://www.lufthansa.com',
      DELTA: 'https://www.delta.com',
      AIRINDIA: 'https://www.airindia.in'
    };
    return domains[code] || 'https://www.google.com';
  };

  return (
    <Grid container spacing={4} sx={{ height: 600 }}>
      
      {/* Left Column: Airspace status log list */}
      <Grid item xs={12} lg={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CardContent sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Airspace Telemetry Desk</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Monitor live aircraft and routes representing global airline fleets.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
              {flights.map(f => {
                const airlineObj = AIRLINES[f.airline];
                const aircraftObj = AIRCRAFT_TYPES[f.aircraft];
                const isSelected = selectedFlight?.id === f.id;
                
                return (
                  <Paper
                    key={f.id}
                    onClick={() => setSelectedFlight(f)}
                    sx={{
                      p: 2.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? airlineObj?.color || 'primary.main' : 'rgba(0,0,0,0.05)',
                      bgcolor: isSelected ? 'action.hover' : 'background.paper',
                      transition: 'all 0.25s ease',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.1rem' }}>{airlineObj?.logo}</span>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {f.flightNumber}
                        </Typography>
                      </Box>
                      <Chip 
                        label={airlineObj?.name} 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getAirlineDomain(f.airline), '_blank');
                        }}
                        sx={{ 
                          fontSize: '0.6rem', 
                          height: 18, 
                          fontWeight: 800, 
                          color: '#fff', 
                          bgcolor: airlineObj?.color || 'primary.main',
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.85 }
                        }} 
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                      Sector: {f.source} ({AIRPORTS[f.source]?.city}) ➔ {f.dest} ({AIRPORTS[f.dest]?.city})
                    </Typography>

                    {isSelected && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                        <Divider sx={{ my: 1.5 }} />
                        <Grid container spacing={1.5} sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Speed sx={{ fontSize: 13 }} /> {f.speed}
                          </Grid>
                          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Height sx={{ fontSize: 13 }} /> {f.altitude}
                          </Grid>
                          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocalGasStation sx={{ fontSize: 13 }} /> {f.fuel} gal
                          </Grid>
                          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Security sx={{ fontSize: 13 }} /> Risk Index: {f.riskScore}%
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>
                              AIRCRAFT: {aircraftObj?.model} (Cap: {aircraftObj?.capacity})
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>
                              COMMAND PIC: {f.captain}
                            </Typography>
                          </Grid>
                        </Grid>
                      </motion.div>
                    )}
                  </Paper>
                );
              })}
            </Box>

            {selectedFlight && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setSelectedFlight(null)}
                sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}
                fullWidth
              >
                Clear Map Filter
              </Button>
            )}

          </CardContent>
        </Card>
      </Grid>

      {/* Right Column: Leaflet Map Container */}
      <Grid item xs={12} lg={8} sx={{ height: '100%' }}>
        <Box sx={{ height: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <MapContainer 
            center={[30.0, 45.0]} 
            zoom={3} 
            style={{ height: '100%', width: '100%', background: '#0B192C' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Airport Markers */}
            {Object.entries(AIRPORTS).map(([code, details]) => (
              <Marker key={code} position={details.coords} icon={getAirportIcon(code)}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', padding: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#00ACC1' }}>{details.name} ({code})</div>
                    <div style={{ fontSize: 11, color: '#5E6E82', marginTop: 2 }}>City: {details.city}</div>
                    <div style={{ fontSize: 10, color: '#7E8E9E' }}>Runways: {details.runways}</div>
                    <div style={{ fontSize: 10, color: '#7E8E9E' }}>Gates: {details.gates}</div>
                    <Chip 
                      label={details.status} 
                      color={details.status.includes('Storm') || details.status.includes('Fog') ? 'error' : 'success'} 
                      size="small" 
                      sx={{ mt: 1.5, fontSize: '0.65rem', height: 18, fontWeight: 800 }} 
                    />
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Flight routes and planes */}
            {flights.map(f => {
              const airlineObj = AIRLINES[f.airline];
              const aircraftObj = AIRCRAFT_TYPES[f.aircraft];
              const srcCoords = AIRPORTS[f.source]?.coords;
              const destCoords = AIRPORTS[f.dest]?.coords;
              const planeCoords = getPlaneCoords(f.source, f.dest, f.progress);
              const heading = getFlightHeading(f.source, f.dest);
              const isSelected = selectedFlight?.id === f.id;

              return (
                <React.Fragment key={f.id}>
                  {srcCoords && destCoords && (
                    <Polyline 
                      positions={[srcCoords, destCoords]} 
                      color={isSelected ? airlineObj?.color || '#1565C0' : 'rgba(255,255,255,0.08)'}
                      weight={isSelected ? 4 : 1.5}
                      dashArray={isSelected ? undefined : "5,5"}
                    />
                  )}
                  
                  <Marker position={planeCoords} icon={getPlaneIcon(airlineObj?.color || '#fff')}>
                    <Popup>
                      <div style={{ fontFamily: 'Inter, sans-serif', padding: 4, minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: '1.2rem' }}>{airlineObj?.logo}</span>
                          <span style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{f.flightNumber}</span>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#00ACC1' }}>
                          {f.source} ({AIRPORTS[f.source]?.city}) ➔ {f.dest} ({AIRPORTS[f.dest]?.city})
                        </div>
                        <Divider style={{ margin: '8px 0', opacity: 0.1 }} />
                        <div style={{ fontSize: 10, color: '#b0bec5' }}>Aircraft: {aircraftObj?.model}</div>
                        <div style={{ fontSize: 10, color: '#b0bec5' }}>Speed: {f.speed} / Alt: {f.altitude}</div>
                        <div style={{ fontSize: 10, color: '#b0bec5' }}>Heading angle: {heading}°</div>
                        <div style={{ fontSize: 10, color: '#b0bec5' }}>Fuel remaining: {f.fuel} gal</div>
                        <div style={{ fontSize: 10, color: '#b0bec5' }}>Command PIC: {f.captain}</div>
                        <div style={{ fontSize: 10, color: '#b0bec5' }}>Status: {f.phase}</div>
                        <Chip 
                          label={`Risk Score: ${f.riskScore}%`} 
                          color={f.riskScore > 30 ? 'error' : 'success'} 
                          size="small" 
                          sx={{ mt: 1.5, fontSize: '0.6rem', height: 16, fontWeight: 800 }} 
                        />
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </Box>
      </Grid>

    </Grid>
  );
}

export default FlightMap;
