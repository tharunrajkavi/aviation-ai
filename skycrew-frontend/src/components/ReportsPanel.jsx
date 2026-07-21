import React, { useState } from 'react';
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
  Tabs, 
  Tab, 
  Chip, 
  Divider,
  Grid
} from '@mui/material';
import { 
  FileDownload, 
  Print, 
  Description, 
  ListAlt, 
  AccessTime, 
  CloudQueue, 
  Psychology 
} from '@mui/icons-material';
import { useSimulation } from '../context/SimulationContext';

function ReportsPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const { triggerAwsUpload } = useSimulation();

  // Mock static reports metadata
  const dailyCrewData = [
    { name: 'Captain John Doe', role: 'PILOT', base: 'JFK', flightAssigned: 'AA100', dutyStatus: 'ON_DUTY', restRemaining: 8.0 },
    { name: 'Captain Jane Smith', role: 'PILOT', base: 'LAX', flightAssigned: 'AA200', dutyStatus: 'REST_PERIOD', restRemaining: 14.0 },
    { name: 'FO Bob Johnson', role: 'PILOT', base: 'JFK', flightAssigned: 'AA100', dutyStatus: 'ON_DUTY', restRemaining: 12.0 },
    { name: 'Purser Alice White', role: 'CABIN_CREW', base: 'JFK', flightAssigned: 'AA100', dutyStatus: 'STANDBY', restRemaining: 10.0 }
  ];

  const monthlyFlightsData = [
    { date: '2026-07-01', total: 145, completed: 130, delayed: 12, cancelled: 3 },
    { date: '2026-07-02', total: 152, completed: 142, delayed: 8, cancelled: 2 },
    { date: '2026-07-03', total: 160, completed: 135, delayed: 22, cancelled: 3 },
    { date: '2026-07-04', total: 142, completed: 138, delayed: 4, cancelled: 0 }
  ];

  const dutyComplianceData = [
    { name: 'Captain John Doe', periodLimit: '24-HOUR', loggedHours: 9.5, limitThreshold: 9.0, violationFlag: 'YES' },
    { name: 'FO Bob Johnson', periodLimit: '24-HOUR', loggedHours: 6.0, limitThreshold: 9.0, violationFlag: 'NO' },
    { name: 'Captain Jane Smith', periodLimit: '7-DAY', loggedHours: 28.0, limitThreshold: 32.0, violationFlag: 'NO' },
    { name: 'Purser Alice White', periodLimit: '24-HOUR', loggedHours: 12.0, limitThreshold: 14.0, violationFlag: 'NO' }
  ];

  const weatherDelaysData = [
    { hub: 'KJFK', delayMinutes: 240, incidentReason: 'Severe Storm, Wind Shear 35kts gusting', status: 'RESOLVED' },
    { hub: 'KORD', delayMinutes: 180, incidentReason: 'Heavy Snow, active runway de-icing delayed schedule', status: 'RESOLVED' },
    { hub: 'KDFW', delayMinutes: 90, incidentReason: 'Fog / low visibility, restricted CAT III landings', status: 'ACTIVE' }
  ];

  const aiAuditData = [
    { timestamp: '2026-07-17T12:00:00', operator: 'admin', ruleModified: 'MAX_DAILY_DUTY_HOURS', details: 'Value shifted from 8.0 to 9.0 hours' },
    { timestamp: '2026-07-17T12:05:00', operator: 'dispatcher', ruleModified: 'CREW_STANDBY_SWAP', details: 'Auto-swapped FO Bob Johnson on Flight AA100' },
    { timestamp: '2026-07-17T12:10:00', operator: 'dispatcher', ruleModified: 'WEATHER_SIMULATION', details: 'Injected Storm advisory KJFK' }
  ];

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let name = "Report";

    if (activeTab === 0) {
      name = "Daily_Crew_Status";
      headers = ["Crew Name", "Role", "Base Hub", "Assigned Flight", "Duty Status", "Rest Hours"];
      rows = dailyCrewData.map(c => [c.name, c.role, c.base, c.flightAssigned, c.dutyStatus, c.restRemaining]);
    } else if (activeTab === 1) {
      name = "Monthly_Flight_Stats";
      headers = ["Date", "Total Flights", "Completed", "Delayed", "Cancelled"];
      rows = monthlyFlightsData.map(f => [f.date, f.total, f.completed, f.delayed, f.cancelled]);
    } else if (activeTab === 2) {
      name = "Duty_Compliance_Logs";
      headers = ["Crew Name", "Period Limit", "Logged Hours", "Limit Threshold", "Violation"];
      rows = dutyComplianceData.map(d => [d.name, d.periodLimit, d.loggedHours, d.limitThreshold, d.violationFlag]);
    } else if (activeTab === 3) {
      name = "Weather_Disruption_Delays";
      headers = ["Airport Hub", "Total Delay Minutes", "Reason Details", "Advisory Status"];
      rows = weatherDelaysData.map(w => [w.hub, w.delayMinutes, w.incidentReason, w.status]);
    } else {
      name = "AI_Audit_Trail";
      headers = ["Timestamp", "Operator", "Rule Config", "Details"];
      rows = aiAuditData.map(a => [a.timestamp, a.operator, a.ruleModified, a.details]);
    }

    triggerAwsUpload(`SkyCrew_${name}_${new Date().toISOString().split('T')[0]}.csv`);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SkyCrew_${name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    triggerAwsUpload(`SkyCrew_PrintReport_${new Date().toISOString().split('T')[0]}.pdf`);
    window.print();
  };

  const menuTabs = [
    { label: 'Daily Crew Schedule', icon: <ListAlt /> },
    { label: 'Monthly Flight Stats', icon: <Description /> },
    { label: 'Duty Compliance', icon: <AccessTime /> },
    { label: 'Weather Delay Impacts', icon: <CloudQueue /> },
    { label: 'AI Operations Audit', icon: <Psychology /> }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Tab Controls Bar */}
      <Card>
        <CardContent sx={{ p: 1 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'none',
                py: 2,
                gap: 1
              }
            }}
          >
            {menuTabs.map((tab, idx) => (
              <Tab key={idx} icon={tab.icon} label={tab.label} iconPosition="start" />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Reports Content Card View */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <CardContent sx={{ p: 4 }}>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContet: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {menuTabs[activeTab].label} Preview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review current system telemetry files. Output formats include CSV spreadsheet downloads and print logs.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handlePrintPDF} 
                sx={{ gap: 1, fontWeight: 700 }}
              >
                <Print fontSize="small" /> Print PDF Roster
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleExportCSV} 
                sx={{ gap: 1, fontWeight: 700 }}
              >
                <FileDownload fontSize="small" /> Download CSV
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Render Tables based on Active Tab Selection */}
          <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }} className="print-area">
            
            {activeTab === 0 && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Base Base</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Flight Assigned</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rest Hours</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyCrewData.map((c, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{c.name}</TableCell>
                      <TableCell>{c.role}</TableCell>
                      <TableCell>{c.base}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{c.flightAssigned}</TableCell>
                      <TableCell>{c.restRemaining} hrs</TableCell>
                      <TableCell>
                        <Chip 
                          label={c.dutyStatus} 
                          color={c.dutyStatus === 'ON_DUTY' ? 'primary' : c.dutyStatus === 'STANDBY' ? 'secondary' : 'default'}
                          size="small" 
                          sx={{ fontSize: '0.65rem', fontWeight: 800 }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === 1 && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Operation Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Scheduled</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Completed Flights</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Weather Delays</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cancellations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyFlightsData.map((f, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{f.date}</TableCell>
                      <TableCell>{f.total}</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>{f.completed}</TableCell>
                      <TableCell sx={{ color: 'warning.main', fontWeight: 700 }}>{f.delayed}</TableCell>
                      <TableCell sx={{ color: 'error.main', fontWeight: 700 }}>{f.cancelled}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === 2 && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Period Limit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Logged hours</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Threshold limit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>FAA Violation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dutyComplianceData.map((d, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{d.name}</TableCell>
                      <TableCell>{d.periodLimit}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{d.loggedHours} hrs</TableCell>
                      <TableCell>{d.limitThreshold} hrs</TableCell>
                      <TableCell>
                        <Chip 
                          label={d.violationFlag} 
                          color={d.violationFlag === 'YES' ? 'error' : 'success'}
                          size="small" 
                          sx={{ fontSize: '0.65rem', fontWeight: 800 }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === 3 && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Airport Hub</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Delays</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Meteorological Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Advisory status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weatherDelaysData.map((w, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 700 }}>{w.hub}</TableCell>
                      <TableCell sx={{ color: 'warning.main', fontWeight: 700 }}>{w.delayMinutes} mins</TableCell>
                      <TableCell>{w.incidentReason}</TableCell>
                      <TableCell>
                        <Chip 
                          label={w.status} 
                          color={w.status === 'ACTIVE' ? 'error' : 'success'}
                          size="small" 
                          sx={{ fontSize: '0.65rem', fontWeight: 800 }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === 4 && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Operator Username</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rule Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aiAuditData.map((a, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {new Date(a.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{a.operator}</TableCell>
                      <TableCell>
                        <Chip label={a.ruleModified} size="small" sx={{ fontSize: '0.6rem', fontWeight: 800 }} />
                      </TableCell>
                      <TableCell>{a.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

          </TableContainer>

        </CardContent>
      </Card>

    </Box>
  );
}

export default ReportsPanel;
