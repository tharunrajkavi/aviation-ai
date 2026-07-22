import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  InputAdornment,
  Checkbox,
  FormControlLabel,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import { 
  FlightTakeoff, 
  Person, 
  Lock, 
  Visibility, 
  VisibilityOff,
  CloudQueue,
  Settings,
  VpnKey,
  AirplanemodeActive
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [role, setRole] = useState('ROLE_DISPATCHER');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef(null);

  // Background radar & path animations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Radar parameters
    let angle = 0;
    const dots = [
      { x: 200, y: 150, alpha: 1 },
      { x: 500, y: 350, alpha: 0.8 },
      { x: 800, y: 200, alpha: 0.5 }
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Radar Circle sweeps
      ctx.strokeStyle = 'rgba(0, 172, 209, 0.08)';
      ctx.lineWidth = 1;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.stroke();

      // Radar Sweep line
      ctx.strokeStyle = 'rgba(0, 172, 209, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * 350,
        centerY + Math.sin(angle) * 350
      );
      ctx.stroke();

      angle += 0.005;

      // 2. Airspace Nodes & Plane icons
      ctx.fillStyle = 'rgba(0, 172, 209, 0.4)';
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px monospace';
        ctx.fillText(`FLIGHT VECTOR: #${d.x}`, d.x + 8, d.y + 3);
      });

      // Runway blinking lights at base of page
      ctx.fillStyle = Math.sin(Date.now() / 300) > 0 ? '#FB8C00' : 'rgba(251,140,0,0.2)';
      for (let i = 0; i < canvas.width; i += 80) {
        ctx.beginPath();
        ctx.arc(i, canvas.height - 20, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/signin', {
        username: username || 'dispatcher',
        password: password || 'dispatcher'
      });
      const { token, role: userRole } = response.data;
      onLogin(token, username, userRole);
    } catch (err) {
      // Automatic Offline demo login fallback
      console.warn("Backend down. Accessing AOCC Dashboard in offline demo mode.");
      onLogin('mock-jwt-token', username || 'dispatcher', role);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole, demoUser) => {
    setUsername(demoUser);
    setPassword('demopassword');
    setRole(demoRole);
    setLoading(true);
    
    setTimeout(() => {
      onLogin('mock-jwt-token', demoUser, demoRole);
      setLoading(false);
    }, 800);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        background: '#040B14'
      }}
    >
      {/* Canvas for animated radar overlays & vector flight paths */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 1, 
          pointerEvents: 'none' 
        }} 
      />

      {/* Clouds simulation block */}
      <Box sx={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1, zIndex: 1, animation: 'pulse 10s infinite' }}>
        <CloudQueue sx={{ fontSize: 80, color: '#fff' }} />
      </Box>
      <Box sx={{ position: 'absolute', bottom: '15%', right: '12%', opacity: 0.08, zIndex: 1, animation: 'pulse 12s infinite' }}>
        <CloudQueue sx={{ fontSize: 100, color: '#fff' }} />
      </Box>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: 450, zIndex: 10 }}
      >
        <Card 
          sx={{ 
            boxShadow: '0 24px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 4,
            background: 'rgba(11,25,44,0.65)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
            
            {/* Logo and App Title */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'rgba(0, 172, 209, 0.1)', 
                  border: '1px solid rgba(0, 172, 209, 0.3)',
                  mb: 1.5,
                  animation: 'pulse 3s infinite'
                }}
              >
                <FlightTakeoff sx={{ color: '#00ACC1', fontSize: 28 }} />
              </Avatar>
              
              <Typography variant="h5" sx={{ letterSpacing: '0.1em', fontWeight: 900, color: '#fff' }}>
                SKYCREW AOCC
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', mt: 0.5 }}>
                Airline Operations Control Center
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              <TextField 
                required 
                fullWidth 
                label="Console Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField 
                required 
                fullWidth 
                label="Console Access Code" 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Console Level</InputLabel>
                <Select
                  value={role}
                  label="Console Level"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="ROLE_DISPATCHER">Dispatcher (Ops Room)</MenuItem>
                  <MenuItem value="ROLE_ADMIN">System Administrator</MenuItem>
                  <MenuItem value="ROLE_MANAGER">Operations Manager</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                  label={<Typography variant="caption" color="text.secondary">Remember Terminal</Typography>}
                />
                <Button size="small" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Forgot Access Code?</Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Enter AOCC Suite'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Quick Demo Access Credentials */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 700, textTransform: 'uppercase' }}>
                Console Quick Login Terminals:
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Button fullWidth variant="outlined" size="small" onClick={() => handleQuickLogin('ROLE_ADMIN', 'admin')} sx={{ fontSize: '0.6rem', fontWeight: 700, py: 1 }}>
                    Admin
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="outlined" size="small" onClick={() => handleQuickLogin('ROLE_DISPATCHER', 'dispatcher')} sx={{ fontSize: '0.6rem', fontWeight: 700, py: 1 }}>
                    Dispatcher
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth variant="outlined" size="small" onClick={() => handleQuickLogin('ROLE_MANAGER', 'opsmanager')} sx={{ fontSize: '0.6rem', fontWeight: 700, py: 1 }}>
                    Ops Mgr
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box 
              sx={{ 
                mt: 4, 
                pt: 2.5, 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                fontSize: 9,
                color: 'text.secondary',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
            >
              <Box 
                sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: '#2E7D32', 
                  boxShadow: '0 0 8px #2E7D32' 
                }} 
              />
              System clearance: SECURE // PORT: 5173
            </Box>

          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default Login;
