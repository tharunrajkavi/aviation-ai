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
  Chip, 
  Avatar, 
  Grid, 
  Alert, 
  Divider, 
  IconButton,
  LinearProgress 
} from '@mui/material';
import { 
  FlightTakeoff, 
  DeleteOutlined, 
  GroupAdd, 
  Warning, 
  CheckCircle, 
  Close, 
  QueryBuilder, 
  AirplanemodeActive 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function FlightsManager() {
  const [flights, setFlights] = useState([]);
  const [crew, setCrew] = useState([]);
  const [airports, setAirports] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals & Active Selections
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Add Flight Form State
  const [flightNumber, setFlightNumber] = useState('');
  const [airline, setAirline] = useState('American Airlines');
  const [aircraftId, setAircraftId] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [depTime, setDepTime] = useState('');
  const [arrTime, setArrTime] = useState('');
  
  // Assign Crew Form State
  const [assignCrewId, setAssignCrewId] = useState('');
  const [assignRole, setAssignRole] = useState('COMMANDER');
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [validationAlerts, setValidationAlerts] = useState([]);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const loadAll = async () => {
    setLoading(true);
    try {
      const fRes = await axios.get('http://localhost:8080/api/flights', { headers });
      setFlights(fRes.data);
      const cRes = await axios.get('http://localhost:8080/api/crew', { headers });
      setCrew(cRes.data);
      const aRes = await axios.get('http://localhost:8080/api/airports', { headers });
      setAirports(aRes.data);
      const acRes = await axios.get('http://localhost:8080/api/aircraft', { headers });
      setAircraft(acRes.data);
    } catch (e) {
      console.error("Failed loading flights telemetry", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddFlight = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        flightNumber,
        airline,
        aircraftId,
        sourceAirportId: sourceId,
        destinationAirportId: destId,
        departureTime: depTime + ':00',
        arrivalTime: arrTime + ':00',
        status: 'SCHEDULED'
      };
      await axios.post('http://localhost:8080/api/flights', payload, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'FLIGHT_CREATE',
        details: `Created new flight rotation: ${flightNumber}`
      }, { headers });

      setShowAddModal(false);
      resetAddForm();
      loadAll();
    } catch (err) {
      alert('Error creating flight schedule: ' + err.message);
    }
  };

  const resetAddForm = () => {
    setFlightNumber('');
    setAircraftId('');
    setSourceId('');
    setDestId('');
    setDepTime('');
    setArrTime('');
  };

  const handleDeleteFlight = async (id, num) => {
    if (!window.confirm(`Are you sure you want to delete flight ${num}?`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/flights/${id}`, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'FLIGHT_DELETE',
        details: `Deleted flight rotation: ${num}`
      }, { headers });

      loadAll();
    } catch (err) {
      alert('Error deleting flight: ' + err.message);
    }
  };

  const handleUpdateStatus = async (id, status, num) => {
    try {
      await axios.put(`http://localhost:8080/api/flights/${id}`, { status }, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'FLIGHT_STATUS_UPDATE',
        details: `Updated flight ${num} status to ${status}`
      }, { headers });

      loadAll();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const openAssignPanel = async (flight) => {
    setSelectedFlight(flight);
    setShowAssignModal(true);
    setValidationAlerts([]);
    try {
      const res = await axios.get(`http://localhost:8080/api/flights/${flight.id}/assignments`, { headers });
      setActiveAssignments(res.data);
    } catch (err) {
      console.warn("Failed fetching active assignments", err);
    }
  };

  const runPreAssignmentValidation = (crewId, role) => {
    const alerts = [];
    const member = crew.find(c => c.id === parseInt(crewId));
    if (!member) return;

    if (member.restHoursRemaining < 10.0) {
      alerts.push({
        type: 'DANGER',
        msg: `⚠️ REST VIOLATION: ${member.name} has only ${member.restHoursRemaining}h rest. FAA requires min 10h.`
      });
    }

    if (!member.available) {
      alerts.push({
        type: 'WARNING',
        msg: `⚠️ AVAILABILITY: ${member.name} is currently flagged as UNAVAILABLE.`
      });
    }

    if (member.type === 'PILOT') {
      const targetModel = selectedFlight.aircraft?.model?.split(' ')[0] || '';
      const isQualified = member.certifications?.toLowerCase().includes(targetModel.toLowerCase()) || 
                          member.certifications?.toLowerCase().includes(selectedFlight.aircraft?.model?.toLowerCase());
      if (!isQualified) {
        alerts.push({
          type: 'WARNING',
          msg: `⚠️ QUALIFICATION: ${member.name} does not hold a certified type rating for aircraft ${selectedFlight.aircraft?.model}.`
        });
      }
    }

    if ((role === 'COMMANDER' || role === 'CO_PILOT') && member.type !== 'PILOT') {
      alerts.push({
        type: 'DANGER',
        msg: `⚠️ ROLE CONFLICT: Cannot assign cabin crew member ${member.name} to flight officer deck role.`
      });
    }
    if ((role === 'CABIN_LEADER' || role === 'CABIN_MEMBER') && member.type !== 'CABIN_CREW') {
      alerts.push({
        type: 'DANGER',
        msg: `⚠️ ROLE CONFLICT: Cannot assign pilot ${member.name} to cabin service deck role.`
      });
    }

    setValidationAlerts(alerts);
  };

  const handleAssignCrew = async (e) => {
    e.preventDefault();
    if (!assignCrewId) return;

    try {
      const payload = {
        crewMemberId: assignCrewId,
        role: assignRole,
        status: 'ASSIGNED'
      };
      await axios.post(`http://localhost:8080/api/flights/${selectedFlight.id}/assign`, payload, { headers });
      
      const member = crew.find(c => c.id === parseInt(assignCrewId));
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'CREW_ASSIGN',
        details: `Assigned ${member?.name} as ${assignRole} to Flight ${selectedFlight.flightNumber}`
      }, { headers });

      const res = await axios.get(`http://localhost:8080/api/flights/${selectedFlight.id}/assignments`, { headers });
      setActiveAssignments(res.data);
      setAssignCrewId('');
      setValidationAlerts([]);
    } catch (err) {
      alert('Error assigning crew: ' + err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Search Header Banner */}
      <Card sx={{ bgcolor: 'rgba(21, 101, 192, 0.05)', border: '1px solid rgba(21, 101, 192, 0.1)' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Flight Rotations Schedule</Typography>
            <Typography variant="caption" color="text.secondary">Create schedules, assign qualified flight officers, and monitor slots.</Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAddModal(true)}
            sx={{ fontWeight: 700, borderRadius: 3, gap: 1 }}
          >
            <FlightTakeoff fontSize="small" /> Create Flight Rotation
          </Button>
        </CardContent>
      </Card>

      {/* Progress Loading Bar */}
      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {/* Grid Table Ledger */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Flight rotation</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Routing sectors</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Aircraft tail</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Departure/Arrival (UTC)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Duty status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flights.map(f => (
                  <TableRow key={f.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {f.flightNumber}
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 500 }}>
                        {f.airline}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={f.sourceAirport?.iataCode} size="small" sx={{ fontWeight: 700 }} />
                      <Typography variant="caption" sx={{ mx: 1, color: 'text.secondary' }}>➔</Typography>
                      <Chip label={f.destinationAirport?.iataCode} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>{f.aircraft?.model}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{f.aircraft?.tailNumber}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      <div>DEP: {new Date(f.departureTime).toLocaleString()}</div>
                      <div>ARR: {new Date(f.arrivalTime).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={f.status}
                        onChange={(e) => handleUpdateStatus(f.id, e.target.value, f.flightNumber)}
                        style={{
                          background: 'rgba(0,0,0,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          color: 'inherit',
                          fontWeight: 700
                        }}
                      >
                        <option value="SCHEDULED" style={{ background: '#0B192C' }}>SCHEDULED</option>
                        <option value="DELAYED" style={{ background: '#0B192C' }}>DELAYED</option>
                        <option value="CANCELLED" style={{ background: '#0B192C' }}>CANCELLED</option>
                        <option value="COMPLETED" style={{ background: '#0B192C' }}>COMPLETED</option>
                      </select>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'inline-flex', gap: 1 }}>
                        <IconButton 
                          color="primary" 
                          onClick={() => openAssignPanel(f)}
                          sx={{ border: '1px solid rgba(21,101,192,0.1)', borderRadius: 2 }}
                        >
                          <GroupAdd fontSize="small" />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteFlight(f.id, f.flightNumber)}
                          sx={{ border: '1px solid rgba(211,47,47,0.1)', borderRadius: 2 }}
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

      {/* Add Flight Modal Dialog */}
      <Dialog 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2 }}>
          Schedule Rotation
        </DialogTitle>
        <Box component="form" onSubmit={handleAddFlight}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 3 }}>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField 
                  required 
                  fullWidth 
                  label="Flight Number" 
                  placeholder="e.g. AA302"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  required 
                  fullWidth 
                  label="Airline" 
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Aircraft Fleet Allocation</InputLabel>
              <Select
                required
                value={aircraftId}
                label="Aircraft Fleet Allocation"
                onChange={(e) => setAircraftId(e.target.value)}
              >
                {aircraft.map(ac => (
                  <MenuItem key={ac.id} value={ac.id}>
                    {ac.model} ({ac.tailNumber}) - {ac.maintenanceStatus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Source Hub</InputLabel>
                  <Select
                    required
                    value={sourceId}
                    label="Source Hub"
                    onChange={(e) => setSourceId(e.target.value)}
                  >
                    {airports.map(ap => (
                      <MenuItem key={ap.id} value={ap.id}>{ap.iataCode}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Destination Hub</InputLabel>
                  <Select
                    required
                    value={destId}
                    label="Destination Hub"
                    onChange={(e) => setDestId(e.target.value)}
                  >
                    {airports.map(ap => (
                      <MenuItem key={ap.id} value={ap.id}>{ap.iataCode}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField 
              required 
              fullWidth 
              type="datetime-local" 
              label="Departure Time" 
              InputLabelProps={{ shrink: true }}
              value={depTime}
              onChange={(e) => setDepTime(e.target.value)}
            />

            <TextField 
              required 
              fullWidth 
              type="datetime-local" 
              label="Arrival Time" 
              InputLabelProps={{ shrink: true }}
              value={arrTime}
              onChange={(e) => setArrTime(e.target.value)}
            />

          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Button onClick={() => setShowAddModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">Commit rotation</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Roster Assignment Modal Dialog */}
      <Dialog 
        open={showAssignModal} 
        onClose={() => setShowAssignModal(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 700 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Roster Management</Typography>
            {selectedFlight && (
              <Typography variant="caption" color="text.secondary">
                Flight {selectedFlight.flightNumber} ({selectedFlight.sourceAirport?.iataCode} ➔ {selectedFlight.destinationAirport?.iataCode})
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setShowAssignModal(false)}><Close /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={4}>
            
            {/* Left Panel: Active Assignments */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Active Assignments</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 320, overflowY: 'auto' }}>
                {activeAssignments.map(a => (
                  <Paper key={a.id} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'rgba(21,101,192,0.1)', color: 'primary.main', width: 32, height: 32 }}>
                        <AirplanemodeActive fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.crewMember?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.role} ({a.crewMember?.type})</Typography>
                      </Box>
                    </Box>
                    <Chip label={a.status} color="success" size="small" sx={{ fontWeight: 800, fontSize: '0.6rem' }} />
                  </Paper>
                ))}
                {activeAssignments.length === 0 && (
                  <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Warning color="disabled" />
                    <Typography variant="caption" color="text.secondary">No flight deck crew assigned.</Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Right Panel: Add Crew Form & FAA compliance validations */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Assign Crew member</Typography>
              
              <Box component="form" onSubmit={handleAssignCrew} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Crew Member</InputLabel>
                  <Select
                    required
                    value={assignCrewId}
                    label="Crew Member"
                    onChange={(e) => {
                      setAssignCrewId(e.target.value);
                      runPreAssignmentValidation(e.target.value, assignRole);
                    }}
                  >
                    {crew.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.qualification}) - Rest: {c.restHoursRemaining}h
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Duty Deck Role</InputLabel>
                  <Select
                    value={assignRole}
                    label="Duty Deck Role"
                    onChange={(e) => {
                      setAssignRole(e.target.value);
                      if (assignCrewId) runPreAssignmentValidation(assignCrewId, e.target.value);
                    }}
                  >
                    <MenuItem value="COMMANDER">Commander (Captain)</MenuItem>
                    <MenuItem value="CO_PILOT">First Officer (Co-Pilot)</MenuItem>
                    <MenuItem value="CABIN_LEADER">Cabin Leader (Purser)</MenuItem>
                    <MenuItem value="CABIN_MEMBER">Cabin Member (Attendant)</MenuItem>
                  </Select>
                </FormControl>

                {/* Validation warnings banner */}
                <AnimatePresence>
                  {validationAlerts.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Alert severity="warning" sx={{ borderRadius: 3, fontSize: '0.75rem', py: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {validationAlerts.map((val, index) => (
                            <div key={index} style={{ fontWeight: val.type === 'DANGER' ? 700 : 500 }}>
                              {val.msg}
                            </div>
                          ))}
                        </Box>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={validationAlerts.some(a => a.type === 'DANGER')}
                  sx={{ py: 1.25, fontWeight: 700 }}
                >
                  Assign to flight rotation
                </Button>
              </Box>
            </Grid>

          </Grid>
        </DialogContent>
      </Dialog>

    </Box>
  );
}

export default FlightsManager;
