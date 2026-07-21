import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Avatar, 
  Grid, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  LinearProgress,
  Divider,
  Alert
} from '@mui/material';
import { 
  Search, 
  FileDownload, 
  PersonAdd, 
  Settings, 
  DeleteOutlined, 
  LocalAirport, 
  Translate, 
  Schedule, 
  TrendingUp, 
  Close,
  AirplanemodeActive
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function CrewManager() {
  const [crew, setCrew] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 
  const [filterAirport, setFilterAirport] = useState('ALL');
  
  // Modals & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('ROLE_PILOT'); 
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualification, setQualification] = useState('CAPTAIN');
  const [certifications, setCertifications] = useState('');
  const [totalFlyingHours, setTotalFlyingHours] = useState('');
  const [currentAirportCode, setCurrentAirportCode] = useState('JFK');
  const [restHoursRemaining, setRestHoursRemaining] = useState('10.0');
  const [languages, setLanguages] = useState('English');

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const loadCrew = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/crew', { headers });
      setCrew(response.data);
    } catch (e) {
      console.error("Failed loading crew member profiles", e);
    }
  };

  useEffect(() => {
    loadCrew();
  }, []);

  const handleCreateCrew = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username,
        email,
        name,
        role,
        licenseNumber,
        qualification,
        certifications,
        totalFlyingHours: parseFloat(totalFlyingHours) || 0.0,
        currentAirportCode,
        restHoursRemaining: parseFloat(restHoursRemaining) || 10.0,
        languages
      };
      await axios.post('http://localhost:8080/api/crew', payload, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'CREW_CREATE',
        details: `Registered crew profile for user: ${username} (${name})`
      }, { headers });

      setShowAddModal(false);
      resetForm();
      loadCrew();
    } catch (err) {
      alert('Error creating crew profile: ' + err.message);
    }
  };

  const handleEditCrew = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        type: role === 'ROLE_PILOT' ? 'PILOT' : 'CABIN_CREW',
        licenseNumber,
        totalFlyingHours: parseFloat(totalFlyingHours) || 0.0,
        qualification,
        certifications,
        currentAirportCode,
        restHoursRemaining: parseFloat(restHoursRemaining) || 10.0,
        languages,
        available: selectedCrew.available
      };
      await axios.put(`http://localhost:8080/api/crew/${selectedCrew.id}`, payload, { headers });

      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'CREW_UPDATE',
        details: `Updated crew profile details: ${name}`
      }, { headers });

      setShowEditModal(false);
      loadCrew();
    } catch (err) {
      alert('Error updating crew profile: ' + err.message);
    }
  };

  const handleDeleteCrew = async (id, crewName) => {
    if (!window.confirm(`Are you sure you want to delete crew member ${crewName}? This will also delete their login account.`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/crew/${id}`, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'CREW_DELETE',
        details: `Deleted crew member profile: ${crewName}`
      }, { headers });

      loadCrew();
    } catch (err) {
      alert('Error deleting crew member: ' + err.message);
    }
  };

  const toggleSickStatus = async (c) => {
    try {
      const updatedAvail = !c.available;
      await axios.put(`http://localhost:8080/api/crew/${c.id}`, { available: updatedAvail }, { headers });
      
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: localStorage.getItem('username') || 'dispatcher',
        action: 'CREW_STATUS_UPDATE',
        details: `Toggled availability for ${c.name} to ${updatedAvail ? 'Available' : 'Unavailable'}`
      }, { headers });

      loadCrew();
    } catch (err) {
      alert('Error toggling availability: ' + err.message);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setName('');
    setLicenseNumber('');
    setCertifications('');
    setTotalFlyingHours('');
    setCurrentAirportCode('JFK');
    setRestHoursRemaining('10.0');
    setLanguages('English');
  };

  const openEditPanel = (c) => {
    setSelectedCrew(c);
    setName(c.name);
    setRole(c.type === 'PILOT' ? 'ROLE_PILOT' : 'ROLE_CABIN_CREW');
    setLicenseNumber(c.licenseNumber);
    setQualification(c.qualification);
    setCertifications(c.certifications);
    setTotalFlyingHours(c.totalFlyingHours.toString());
    setCurrentAirportCode(c.currentAirportCode);
    setRestHoursRemaining(c.restHoursRemaining.toString());
    setLanguages(c.languages);
    setShowEditModal(true);
  };

  const handleExportCSV = () => {
    const csvHeaders = ["Employee Name", "Type", "Qualification", "License Number", "Current Base", "Total Hours", "Remaining Rest", "Languages", "Availability"];
    const csvRows = filteredCrew.map(c => [
      c.name,
      c.type,
      c.qualification,
      c.licenseNumber,
      c.currentAirportCode,
      c.totalFlyingHours,
      c.restHoursRemaining,
      `"${c.languages}"`,
      c.available ? "AVAILABLE" : "UNAVAILABLE"
    ]);

    const csvContent = [csvHeaders.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SkyCrew_Registry_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueAirports = ['ALL', ...new Set(crew.map(c => c.currentAirportCode))];

  const filteredCrew = crew.filter(c => {
    if (filterType === 'PILOT' && c.type !== 'PILOT') return false;
    if (filterType === 'CABIN_CREW' && c.type !== 'CABIN_CREW') return false;
    if (filterAirport !== 'ALL' && c.currentAirportCode !== filterAirport) return false;
    
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (c.certifications && c.certifications.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Filters & Actions Header */}
      <Card sx={{ bgcolor: 'rgba(21, 101, 192, 0.05)', border: '1px solid rgba(21, 101, 192, 0.1)' }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', p: 3, gap: 2 }}>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, flex: 1, minWidth: 280 }}>
            <TextField
              size="small"
              placeholder="Search name, ratings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 220 }}
            />

            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="PILOT">Pilots Only</MenuItem>
                <MenuItem value="CABIN_CREW">Cabin Crew</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Base Airport</InputLabel>
              <Select
                value={filterAirport}
                label="Base Airport"
                onChange={(e) => setFilterAirport(e.target.value)}
              >
                <MenuItem value="ALL">All Hubs</MenuItem>
                {uniqueAirports.filter(a => a !== 'ALL').map(ap => (
                  <MenuItem key={ap} value={ap}>{ap}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleExportCSV}
              sx={{ fontWeight: 700, borderRadius: 3, gap: 1 }}
            >
              <FileDownload fontSize="small" /> Export CSV
            </Button>
            <Button
              variant="contained"
              onClick={() => { resetForm(); setShowAddModal(true); }}
              sx={{ fontWeight: 700, borderRadius: 3, gap: 1 }}
            >
              <PersonAdd fontSize="small" /> Onboard Crew Member
            </Button>
          </Box>

        </CardContent>
      </Card>

      {/* Roster Cards Grid */}
      <Grid container spacing={3}>
        {filteredCrew.map(c => {
          const isRestViolation = c.restHoursRemaining < 10.0;
          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Card sx={{ border: isRestViolation ? '1px solid rgba(211,47,47,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                  <CardContent sx={{ p: 3 }}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: c.type === 'PILOT' ? 'primary.main' : 'secondary.main', width: 40, height: 40, fontWeight: 700 }}>
                          {c.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{c.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {c.qualification} ({c.type})
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={c.available ? 'AVAILABLE' : 'OFF DUTY'} 
                        color={c.available ? 'success' : 'default'}
                        size="small" 
                        sx={{ fontWeight: 800, fontSize: '0.6rem' }}
                      />
                    </Box>

                    {isRestViolation && (
                      <Alert severity="error" sx={{ mt: 2, py: 0.5, borderRadius: 2, fontSize: '0.7rem' }}>
                        ⚠️ FAA Rest Violation: Rest is under 10 hrs.
                      </Alert>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <Typography color="text.secondary" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalAirport fontSize="inherit" /> Current Base:
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{c.currentAirportCode}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <Typography color="text.secondary" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUp fontSize="inherit" /> Flight Hours:
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{c.totalFlyingHours} hrs</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <Typography color="text.secondary" variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Translate fontSize="inherit" /> Languages:
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.7rem' }}>{c.languages}</Typography>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.7rem' }}>
                          <Typography color="text.secondary" variant="caption">Rest Hours Remaining:</Typography>
                          <Typography sx={{ fontWeight: 700 }} color={isRestViolation ? 'error.main' : 'success.main'}>
                            {c.restHoursRemaining} / 24h
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((c.restHoursRemaining / 24) * 100, 100)} 
                          color={isRestViolation ? 'error' : 'success'} 
                          sx={{ borderRadius: 1, height: 6 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2.5 }} />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color={c.available ? 'error' : 'success'}
                        onClick={() => toggleSickStatus(c)}
                        sx={{ flex: 1, fontSize: '0.7rem', py: 1 }}
                      >
                        {c.available ? 'Flag Off' : 'Flag Active'}
                      </Button>
                      <IconButton 
                        onClick={() => openEditPanel(c)}
                        sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}
                      >
                        <Settings fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteCrew(c.id, c.name)}
                        sx={{ border: '1px solid rgba(211,47,47,0.06)', borderRadius: 2 }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>

                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Onboard Crew Modal Dialog */}
      <Dialog 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 500 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2 }}>Onboard Crew Profile</DialogTitle>
        <Box component="form" onSubmit={handleCreateCrew}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 3 }}>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="Username" placeholder="e.g. pilot_jason" value={username} onChange={(e) => setUsername(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth type="email" label="Email" placeholder="jason@skycrew.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="Full Name" placeholder="Jason Spencer" value={name} onChange={(e) => setName(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth label="License ID" placeholder="P-38829" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Crew Type</InputLabel>
                  <Select value={role} label="Crew Type" onChange={(e) => setRole(e.target.value)}>
                    <MenuItem value="ROLE_PILOT">PILOT</MenuItem>
                    <MenuItem value="ROLE_CABIN_CREW">CABIN CREW</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Rank / Designation</InputLabel>
                  <Select value={qualification} label="Rank / Designation" onChange={(e) => setQualification(e.target.value)}>
                    {role === 'ROLE_PILOT' ? (
                      <>
                        <MenuItem value="CAPTAIN">CAPTAIN</MenuItem>
                        <MenuItem value="FIRST_OFFICER">FIRST OFFICER</MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem value="PURSER">PURSER</MenuItem>
                        <MenuItem value="ATTENDANT">ATTENDANT</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField fullWidth label="Certifications / Type Ratings" placeholder="e.g. B737, A320" value={certifications} onChange={(e) => setCertifications(e.target.value)} />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField required fullWidth label="Base Hub" value={currentAirportCode} onChange={(e) => setCurrentAirportCode(e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField required fullWidth type="number" label="Flight Hours" value={totalFlyingHours} onChange={(e) => setTotalFlyingHours(e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField required fullWidth type="number" label="Rest Hours" value={restHoursRemaining} onChange={(e) => setRestHoursRemaining(e.target.value)} />
              </Grid>
            </Grid>

            <TextField fullWidth label="Language Competency" placeholder="English, German" value={languages} onChange={(e) => setLanguages(e.target.value)} />

          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Button onClick={() => setShowAddModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">Register profile</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Crew Modal Dialog */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 500 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Crew Profile
          <IconButton onClick={() => setShowEditModal(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleEditCrew}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 3 }}>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField required fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </Grid>
              <Grid item xs={6}>
                <TextField required fullWidth label="License ID" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Crew Type</InputLabel>
                  <Select value={role} label="Crew Type" onChange={(e) => setRole(e.target.value)}>
                    <MenuItem value="ROLE_PILOT">PILOT</MenuItem>
                    <MenuItem value="ROLE_CABIN_CREW">CABIN CREW</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Rank / Designation</InputLabel>
                  <Select value={qualification} label="Rank / Designation" onChange={(e) => setQualification(e.target.value)}>
                    {role === 'ROLE_PILOT' ? (
                      <>
                        <MenuItem value="CAPTAIN">CAPTAIN</MenuItem>
                        <MenuItem value="FIRST_OFFICER">FIRST OFFICER</MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem value="PURSER">PURSER</MenuItem>
                        <MenuItem value="ATTENDANT">ATTENDANT</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField fullWidth label="Type Ratings" value={certifications} onChange={(e) => setCertifications(e.target.value)} />

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField required fullWidth label="Base Hub" value={currentAirportCode} onChange={(e) => setCurrentAirportCode(e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField required fullWidth type="number" label="Flight Hours" value={totalFlyingHours} onChange={(e) => setTotalFlyingHours(e.target.value)} />
              </Grid>
              <Grid item xs={4}>
                <TextField required fullWidth type="number" label="Rest Hours" value={restHoursRemaining} onChange={(e) => setRestHoursRemaining(e.target.value)} />
              </Grid>
            </Grid>

            <TextField fullWidth label="Languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />

          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Button onClick={() => setShowEditModal(false)} variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained">Update profile</Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Box>
  );
}

export default CrewManager;
