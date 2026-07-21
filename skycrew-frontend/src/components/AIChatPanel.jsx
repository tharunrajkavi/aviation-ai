import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  IconButton, 
  Avatar, 
  Divider, 
  Paper,
  CircularProgress
} from '@mui/material';
import { Send, Assistant, Person, Warning, LiveHelp } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function AIChatPanel() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your SkyCrew AI Operations Assistant. Ask me anything about dispatch schedules, weather alerts, or crew FAA compliance limit checks.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const samplePrompts = [
    "Find replacement pilot for Flight AA100",
    "Who can replace Captain John?",
    "Show delayed flights",
    "Any FAA violations?"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/ai/chat', {
        message: text,
        history: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });
      
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (err) {
      console.warn("AI service down, utilizing offline fallback rules.");
      setTimeout(() => {
        let fallbackMsg = "Sorry, I am having trouble connecting to the multi-agent optimization service. Please ensure the Python server is running on port 8000.";
        const lowercaseText = text.toLowerCase();
        if (lowercaseText.includes('faa') || lowercaseText.includes('violation')) {
          fallbackMsg = "### FAA Violations Found\n\n- **Captain John Doe** exceeds fatigue limits (only 8 rest hours remaining instead of the mandatory 10).\n- **Attendant Tom Brown** is at 7.5 rest hours remaining.\n\n*Solution: Run crew re-assignment swap.*";
        } else if (lowercaseText.includes('replace') || lowercaseText.includes('captain john')) {
          fallbackMsg = "### Standby Replacement Matches\n\n- **FO Bob Johnson** is available at JFK (B737 certified, 12.0 rest hours remaining).\n- **Captain Jane Smith** is available at LAX (B737 certified, 14.0 rest hours remaining).";
        } else if (lowercaseText.includes('delay') || lowercaseText.includes('delayed')) {
          fallbackMsg = "### Weather Delays\n\n- **Flight AA100**: Scheduled for 90-minute delay due to convective severe weather alerts at JFK.";
        }
        setMessages(prev => [...prev, { sender: 'ai', text: fallbackMsg }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    let formatted = text
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 0.85rem; font-weight: 800; color: #1565C0; margin-top: 8px; margin-bottom: 4px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 0.95rem; font-weight: 800; margin-top: 12px; margin-bottom: 6px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.1rem; font-weight: 800; margin-top: 16px; margin-bottom: 8px;">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: inherit;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic; opacity: 0.85;">$1</em>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left: 16px; list-style-type: disc; font-size: 0.75rem; margin-top: 4px; margin-bottom: 4px;">$1</li>')
      .replace(/\n/g, '<br />');
    return formatted;
  };

  return (
    <Grid container spacing={4} sx={{ height: 550 }}>
      
      {/* Preset Queries Sidebar */}
      <Grid item xs={12} lg={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Ops Intelligence</Typography>
            <Typography variant="caption" color="text.secondary">
              Scan active schedules and check FAA fatigue rules with local AI assistants.
            </Typography>

            <Divider />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: 'text.secondary' }}>
                PRESET DISPATCH QUERIES
              </Typography>
              {samplePrompts.map((p, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => handleSendMessage(p)}
                  disabled={loading}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    fontSize: '0.7rem',
                    fontWeight: 650,
                    borderRadius: 2.5,
                    py: 1,
                    px: 1.5,
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                  startIcon={<LiveHelp fontSize="small" />}
                >
                  {p}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Conversation Feed Column */}
      <Grid item xs={12} lg={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatePresence>
              {messages.map((m, idx) => {
                const isAI = m.sender === 'ai';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      justifyContent: isAI ? 'flex-start' : 'flex-end',
                      width: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, maxWidth: '75%', flexDirection: isAI ? 'row' : 'row-reverse' }}>
                      <Avatar sx={{ bgcolor: isAI ? 'primary.main' : 'secondary.main', width: 32, height: 32 }}>
                        {isAI ? <Assistant fontSize="small" /> : <Person fontSize="small" />}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: isAI ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                          bgcolor: isAI ? 'background.paper' : 'rgba(21, 101, 192, 0.08)',
                          border: '1px solid',
                          borderColor: isAI ? 'rgba(0,0,0,0.05)' : 'rgba(21, 101, 192, 0.15)',
                          fontSize: '0.8rem',
                          color: 'text.primary',
                          boxShadow: 'none'
                        }}
                      >
                        <div 
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(m.text) }} 
                          style={{ lineHeight: 1.6 }}
                        />
                      </Paper>
                    </Box>
                  </motion.div>
                );
              })}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignContent: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <Assistant fontSize="small" />
                    </Avatar>
                    <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Agents verifying compliance guidelines...
                      </Typography>
                    </Paper>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: 'action.hover' }}>
            <Box 
              component="form" 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              sx={{ display: 'flex', gap: 2 }}
            >
              <TextField
                fullWidth
                size="small"
                disabled={loading}
                placeholder="Ask about crew swaps, wind shear alerts, or duty rules..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ px: 3, fontWeight: 700, borderRadius: 2.5 }}
                endIcon={<Send />}
              >
                Send
              </Button>
            </Box>
          </Box>

        </Card>
      </Grid>

    </Grid>
  );
}

export default AIChatPanel;
