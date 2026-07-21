import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  IconButton,
  Divider
} from '@mui/material';
import { 
  Business, 
  AddCircle, 
  Edit, 
  DeleteOutlined, 
  Close,
  Explore,
  MeetingRoom,
  AirplanemodeActive
} from '@mui/icons-material';

function AirportManager() {
  const [airports, setAirports] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);

  // Form Fields
  const [icaoCode, setIcaoCode] = useState('');
  const [iataCode, setIataCode] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('United States');
  const [runways, setRunways] = useState('2');
  const [gates, setGates] = useState('25');
  const [timeZone, setTimeZone] = useState('EST');
  const [weatherRegion, setWeatherRegion] = useState('US-EAST');

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const loadAirports = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/airports', { headers });
      setAirports(res.data);
    } catch (e) {
      console.warn("Failed loading airports", e);
    }
  };

  useEffect(() => {
    loadAirports();
  }, []);

  const handleAddAirport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        icaoCode,
        iataCode,
        name,
        country,
        runways: parseInt(runways) || 2,
        gates: parseInt(gates) || 10,
        timeZone,
        weatherRegion
      };
      await axios.post('http://localhost:8080/api/airports', payload, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'admin',
        action: 'AIRPORT_CREATE',
        details: `Registered airport hub configuration: ${iataCode} (${name})`
      }, { headers });

      setShowAddModal(false);
      resetForm();
      loadAirports();
    } catch (err) {
      alert('Error creating airport: ' + err.message);
    }
  };

  const handleEditAirport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        icaoCode,
        iataCode,
        name,
        country,
        runways: parseInt(runways) || 2,
        gates: parseInt(gates) || 10,
        timeZone,
        weatherRegion
      };
      await axios.put(`http://localhost:8080/api/airports/${selectedAirport.id}`, payload, { headers });

      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'admin',
        action: 'AIRPORT_UPDATE',
        details: `Updated airport configuration: ${iataCode}`
      }, { headers });

      setShowEditModal(false);
      loadAirports();
    } catch (err) {
      alert('Error updating airport: ' + err.message);
    }
  };

  const handleDeleteAirport = async (id, iata) => {
    if (!window.confirm(`Are you sure you want to delete airport ${iata}?`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/airports/${id}`, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'admin',
        action: 'AIRPORT_DELETE',
        details: `Deleted airport configuration: ${iata}`
      }, { headers });

      loadAirports();
    } catch (err) {
      alert('Error deleting airport: ' + err.message);
    }
  };

  const resetForm = () => {
    setIcaoCode('');
    setIataCode('');
    setName('');
    setRunways('2');
    setGates('25');
    setTimeZone('EST');
    setWeatherRegion('US-EAST');
  };

  const openEditPanel = (ap) => {
    setSelectedAirport(ap);
    setIcaoCode(ap.icaoCode);
    setIataCode(ap.iataCode);
    setName(ap.name);
    setCountry(ap.country);
    setRunways(ap.runways.toString());
    setGates(ap.gates.toString());
    setTimeZone(ap.timeZone);
    setWeatherRegion(ap.weatherRegion);
    setShowEditModal(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Action Header Banner */}
      <Card sx={{ bgcolor: 'rgba(21, 101, 192, 0.05)', border: '1px solid rgba(21, 101, 192, 0.1)' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Airport Catalog Registry</Typography>
            <Typography variant="caption" color="text.secondary">Configure physical facilities, gate numbers, and local region code bindings.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => { resetForm(); setShowAddModal(true); }}
            sx={{ fontWeight: 700, borderRadius: 3, gap: 1 }}
          >
            <AddCircle fontSize="small" /> Register Airport Hub
          </Button>
        </CardContent>
      </Card>

      {/* Grid Table Ledger */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ICAO/IATA Codes</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Hub Airport Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sovereignty / Country</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Runways</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Gates Capacity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Timezone (Region)</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {airports.map(ap => (
                  <TableRow key={ap.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {ap.iataCode}
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {ap.icaoCode}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 650 }}>{ap.name}</TableCell>
                    <TableCell>{ap.country}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{ap.runways}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{ap.gates}</TableCell>
                    <TableCell>{ap.timeZone} ({ap.weatherRegion})</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <IconButton 
                          onClick={() => openEditPanel(ap)}
                          sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteAirport(ap.id, ap.iataCode)}
                          sx={{ border: '1px solid rgba(211,47,47,0.06)', borderRadius: 2 }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Airport Modal */}
      <Dialog 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2 }}>
          Register Airport Hub
        </DialogTitle>
        <Box component="form" onSubmit={handleAddAirport}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 3 }}>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="IATA Code" placeholder="e.g. JFK" value={iataCode} onChange={(e) => setIataCode(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth label="ICAO Code" placeholder="e.g. KJFK" value={icaoCode} onChange={(e) => setIcaoCode(e.target.value)} />
              </Grid>
            </Grid>

            <TextField required fullWidth label="Airport Name" placeholder="John F. Kennedy Intl" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField required fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth type="number" label="Runways" value={runways} onChange={(e) => setRunways(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth type="number" label="Gates" value={gates} onChange={(e) => setGates(e.target.value)} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="Time Zone" placeholder="EST" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Weather Region</InputLabel>
                  <Select value={weatherRegion} label="Weather Region" onChange={(e) => setWeatherRegion(e.target.value)}>
                    <MenuItem value="US-EAST">US-EAST</MenuItem>
                    <MenuItem value="US-WEST">US-WEST</MenuItem>
                    <MenuItem value="US-MIDWEST">US-MIDWEST</MenuItem>
                    <MenuItem value="EUROPE">EUROPE</MenuItem>
                    <MenuItem value="MIDDLE-EAST">MIDDLE-EAST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Button onClick={() => setShowAddModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">Commit Catalog</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Airport Modal */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Airport Hub
          <IconButton onClick={() => setShowEditModal(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleEditAirport}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 3 }}>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="IATA Code" value={iataCode} onChange={(e) => setIataCode(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth label="ICAO Code" value={icaoCode} onChange={(e) => setIcaoCode(e.target.value)} />
              </Grid>
            </Grid>

            <TextField required fullWidth label="Airport Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField required fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth type="number" label="Runways" value={runways} onChange={(e) => setRunways(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth type="number" label="Gates" value={gates} onChange={(e) => setGates(e.target.value)} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="Time Zone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Weather Region</InputLabel>
                  <Select value={weatherRegion} label="Weather Region" onChange={(e) => setWeatherRegion(e.target.value)}>
                    <MenuItem value="US-EAST">US-EAST</MenuItem>
                    <MenuItem value="US-WEST">US-WEST</MenuItem>
                    <MenuItem value="US-MIDWEST">US-MIDWEST</MenuItem>
                    <MenuItem value="EUROPE">EUROPE</MenuItem>
                    <MenuItem value="MIDDLE-EAST">MIDDLE-EAST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Button onClick={() => setShowEditModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">Update Catalog</Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
}

export default AirportManager;
