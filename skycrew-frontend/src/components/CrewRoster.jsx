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
  Avatar, 
  Grid, 
  Divider, 
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Search, 
  LocalAirport, 
  Translate, 
  Schedule, 
  TrendingUp, 
  Warning, 
  CheckCircle,
  Download
} from '@mui/icons-material';
import { useSimulation } from '../context/SimulationContext';

function CrewRoster() {
  const { crew, setCrew, triggerAwsUpload, addEventLog } = useSimulation();
  const [filterType, setFilterType] = useState('ALL'); // ALL, PILOT, CABIN_CREW, VIOLATION
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleAvailability = (id, currentAvail, name) => {
    setCrew(prev => prev.map(c => c.id === id ? { ...c, available: !currentAvail } : c));
    addEventLog(`🤒 Crew Availability Toggled: ${name} is now ${!currentAvail ? 'Available' : 'Sick/Off-Duty'}`, 'AI');
  };

  const filteredCrew = crew.filter(c => {
    // Type Filter
    if (filterType === 'PILOT' && c.type !== 'PILOT') return false;
    if (filterType === 'CABIN_CREW' && c.type !== 'CABIN_CREW') return false;
    if (filterType === 'VIOLATION' && c.restHoursRemaining >= 10.0) return false;

    // Search Term
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.currentAirportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.certifications.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExportRoster = (name) => {
    triggerAwsUpload(`roster_${name.toLowerCase().replace(/ /g, '_')}.pdf`);
    alert(`Roster PDF export initiated for ${name}. Syncing S3 snapshot...`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Search Header Banner */}
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

            <FormControl size="small" sx={{ width: 160 }}>
              <InputLabel>Compliance Scope</InputLabel>
              <Select
                value={filterType}
                label="Compliance Scope"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">All Crew</MenuItem>
                <MenuItem value="PILOT">Pilots</MenuItem>
                <MenuItem value="CABIN_CREW">Cabin Crew</MenuItem>
                <MenuItem value="VIOLATION">Rest Violations</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="caption" color="text.secondary">
            FAA Section 117 rules audit (minimum 10 hours mandatory rest limit required).
          </Typography>

        </CardContent>
      </Card>

      {/* Roster Cards Grid */}
      <Grid container spacing={3}>
        {filteredCrew.map(c => {
          const isRestViolation = c.restHoursRemaining < 10.0;
          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
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
                        <LocalAirport fontSize="inherit" /> Base Airport:
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
                      onClick={() => handleToggleAvailability(c.id, c.available, c.name)}
                      sx={{ flex: 1, fontSize: '0.7rem', py: 1 }}
                    >
                      {c.available ? 'Flag Off' : 'Flag Active'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleExportRoster(c.name)}
                      sx={{ fontSize: '0.7rem', py: 1, gap: 0.5 }}
                    >
                      <Download fontSize="inherit" /> Roster
                    </Button>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

    </Box>
  );
}

export default CrewRoster;
