import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { useSimulation } from '../context/SimulationContext';

function LiveAnalytics() {
  const { speed } = useSimulation();
  // Live ticking metrics state
  const [ticks, setTicks] = useState(0);
  const [hourlyFlights, setHourlyFlights] = useState([
    { hour: '08:00', flights: 45 },
    { hour: '09:00', flights: 52 },
    { hour: '10:00', flights: 68 },
    { hour: '11:00', flights: 74 },
    { hour: '12:00', flights: 61 },
    { hour: '13:00', flights: 82 },
    { hour: '14:00', flights: 90 }
  ]);

  const [fuelData, setFuelData] = useState([
    { name: 'AA100', fuel: 2400 },
    { name: 'AA200', fuel: 1900 },
    { name: 'AA300', fuel: 2800 },
    { name: 'AA400', fuel: 2200 },
    { name: 'AA500', fuel: 3100 }
  ]);

  const [trafficData, setTrafficData] = useState([
    { airport: 'JFK', arrivals: 40, departures: 35 },
    { airport: 'LAX', arrivals: 32, departures: 45 },
    { airport: 'ORD', arrivals: 50, departures: 48 },
    { airport: 'DFW', arrivals: 28, departures: 30 }
  ]);

  useEffect(() => {
    const intervalTime = 5000 / speed;
    const timer = setInterval(() => {
      setTicks(t => t + 1);

      // Mutate LineChart flights per hour
      setHourlyFlights(prev => {
        const copy = [...prev];
        const lastVal = copy[copy.length - 1].flights;
        const newVal = Math.max(20, Math.min(120, lastVal + Math.floor(Math.random() * 11) - 5));
        const now = new Date();
        const nextHour = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        copy.push({ hour: nextHour, flights: newVal });
        if (copy.length > 8) copy.shift();
        return copy;
      });

      // Mutate fuel consumption stats
      setFuelData(prev => prev.map(f => ({
        ...f,
        fuel: Math.max(1000, Math.min(5000, f.fuel + Math.floor(Math.random() * 201) - 100))
      })));

      // Mutate traffic counts
      setTrafficData(prev => prev.map(t => ({
        ...t,
        arrivals: Math.max(10, Math.min(80, t.arrivals + Math.floor(Math.random() * 5) - 2)),
        departures: Math.max(10, Math.min(80, t.departures + Math.floor(Math.random() * 5) - 2))
      })));

    }, intervalTime);

    return () => clearInterval(timer);
  }, [speed]);

  const delayCauses = [
    { name: 'Convective Storms', value: 45, color: '#D32F2F' },
    { name: 'FAA Rest Violations', value: 25, color: '#FB8C00' },
    { name: 'Gate Congestion', value: 20, color: '#1565C0' },
    { name: 'Late Turnarounds', value: 10, color: '#00ACC1' }
  ];

  const radarCompliance = [
    { subject: 'Rest Hours', A: 92, fullMark: 100 },
    { subject: 'Type Ratings', A: 98, fullMark: 100 },
    { subject: 'Standby Pool', A: 85, fullMark: 100 },
    { subject: 'Weather Limits', A: 90, fullMark: 100 },
    { subject: 'Route Safety', A: 95, fullMark: 100 }
  ];

  return (
    <Grid container spacing={4}>
      
      {/* Line Chart: Flights Per Hour */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>Live Scheduled Flights Count per Hour</Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={hourlyFlights}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="hour" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0B192C', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
                  <Line type="monotone" dataKey="flights" stroke="#1565C0" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Area Chart: Fuel Consumption */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>Real-Time Fuel Efficiency (Gal/hr)</Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={fuelData}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ACC1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00ACC1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0B192C', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
                  <Area type="monotone" dataKey="fuel" stroke="#00ACC1" fillOpacity={1} fill="url(#colorFuel)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Bar Chart: Traffic Count */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>Hub Arrivals & Departures Traffic</Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="airport" stroke="currentColor" fontSize={11} />
                  <YAxis stroke="currentColor" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0B192C', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="arrivals" fill="#1565C0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="departures" fill="#FB8C00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Donut Chart: Delay Factors */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContet: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Main Delay Causes</Typography>
            <Box sx={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={delayCauses}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {delayCauses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0B192C', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {delayCauses.map(d => (
                <Box key={d.name} sx={{ display: 'flex', justifyContet: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{d.name}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, ml: 'auto' }}>{d.value}%</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Radar Chart: Compliance Index */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>FAA Compliance Vector</Typography>
            <Box sx={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarCompliance}>
                  <PolarGrid stroke="currentColor" opacity={0.1} />
                  <PolarAngleAxis dataKey="subject" stroke="currentColor" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                  <Radar name="Compliance" dataKey="A" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
}

export default LiveAnalytics;
