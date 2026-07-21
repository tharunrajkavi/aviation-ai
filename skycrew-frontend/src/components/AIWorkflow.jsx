import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Chip, 
  Avatar, 
  Divider,
  Paper,
  LinearProgress,
  IconButton
} from '@mui/material';
import { 
  CloudQueue, 
  QueryBuilder, 
  FactCheck, 
  Autorenew, 
  TrendingUp, 
  Security, 
  AssignmentTurnedIn,
  PlayArrow,
  CheckCircle,
  HelpOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../context/SimulationContext';

function AIWorkflow() {
  const { aiWorkflow, runAiPipeline, handleReset } = useSimulation();
  const [activeStep, setActiveStep] = useState(null);

  const workflowSteps = [
    {
      id: 0,
      title: 'METAR Weather Analysis',
      icon: <CloudQueue />,
      agent: 'Weather Agent',
      desc: 'Parses active storm alerts at hubs, wind gust velocities, and runway icing reports.',
      reasoning: 'Inputs: METAR KJFK. Output: Wind gust shear active 35kts. Flagged 2 flights for possible delays.',
      status: 'SUCCESS'
    },
    {
      id: 1,
      title: 'Delay Propagation Prediction',
      icon: <QueryBuilder />,
      agent: 'Delay Modeler Agent',
      desc: 'Predicts impact of weather alerts on downstream rotations.',
      reasoning: 'Simulates flight AA100 delay impact. Secondary delay probability on flight AA200 evaluated at 65%.',
      status: 'SUCCESS'
    },
    {
      id: 2,
      title: 'FAA Rule Compliance Check',
      icon: <FactCheck />,
      agent: 'Compliance Audit Agent',
      desc: 'Verifies crew assignments against FAA Section 117 rules.',
      reasoning: 'Audit on Captain John Doe: Rest is 8.0 hrs (< 10.0h mandatory). FAA Rest Violation Flagged.',
      status: 'VIOLATION'
    },
    {
      id: 3,
      title: 'Standby Swap Optimization',
      icon: <Autorenew />,
      agent: 'Roster Optimizer Agent',
      desc: 'Scans the airport crew standby pool for alternative candidates.',
      reasoning: 'Identified candidate: FO Bob Johnson (JFK based, 12h rest remaining, type rating B737 certified).',
      status: 'SUCCESS'
    },
    {
      id: 4,
      title: 'Network Efficiency Review',
      icon: <TrendingUp />,
      agent: 'Network Analyst Agent',
      desc: 'Evaluates cost efficiency, deadhead metrics, and delay mitigation benefits of the crew swap.',
      reasoning: 'Net efficiency rating: +12% cost mitigation by swapping crew instead of cancelling flight.',
      status: 'SUCCESS'
    },
    {
      id: 5,
      title: 'Safety Risk Assessment',
      icon: <Security />,
      agent: 'Safety Inspector Agent',
      desc: 'Runs double-check audits to ensure safety clearances.',
      reasoning: 'Aircraft Boeing 737 qualification checked. Weather hazard risk is LOW after delaying departure 90 mins.',
      status: 'SUCCESS'
    },
    {
      id: 6,
      title: 'Operator Sign-Off Signpost',
      icon: <AssignmentTurnedIn />,
      agent: 'Human-in-the-Loop Node',
      desc: 'Generates final dispatcher notifications for manual review and sign-off.',
      reasoning: 'Waiting for Dispatcher approval on AA100 crew swap proposal.',
      status: 'PENDING'
    }
  ];

  const handleRunPipeline = () => {
    runAiPipeline('AA300');
  };

  // Determine active step based on simulation pipeline state or local click
  const currentStepId = aiWorkflow.active ? aiWorkflow.activeStep : activeStep;
  const currentActiveStepData = currentStepId !== null && currentStepId >= 0 ? workflowSteps[currentStepId] : null;

  return (
    <Grid container spacing={4}>
      
      {/* Left Column: Live Animation Flow Chart */}
      <Grid item xs={12} lg={7}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>LangGraph Execution Pipeline</Typography>
                <Typography variant="caption" color="text.secondary">Step progression tracker of the multi-agent schedule optimization workflow.</Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRunPipeline}
                disabled={aiWorkflow.active && !aiWorkflow.completed}
                sx={{ gap: 1, fontWeight: 700 }}
              >
                <PlayArrow fontSize="small" /> Run Optimizer
              </Button>
            </Box>

            {aiWorkflow.active && !aiWorkflow.completed && (
              <Box sx={{ width: '100%', mb: 4 }}>
                <LinearProgress sx={{ height: 6, borderRadius: 2 }} />
              </Box>
            )}

            {/* Steps Timeline Visual */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mt: 4, position: 'relative' }}>
              
              {/* Vertical connecting line */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 24, 
                  bottom: 24, 
                  left: 20, 
                  width: 2, 
                  bgcolor: mode => mode.palette.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                  zIndex: 0 
                }} 
              />

              {workflowSteps.map((step) => {
                const isActive = currentStepId === step.id;
                const isCompleted = currentStepId > step.id || aiWorkflow.completed;
                const isStepViolation = step.status === 'VIOLATION';
                
                return (
                  <Box 
                    key={step.id} 
                    onClick={() => setActiveStep(step.id)}
                    sx={{ 
                      display: 'flex', 
                      gap: 3, 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {/* Circle avatar indicator */}
                    <Avatar 
                      sx={{ 
                        width: 42, 
                        height: 42, 
                        bgcolor: isActive 
                          ? 'primary.main' 
                          : (isCompleted 
                              ? (isStepViolation ? 'error.main' : 'success.main') 
                              : 'action.disabledBackground'),
                        color: isActive || isCompleted ? '#fff' : 'text.secondary',
                        border: isActive ? '3px solid rgba(21, 101, 192, 0.2)' : 'none',
                        boxShadow: isActive ? '0 0 15px rgba(21, 101, 192, 0.4)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {step.icon}
                    </Avatar>

                    <Paper 
                      sx={{ 
                        p: 2, 
                        flex: 1, 
                        border: '1px solid',
                        borderColor: isActive ? 'primary.main' : 'rgba(0,0,0,0.05)',
                        bgcolor: isActive 
                          ? 'action.hover' 
                          : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {step.title}
                        </Typography>
                        <Chip 
                          label={step.agent} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 18, color: 'text.secondary' }} 
                        />
                      </Box>
                    </Paper>
                  </Box>
                );
              })}

            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column: Explainable AI Side Panel Details */}
      <Grid item xs={12} lg={5}>
        <Card sx={{ height: '100%', position: 'sticky', top: 24 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Explainable AI (XAI) Matrix</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              Select a node to review the telemetry inputs, logs, and reasonings output by that specific agent.
            </Typography>

            <AnimatePresence mode="wait">
              {currentActiveStepData ? (
                <motion.div
                  key={currentActiveStepData.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(21, 101, 192, 0.05)', border: '1px solid rgba(21, 101, 192, 0.1)', borderRadius: 3 }}>
                      <Typography variant="caption" color="text.secondary">Selected Execution Node:</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.5 }}>{currentActiveStepData.title}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Node description</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                        {currentActiveStepData.desc}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Agent reasoning logs</Typography>
                      <Paper sx={{ p: 2, mt: 1.5, bgcolor: 'background.default', border: '1px solid rgba(0,0,0,0.05)', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.6 }}>
                        {aiWorkflow.active && aiWorkflow.activeStep === currentStepId ? aiWorkflow.logs : currentActiveStepData.reasoning}
                      </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">Verification status:</Typography>
                      <Chip 
                        label={currentActiveStepData.status} 
                        color={currentActiveStepData.status === 'VIOLATION' ? 'error' : (currentActiveStepData.status === 'PENDING' ? 'warning' : 'success')}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                      />
                    </Box>

                  </Box>
                </motion.div>
              ) : (
                <Box sx={{ py: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <HelpOutlined color="disabled" sx={{ fontSize: 40 }} />
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>No Node Selected</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 4 }}>
                    Click "Run Optimizer" or tap any workflow step node to inspect details.
                  </Typography>
                </Box>
              )}
            </AnimatePresence>

          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
}

export default AIWorkflow;
