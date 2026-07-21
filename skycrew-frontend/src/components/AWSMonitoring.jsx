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
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  CloudQueue, 
  Storage, 
  Speed, 
  Security, 
  VpnLock, 
  Sync, 
  Settings, 
  Notifications, 
  Dns, 
  Receipt,
  RotateRight
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function AWSMonitoring() {
  const [ec2Cpu, setEc2Cpu] = useState(48);
  const [scalingNodes, setScalingNodes] = useState(2);
  const [wafBlocked, setWafBlocked] = useState(14);
  const [ec2Status, setEc2Status] = useState('RUNNING');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [awsLogs, setAwsLogs] = useState([
    { time: '12:01:05', svc: 'CloudWatch', msg: 'EC2 CPU usage spiked to 72% - Auto Scaling verified.' },
    { time: '12:02:10', svc: 'WAF', msg: 'Blocked XSS attempt on /api/auth/login endpoint.' },
    { time: '12:03:15', svc: 'RDS', msg: 'Daily automatic backup completed successfully. ARN: rds-bkp-901.' }
  ]);

  // Tick simulation stats
  useEffect(() => {
    const interval = setInterval(() => {
      setEc2Cpu(prev => {
        const delta = Math.floor(Math.random() * 11) - 5;
        const next = Math.max(10, Math.min(95, prev + delta));
        // Trigger auto scaling if cpu > 70
        if (next > 70 && scalingNodes < 4) {
          setScalingNodes(n => n + 1);
          setAwsLogs(logs => [{ time: new Date().toTimeString().split(' ')[0], svc: 'AutoScaling', msg: `CPU crossed threshold (70%). Spinning up EC2 Node #${scalingNodes + 1}.` }, ...logs]);
        }
        return next;
      });

      // Periodic random WAF block events
      if (Math.random() > 0.8) {
        setWafBlocked(w => w + 1);
        setAwsLogs(logs => [{ time: new Date().toTimeString().split(' ')[0], svc: 'WAF', msg: 'Blocked SQL Injection payload from IP 192.168.42.10.' }, ...logs]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [scalingNodes]);

  const handleServiceRestart = () => {
    setEc2Status('RESTARTING');
    setAwsLogs(logs => [{ time: new Date().toTimeString().split(' ')[0], svc: 'EC2', msg: 'Initiated remote service reload command via AWS Systems Manager.' }, ...logs]);
    setTimeout(() => {
      setEc2Status('RUNNING');
      setAwsLogs(logs => [{ time: new Date().toTimeString().split(' ')[0], svc: 'EC2', msg: 'Spring Boot application restarted successfully on target EC2 instances.' }, ...logs]);
    }, 3000);
  };

  const handleSimulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    setAwsLogs(logs => [{ time: new Date().toTimeString().split(' ')[0], svc: 'S3', msg: 'Initiating crew roster PDF backup upload process...' }, ...logs]);
    
    let current = 0;
    const timer = setInterval(() => {
      current += 20;
      setUploadProgress(current);
      if (current >= 100) {
        clearInterval(timer);
        setUploading(false);
        setAwsLogs(logs => [
          { time: new Date().toTimeString().split(' ')[0], svc: 'S3', msg: 'Roster backup completed. Saved in S3 Bucket: skycrew-rosters-prod.' },
          { time: new Date().toTimeString().split(' ')[0], svc: 'RDS', msg: 'Database metadata updated with new S3 reference ARN.' },
          { time: new Date().toTimeString().split(' ')[0], svc: 'CloudWatch', msg: 'Logged metadata insert latency: 12ms.' },
          ...logs
        ]);
      }
    }, 600);
  };

  return (
    <Grid container spacing={4}>
      
      {/* Topology Header */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: 'rgba(251,140,0,0.03)', border: '1px solid rgba(251,140,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>AWS Cloud Architecture & Diagnostics Dashboard</Typography>
            <Typography variant="caption" color="text.secondary">Real-time health telemetry across the enterprise AOCC infrastructure.</Typography>
            
            {/* Animated SVG AWS Cloud Map */}
            <Box 
              sx={{ 
                position: 'relative', 
                mt: 4, 
                p: 3, 
                bgcolor: '#070F19', 
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: 4,
                overflowX: 'auto'
              }}
            >
              <svg width="100%" height="160" style={{ minWidth: 900 }}>
                {/* Connecting Path Lines */}
                <path d="M 50 80 H 850" fill="none" stroke="rgba(251, 140, 0, 0.25)" strokeWidth="4" strokeDasharray="10,8" />
                
                {/* Node 1: User */}
                <g transform="translate(50, 40)">
                  <circle cx="20" cy="40" r="24" fill="#1565C0" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">👤</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Users</text>
                </g>

                {/* Node 2: Route 53 / CloudFront */}
                <g transform="translate(180, 40)">
                  <circle cx="20" cy="40" r="24" fill="#FB8C00" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">🌐</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Route53/CF</text>
                </g>

                {/* Node 3: Load Balancer */}
                <g transform="translate(310, 40)">
                  <circle cx="20" cy="40" r="24" fill="#00ACC1" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">⚖️</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">ALB Balancer</text>
                </g>

                {/* Node 4: EC2 Cluster */}
                <g transform="translate(440, 40)">
                  <circle cx="20" cy="40" r="24" fill="#D32F2F" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">💻</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">EC2 Spring</text>
                </g>

                {/* Node 5: RDS DB */}
                <g transform="translate(570, 40)">
                  <circle cx="20" cy="40" r="24" fill="#2E7D32" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">🗄️</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">RDS Postgres</text>
                </g>

                {/* Node 6: Amazon S3 */}
                <g transform="translate(700, 40)">
                  <circle cx="20" cy="40" r="24" fill="#1E3E62" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">🪣</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">S3 Bucket</text>
                </g>

                {/* Node 7: AWS Lambda */}
                <g transform="translate(830, 40)">
                  <circle cx="20" cy="40" r="24" fill="#8E24AA" />
                  <text x="20" y="45" textAnchor="middle" fill="#fff" fontSize="16">⚡</text>
                  <text x="20" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Lambda</text>
                </g>
              </svg>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* EC2 Diagnostics */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>EC2 Container Monitor</Typography>
              <Chip label={ec2Status} color={ec2Status === 'RUNNING' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.7rem' }}>
                  <Typography variant="caption" color="text.secondary">Cluster CPU Load:</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{ec2Cpu}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={ec2Cpu} color={ec2Cpu > 70 ? 'error' : 'primary'} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.7rem' }}>
                  <Typography variant="caption" color="text.secondary">Active Nodes Scaling:</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{scalingNodes} Instances</Typography>
                </Box>
                <LinearProgress variant="determinate" value={scalingNodes * 25} color="secondary" />
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              onClick={handleServiceRestart}
              startIcon={<Sync />}
              disabled={ec2Status === 'RESTARTING'}
              sx={{ fontWeight: 700 }}
            >
              Restart Spring Boot Service
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Database Performance */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Storage color="success" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>RDS PostgreSQL Engine</Typography>
            </Box>

            <List size="small" sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Database Connection Pool:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>18 / 100 Active</Typography>
              </ListItem>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Storage capacity:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>142.5 GB / 500 GB</Typography>
              </ListItem>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Replica Status:</Typography>
                <Chip label="IN SYNC" color="success" size="small" sx={{ fontSize: '0.6rem', fontWeight: 800, height: 18 }} />
              </ListItem>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Weekly automated backups:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>ENABLED</Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* S3 & Lambda tools */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>S3 Storage & Serverless Triggers</Typography>
            <Typography variant="caption" color="text.secondary">Backup local rosters to S3 storage bucket.</Typography>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {uploading ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Uploading roster PDF files to S3...</Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} color="warning" />
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  onClick={handleSimulateUpload}
                  sx={{ fontWeight: 700 }}
                >
                  Upload Roster to Amazon S3
                </Button>
              )}

              <Divider />

              <Grid container spacing={2} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                <Grid item xs={6}>
                  <Typography color="text.secondary" variant="caption">SQS Queue length:</Typography>
                  <Typography sx={{ fontWeight: 800 }}>0 jobs</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="text.secondary" variant="caption">ElastiCache hit ratio:</Typography>
                  <Typography sx={{ fontWeight: 800, color: 'success.main' }}>92.4%</Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Security & WAF logs */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Security color="error" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>AWS WAF Security Console</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContet: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>BLOCKED MALICIOUS REQUESTS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main' }}>{wafBlocked}</Typography>
              </Box>
              <Chip label="SHIELD PROTECTED" color="error" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <List size="small" sx={{ p: 0, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">SQL Injection protection:</Typography>
                <Typography sx={{ fontWeight: 700, color: 'success.main' }}>ACTIVE</Typography>
              </ListItem>
              <ListItem sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">XSS scripting guards:</Typography>
                <Typography sx={{ fontWeight: 700, color: 'success.main' }}>ACTIVE</Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* CloudWatch Logs Ticker */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Dns color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Amazon CloudWatch Audit Logs</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 180, overflowY: 'auto', pr: 1 }}>
              {awsLogs.map((log, idx) => (
                <Box 
                  key={idx} 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'background.default', 
                    border: '1px solid rgba(0,0,0,0.05)', 
                    borderRadius: 3.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    [{log.time}]
                  </Typography>
                  <Chip label={log.svc} size="small" color={log.svc === 'WAF' ? 'error' : log.svc === 'S3' ? 'warning' : 'primary'} sx={{ fontSize: '0.6rem', height: 18, fontWeight: 800 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 650 }}>
                    {log.msg}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
}

export default AWSMonitoring;
