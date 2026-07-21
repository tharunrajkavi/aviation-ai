import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SimulationContext = createContext(null);

export const useSimulation = () => useContext(SimulationContext);

// Airline configurations with brand colors
export const AIRLINES = {
  EMIRATES: { name: 'Emirates', code: 'EK', color: '#D71920', logo: '🔴' },
  QATAR: { name: 'Qatar Airways', code: 'QR', color: '#5A0A2D', logo: '🟣' },
  SINGAPORE: { name: 'Singapore Airlines', code: 'SQ', color: '#FFB81C', logo: '🟡' },
  LUFTHANSA: { name: 'Lufthansa', code: 'LH', color: '#002F6C', logo: '🔵' },
  DELTA: { name: 'Delta Air Lines', code: 'DL', color: '#E03C31', logo: '🔺' },
  AIRINDIA: { name: 'Air India', code: 'AI', color: '#E31837', logo: '🟠' }
};

// Aircraft catalog metadata
export const AIRCRAFT_TYPES = {
  A380: { model: 'Airbus A380', capacity: 525, range: '8,000nm', fuelCapacity: 84000 },
  B777: { model: 'Boeing 777-300ER', capacity: 396, range: '7,370nm', fuelCapacity: 47890 },
  A350: { model: 'Airbus A350-900', capacity: 325, range: '8,100nm', fuelCapacity: 37320 },
  B787: { model: 'Boeing 787 Dreamliner', capacity: 290, range: '7,355nm', fuelCapacity: 33520 },
  A320: { model: 'Airbus A320neo', capacity: 180, range: '3,500nm', fuelCapacity: 7060 },
  B737: { model: 'Boeing 737 MAX 9', capacity: 193, range: '3,550nm', fuelCapacity: 6850 }
};

// Global airport catalog mapping coordinates
export const AIRPORTS = {
  DXB: { name: 'Dubai Intl', coords: [25.2532, 55.3657], city: 'Dubai', runways: '12L/30R, 12R/30L', gates: 'A15, B22, C10', status: 'Clear VFR' },
  SIN: { name: 'Singapore Changi', coords: [1.3644, 103.9915], city: 'Singapore', runways: '02L/20R, 02C/20C', gates: 'T1-A2, T3-B4', status: 'Clear VFR' },
  LHR: { name: 'London Heathrow', coords: [51.4700, -0.4543], city: 'London', runways: '09L/27R, 09R/27L', gates: 'T2-B3, T5-A5', status: 'Heavy Rain' },
  JFK: { name: 'New York JFK', coords: [40.6413, -73.7781], city: 'New York', runways: '04L/22R, 13R/31L', gates: 'T4-B28, T8-42', status: 'Severe Storm' },
  LAX: { name: 'Los Angeles Intl', coords: [33.9416, -118.4085], city: 'Los Angeles', runways: '24L/06R, 25R/07L', gates: 'T4-44, T7-71A', status: 'Clear VFR' },
  DEL: { name: 'Indira Gandhi Intl', coords: [28.5562, 77.1000], city: 'Delhi', runways: '09/27, 10/28, 11R/29L', gates: 'T3-12, T3-18', status: 'Dense Fog' },
  HYD: { name: 'Rajiv Gandhi Intl', coords: [17.2405, 78.4294], city: 'Hyderabad', runways: '09L/27R, 09R/27L', gates: 'G12, G18', status: 'Clear VFR' },
  BOM: { name: 'Chhatrapati Shivaji Intl', coords: [19.0896, 72.8656], city: 'Mumbai', runways: '09/27, 14/32', gates: 'T2-A4, T2-B12', status: 'Clear VFR' },
  FRA: { name: 'Frankfurt Airport', coords: [50.0379, 8.5622], city: 'Frankfurt', runways: '07C/25C, 07R/25L', gates: 'A12, B42', status: 'Clear VFR' },
  DOH: { name: 'Hamad Intl', coords: [25.2731, 51.6081], city: 'Doha', runways: '16L/34R, 16R/34L', gates: 'A6, B10, C12', status: 'Clear VFR' }
};

export const SimulationProvider = ({ children }) => {
  const [status, setStatus] = useState('IDLE'); // 'IDLE', 'RUNNING', 'PAUSED', 'STOPPED'
  const [speed, setSpeed] = useState(1); // 1, 2, 5, 10
  const [simTime, setSimTime] = useState(new Date('2026-07-17T08:00:00'));
  
  // AWS upload state
  const [awsStatus, setAwsStatus] = useState({ active: false, type: '', message: '' });

  // AI Workflow Animation state
  const [aiWorkflow, setAiWorkflow] = useState({
    active: false,
    activeStep: -1,
    flightNumber: '',
    logs: '',
    completed: false
  });

  // Comprehensive AOCC statistics metrics
  const [metrics, setMetrics] = useState({
    airborne: 5,
    delayed: 2,
    boarding: 2,
    landed: 24,
    cancelled: 0,
    crewOnDuty: 32,
    crewResting: 18,
    crewAvailable: 15,
    weatherAlerts: 3,
    aiRecommendations: 8,
    complianceScore: 98,
    avgDelay: 14,
    otp: 94.2,
    fuelEfficiency: 93.5,
    passengerImpact: 180,
    emergencyCount: 0,
    weatherImpact: 20
  });

  // Global Pilots & Cabin Crew Roster
  const [crew, setCrew] = useState([
    { id: 1, name: 'Captain John Doe', type: 'PILOT', qualification: 'CAPTAIN', certifications: 'B777, B737', restHoursRemaining: 8.0, available: true, currentAirportCode: 'JFK', totalFlyingHours: 5200, languages: 'English, Spanish' },
    { id: 2, name: 'Captain Jane Smith', type: 'PILOT', qualification: 'CAPTAIN', certifications: 'A380, A350', restHoursRemaining: 14.0, available: true, currentAirportCode: 'DXB', totalFlyingHours: 6800, languages: 'English, French' },
    { id: 3, name: 'FO Bob Johnson', type: 'PILOT', qualification: 'FIRST_OFFICER', certifications: 'B777, A320', restHoursRemaining: 12.0, available: true, currentAirportCode: 'JFK', totalFlyingHours: 1200, languages: 'English' },
    { id: 4, name: 'Purser Alice White', type: 'CABIN_CREW', qualification: 'PURSER', certifications: 'B777, A380', restHoursRemaining: 10.0, available: true, currentAirportCode: 'DXB', totalFlyingHours: 3200, languages: 'English, German' },
    { id: 5, name: 'Attendant Tom Brown', type: 'CABIN_CREW', qualification: 'ATTENDANT', certifications: 'B737, A320', restHoursRemaining: 7.5, available: true, currentAirportCode: 'JFK', totalFlyingHours: 850, languages: 'English' },
    { id: 6, name: 'Attendant Sarah Davis', type: 'CABIN_CREW', qualification: 'ATTENDANT', certifications: 'A380, B787', restHoursRemaining: 11.5, available: true, currentAirportCode: 'SIN', totalFlyingHours: 1400, languages: 'English, Japanese' }
  ]);

  // Simulated Global Flights Roster representing multiple airlines and aircraft
  const [flights, setFlights] = useState([
    { id: 1, flightNumber: 'EK201', airline: 'EMIRATES', aircraft: 'A380', source: 'DXB', dest: 'JFK', progress: 0.35, altitude: '38,000ft', speed: '495kts', status: 'AIRBORNE', fuel: 48000, captain: 'Captain Jane Smith', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 10 },
    { id: 2, flightNumber: 'QR703', airline: 'QATAR', aircraft: 'B777', source: 'DOH', dest: 'LHR', progress: 0.65, altitude: '36,000ft', speed: '510kts', status: 'AIRBORNE', fuel: 24000, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 15 },
    { id: 3, flightNumber: 'SQ308', airline: 'SINGAPORE', aircraft: 'A350', source: 'SIN', dest: 'LHR', progress: 0.15, altitude: '32,000ft', speed: '480kts', status: 'AIRBORNE', fuel: 31000, captain: 'Captain Jane Smith', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 8 },
    { id: 4, flightNumber: 'LH430', airline: 'LUFTHANSA', aircraft: 'B787', source: 'FRA', dest: 'ORD', progress: 0.82, altitude: '39,000ft', speed: '505kts', status: 'AIRBORNE', fuel: 19500, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 12 },
    { id: 5, flightNumber: 'AI101', airline: 'AIRINDIA', aircraft: 'B777', source: 'DEL', dest: 'JFK', progress: 0.05, altitude: '14,000ft', speed: '290kts', status: 'AIRBORNE', fuel: 41000, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'TAKEOFF', riskScore: 25 },
    { id: 6, flightNumber: 'DL084', airline: 'DELTA', aircraft: 'B767', source: 'JFK', dest: 'CDG', progress: 0.0, altitude: '0ft', speed: '0kts', status: 'BOARDING', fuel: 28000, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'BOARDING', riskScore: 35 }
  ]);

  // Weather Hub states
  const [weatherAlerts, setWeatherAlerts] = useState([
    { id: 1, airportCode: 'JFK', severity: 'SEVERE', weatherType: 'STORM', message: 'KJFK Storm warning: wind shear gusting 40kts', active: true },
    { id: 2, airportCode: 'DEL', severity: 'MODERATE', weatherType: 'FOG', message: 'VIDP METAR: visibility CAT III 150m dense fog', active: true },
    { id: 3, airportCode: 'LHR', severity: 'MODERATE', weatherType: 'RAIN', message: 'EGLL METAR: heavy shower continuous gusting 20kts', active: true },
    { id: 4, airportCode: 'DXB', severity: 'CLEAR', weatherType: 'SUNNY', message: 'OMDB METAR: VFR clear flight conditions', active: false }
  ]);

  // Events Logger Timeline Feed
  const [events, setEvents] = useState([
    { id: 1, timestamp: '08:00:00', text: '✈ Flight EK201 departed Dubai (DXB) Hub bound for JFK', type: 'FLIGHT' },
    { id: 2, timestamp: '08:02:15', text: '⚠ METAR dense fog advisory issued at Indira Gandhi DEL', type: 'WEATHER' },
    { id: 3, timestamp: '08:04:30', text: '🤖 AI Dispatch model checked rest limit compliance for standbys', type: 'AI' }
  ]);

  const tickTimer = useRef(null);

  const triggerAwsUpload = (fileName) => {
    setAwsStatus({ active: true, type: 'RDS', message: 'Saving schedules & flight status metadata to Amazon RDS...' });
    
    setTimeout(() => {
      setAwsStatus({ active: true, type: 'S3', message: `Uploading operations file [${fileName}] to Amazon S3 bucket...` });
    }, 1500);

    setTimeout(() => {
      setAwsStatus({ active: true, type: 'CLOUDWATCH', message: 'Publishing operations logs and EC2 load to CloudWatch...' });
    }, 3000);

    setTimeout(() => {
      setAwsStatus({ active: true, type: 'BACKUP', message: 'Amazon RDS backup snapshot sync finalized.' });
    }, 4500);

    setTimeout(() => {
      setAwsStatus({ active: false, type: '', message: '' });
    }, 6000);
  };

  const runAiPipeline = (flightNum) => {
    setAiWorkflow({ active: true, activeStep: 0, flightNumber: flightNum, logs: 'Weather check agent auditing METAR maps...', completed: false });
    
    const steps = [
      { step: 1, logs: 'Delay propagation model evaluating secondary sector aircraft rotations...' },
      { step: 2, logs: 'FAA Section 117 compliance agent checking pilot fatigue rest hours...' },
      { step: 3, logs: 'Conflict Check: Captain rest hour violation detected (< 10h rest).' },
      { step: 4, logs: 'Standby Pool audit: Standby Captain Jane Smith matched (14h rest, B777 certified).' },
      { step: 5, logs: 'Network cost analyst agent verifying route slot timings...' },
      { step: 6, logs: 'Awaiting dispatcher sign-off for Captain replacement assignment...' }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setAiWorkflow(prev => ({
          ...prev,
          activeStep: s.step,
          logs: s.logs,
          completed: s.step === 6
        }));
      }, (idx + 1) * 1200);
    });
  };

  const addEventLog = (text, type = 'FLIGHT') => {
    setEvents(prev => {
      const copy = [...prev];
      copy.unshift({
        id: Date.now(),
        timestamp: simTime.toLocaleTimeString(),
        text,
        type
      });
      if (copy.length > 20) copy.pop();
      return copy;
    });
  };

  // central simulation intervals handler
  useEffect(() => {
    if (status !== 'RUNNING') {
      if (tickTimer.current) clearInterval(tickTimer.current);
      return;
    }

    const intervalTime = 5000 / speed;

    tickTimer.current = setInterval(() => {
      // 1. Advance Simulation Clock
      setSimTime(prev => new Date(prev.getTime() + 60000));

      // 2. Animate and progress aircraft tracks
      setFlights(prevFlights => prevFlights.map(f => {
        if (f.status !== 'AIRBORNE') return f;
        
        let nextProg = f.progress + 0.01;
        let nextPhase = f.phase;
        
        if (nextProg >= 1.0) {
          nextProg = 0.0;
          nextPhase = 'GATE_ARRIVAL';
          addEventLog(`🛬 Flight ${f.flightNumber} (${AIRLINES[f.airline]?.name}) landed and taxied to gate`, 'FLIGHT');
          
          setMetrics(m => ({ ...m, landed: m.landed + 1, airborne: Math.max(0, m.airborne - 1) }));
          return { ...f, progress: 0.0, status: 'LANDED', phase: nextPhase, altitude: '0ft', speed: '0kts' };
        }

        if (nextProg > 0.05 && nextProg < 0.20) nextPhase = 'TAXI';
        else if (nextProg >= 0.20 && nextProg < 0.35) nextPhase = 'TAKEOFF';
        else if (nextProg >= 0.35 && nextProg < 0.85) nextPhase = 'CRUISE';
        else if (nextProg >= 0.85) nextPhase = 'LANDING';

        return {
          ...f,
          progress: nextProg,
          phase: nextPhase,
          fuel: Math.max(100, f.fuel - 25),
          altitude: nextPhase === 'CRUISE' ? '37,000ft' : '12,000ft',
          speed: nextPhase === 'CRUISE' ? '505kts' : '260kts'
        };
      }));

      // 3. Random live events generator
      const rand = Math.random();
      if (rand > 0.88) {
        // Disruption Event: Weather wind shear / storm
        setWeatherAlerts(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], severity: 'SEVERE', message: 'Severe storm warning: KJFK wind shear gusting 45kts', active: true };
          return updated;
        });
        setMetrics(m => ({ ...m, weatherAlerts: m.weatherAlerts + 1, delayed: m.delayed + 1 }));
        addEventLog('⚠ Weather warning KJFK: Storm cells active over runway approach', 'WEATHER');
      } else if (rand < 0.12) {
        // Disruption Event: Pilot Sick / Crew Sick
        setCrew(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], available: false }; // Mark John Doe sick
          return updated;
        });
        addEventLog('🤒 Crew Status Alert: Captain John Doe marked sick at JFK base sector', 'AI');
        runAiPipeline('AI101'); // Automatically run LangGraph auto-swap workflow recommendation
      }

    }, intervalTime);

    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
    };
  }, [status, speed, simTime]);

  const handleStart = () => setStatus('RUNNING');
  const handlePause = () => setStatus('PAUSED');
  const handleStop = () => {
    setStatus('STOPPED');
    setSimTime(new Date('2026-07-17T08:00:00'));
  };
  
  const handleReset = () => {
    setStatus('IDLE');
    setSpeed(1);
    setSimTime(new Date('2026-07-17T08:00:00'));
    setFlights([
      { id: 1, flightNumber: 'EK201', airline: 'EMIRATES', aircraft: 'A380', source: 'DXB', dest: 'JFK', progress: 0.35, altitude: '38,000ft', speed: '495kts', status: 'AIRBORNE', fuel: 48000, captain: 'Captain Jane Smith', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 10 },
      { id: 2, flightNumber: 'QR703', airline: 'QATAR', aircraft: 'B777', source: 'DOH', dest: 'LHR', progress: 0.65, altitude: '36,000ft', speed: '510kts', status: 'AIRBORNE', fuel: 24000, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 15 },
      { id: 3, flightNumber: 'SQ308', airline: 'SINGAPORE', aircraft: 'A350', source: 'SIN', dest: 'LHR', progress: 0.15, altitude: '32,000ft', speed: '480kts', status: 'AIRBORNE', fuel: 31000, captain: 'Captain Jane Smith', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 8 },
      { id: 4, flightNumber: 'LH430', airline: 'LUFTHANSA', aircraft: 'B787', source: 'FRA', dest: 'ORD', progress: 0.82, altitude: '39,000ft', speed: '505kts', status: 'AIRBORNE', fuel: 19500, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'CRUISE', riskScore: 12 },
      { id: 5, flightNumber: 'AI101', airline: 'AIRINDIA', aircraft: 'B777', source: 'DEL', dest: 'JFK', progress: 0.05, altitude: '14,000ft', speed: '290kts', status: 'AIRBORNE', fuel: 41000, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'TAKEOFF', riskScore: 25 },
      { id: 6, flightNumber: 'DL084', airline: 'DELTA', aircraft: 'B767', source: 'JFK', dest: 'CDG', progress: 0.0, altitude: '0ft', speed: '0kts', status: 'BOARDING', fuel: 28000, captain: 'Captain John Doe', firstOfficer: 'FO Bob Johnson', phase: 'BOARDING', riskScore: 35 }
    ]);
    setWeatherAlerts([
      { id: 1, airportCode: 'JFK', severity: 'SEVERE', weatherType: 'STORM', message: 'KJFK Storm warning: wind shear gusting 40kts', active: true },
      { id: 2, airportCode: 'DEL', severity: 'MODERATE', weatherType: 'FOG', message: 'VIDP METAR: visibility CAT III 150m dense fog', active: true },
      { id: 3, airportCode: 'LHR', severity: 'MODERATE', weatherType: 'RAIN', message: 'EGLL METAR: heavy shower continuous gusting 20kts', active: true },
      { id: 4, airportCode: 'DXB', severity: 'CLEAR', weatherType: 'SUNNY', message: 'OMDB METAR: VFR clear flight conditions', active: false }
    ]);
    addEventLog('🔄 Simulation reset: all flight slots and meteorological profiles synchronized.');
  };

  return (
    <SimulationContext.Provider
      value={{
        status,
        speed,
        simTime,
        metrics,
        flights,
        crew,
        weatherAlerts,
        events,
        awsStatus,
        aiWorkflow,
        setAiWorkflow,
        setFlights,
        setCrew,
        setWeatherAlerts,
        triggerAwsUpload,
        runAiPipeline,
        addEventLog,
        handleStart,
        handlePause,
        handleStop,
        handleReset,
        setSpeed
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
