import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Switch, 
  Divider, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import { 
  Settings, 
  Person, 
  Lock, 
  Sync, 
  Rule, 
  History, 
  Brightness4, 
  Brightness7 
} from '@mui/icons-material';

function SettingsProfile({ user }) {
  const [rules, setRules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const loadSettingsData = async () => {
    try {
      const rRes = await axios.get('http://localhost:8080/api/ops/ai-rules', { headers });
      setRules(rRes.data);
      const aRes = await axios.get('http://localhost:8080/api/ops/audit-logs', { headers });
      setAuditLogs(aRes.data);
    } catch (e) {
      console.warn("Failed loading settings metadata", e);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleRuleToggle = async (id, active) => {
    try {
      await axios.put(`http://localhost:8080/api/ops/ai-rules/${id}`, { active: !active }, { headers });
      loadSettingsData();
    } catch (err) {
      alert('Error updating rule: ' + err.message);
    }
  };

  const handleRuleUpdateValue = async (id, value, name) => {
    try {
      await axios.put(`http://localhost:8080/api/ops/ai-rules/${id}`, { ruleValue: value }, { headers });
      
      // Save Audit Log
      await axios.post('http://localhost:8080/api/ops/audit-logs', {
        username: user?.username || 'admin',
        action: 'RULE_THRESHOLD_UPDATE',
        details: `Updated AI Rule ${name} threshold value to: ${value}`
      }, { headers });

      loadSettingsData();
      alert('Rule threshold updated successfully!');
    } catch (err) {
      alert('Error updating rule value: ' + err.message);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    
    // Simple DOM toggler class injection
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#F4F7FB';
      document.body.style.color = '#0B192C';
    } else {
      document.body.classList.remove('light-mode');
      document.body.style.backgroundColor = '#070F19';
      document.body.style.color = '#F1F6F9';
    }
  };

  return (
    <Grid container spacing={4}>
      
      {/* Left Column: Profile Card & Theme */}
      <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Card>
          <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Operator Profile</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'rgba(21, 101, 192, 0.1)', 
                  color: 'primary.main',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}
              >
                {user?.username?.substring(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">Dispatcher Base: JFK Hub Control</Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '0.75rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" variant="body2">Security Credentials:</Typography>
                <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.7rem' }}>
                  {user?.role?.replace('ROLE_', '')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" variant="body2">Operations Node:</Typography>
                <Typography sx={{ fontWeight: 700 }}>Hub Control Center</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" variant="body2">Account registration:</Typography>
                <Typography sx={{ fontWeight: 700, color: 'success.main' }}>ACTIVE</Typography>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Console Customization</Typography>
              <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 650 }}>Interface Theme Override</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Toggle dark or light styles.</Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleThemeToggle}
                  sx={{ gap: 1, fontWeight: 700 }}
                >
                  {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />} Theme
                </Button>
              </Box>
            </Box>

          </CardContent>
        </Card>
      </Grid>

      {/* Right Column: FAA regulatory rule parameters configurations */}
      <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>FAA Regulatory Rules Configuration</Typography>
            <Typography variant="caption" color="text.secondary">
              Update FAA fatigue safety indices parsed by the LangGraph roster swap agent. Updates apply instantly.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
              {rules.map(r => (
                <Paper 
                  key={r.id} 
                  sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    border: '1px solid rgba(0,0,0,0.05)',
                    gap: 2 
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{r.ruleName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{r.description}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5, ml: 'auto' }}>
                    <TextField 
                      size="small"
                      defaultValue={r.ruleValue}
                      onBlur={(e) => handleRuleUpdateValue(r.id, e.target.value, r.ruleName)}
                      sx={{ width: 100 }}
                      inputProps={{ style: { textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 } }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">Active:</Typography>
                      <Switch 
                        checked={r.active} 
                        onChange={() => handleRuleToggle(r.id, r.active)} 
                        color="primary"
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>

          </CardContent>
        </Card>

        {/* Dispatcher Actions audit trails timeline */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Console Operations Audit Timeline</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Active logs tracking modifications triggered on flights, weather settings, and safety parameters.
            </Typography>

            <List sx={{ maxHeight: 240, overflowY: 'auto', pr: 1 }}>
              {auditLogs.map(l => (
                <ListItem key={l.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(21, 101, 192, 0.08)', color: 'primary.main' }}>
                      <History fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {l.username} <Chip label={l.action} size="small" sx={{ ml: 1, fontSize: '0.6rem', height: 18, fontWeight: 800 }} />
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {new Date(l.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {l.details}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {auditLogs.length === 0 && (
                <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No timeline audit entries registered.</Typography>
                </ListItem>
              )}
            </List>

          </CardContent>
        </Card>

        {/* AWS Infrastructure Diagram */}
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>AWS AOCC Cloud Topology Map</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Real-time telemetry and network flow mapped across AWS microservices.
            </Typography>

            <Box sx={{ p: 3, bgcolor: 'background.default', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              {/* Row 1: Frontend/Backend edge */}
              <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(25,118,210,0.2)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>User Browser</Typography>
                    <Typography variant="caption" color="text.secondary">React Client</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6">➔</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0,172,193,0.2)', bgcolor: 'rgba(0,172,193,0.03)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Spring Boot EC2 Gateway</Typography>
                    <Typography variant="caption" color="text.secondary">VPC Private Subnet</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6">➔</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(211,47,47,0.2)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>LangGraph AI Agent</Typography>
                    <Typography variant="caption" color="text.secondary">FastAPI Host</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Data stream lines */}
              <Box sx={{ position: 'relative', height: 2, bgcolor: 'primary.main', mx: 4 }}>
                <Box sx={{ position: 'absolute', top: -4, left: '50%', width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main', animation: 'pulseGreen 2s infinite' }} />
              </Box>

              {/* Row 2: Database / Storage / Observability logs */}
              <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(46,125,50,0.2)', bgcolor: 'rgba(46,125,50,0.03)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Amazon RDS</Typography>
                    <Typography variant="caption" color="text.secondary">PostgreSQL Database</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(0,172,193,0.2)', bgcolor: 'rgba(0,172,193,0.03)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Amazon S3</Typography>
                    <Typography variant="caption" color="text.secondary">Roster PDF Storage</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, border: '1px solid rgba(251,140,0,0.2)', bgcolor: 'rgba(251,140,0,0.03)' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Amazon CloudWatch</Typography>
                    <Typography variant="caption" color="text.secondary">Operations Log Audits</Typography>
                  </Paper>
                </Grid>
              </Grid>

            </Box>
          </CardContent>
        </Card>

      </Grid>
    </Grid>
  );
}

export default SettingsProfile;
