const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// In-Memory Simulated State for rapid prototyping & offline robustness
let activeSimulation = {
  currentJunction: 'J-04 Ring Road South',
  mode: 'ADAPTIVE',
  approaches: {
    North: { name: 'North Corridor', vehicleCount: 38, densityPct: 76.0, status: 'HIGH', currentLight: 'RED', greenSec: 35 },
    South: { name: 'South Flyover', vehicleCount: 22, densityPct: 44.0, status: 'MEDIUM', currentLight: 'RED', greenSec: 25 },
    East: { name: 'East Commercial Arterial', vehicleCount: 46, densityPct: 92.0, status: 'CRITICAL', currentLight: 'GREEN', greenSec: 50 },
    West: { name: 'West Residential Feeder', vehicleCount: 14, densityPct: 28.0, status: 'LOW', currentLight: 'RED', greenSec: 20 }
  },
  emergency: {
    active: false,
    ambulanceId: 'DL-01-AMB-889',
    patientSeverity: 'CRITICAL',
    triageLevel: 'RED',
    etaSeconds: 90,
    countdownSeconds: 90,
    roadsideMessage: 'Ambulance approaching. Keep left lane clear. Please wait 90 seconds.',
    hospital: 'AIIMS Trauma Center'
  },
  alerts: [
    {
      id: 'ALT-101',
      time: '14:23:13',
      title: 'Critical Congestion on East Arterial',
      description: 'Density reached 92% with queue spilling beyond 250m. Adaptive green extended by +20s.',
      severity: 'CRITICAL',
      type: 'CONGESTION',
      author: 'AI Optimizer',
      role: 'System'
    },
    {
      id: 'ALT-102',
      time: '14:21:40',
      title: 'Erratic Trajectory (Cut-Maarna) Detected',
      description: 'Vehicle DL-04-TC-201 performed abrupt 38° lane swerve across 3 lanes at 58 km/h.',
      severity: 'WARNING',
      type: 'RISKY_MOVEMENT',
      author: 'Pattern AI',
      role: 'Vision ML'
    },
    {
      id: 'ALT-103',
      time: '14:18:05',
      title: 'Green Corridor Pre-Clear Triggered',
      description: 'Ambulance DL-01-AMB-889 en route with Critical patient. Roadside display set to 90s countdown.',
      severity: 'HEALTHY',
      type: 'EMERGENCY_CORRIDOR',
      author: 'Triage Engine',
      role: 'Emergency Dispatch'
    }
  ]
};

// WebSocket Broadcast
function broadcastState() {
  const data = JSON.stringify({ type: 'TRAFFIC_STATE_UPDATE', payload: activeSimulation });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Background simulation ticker
setInterval(() => {
  if (activeSimulation.emergency.active && activeSimulation.emergency.countdownSeconds > 0) {
    activeSimulation.emergency.countdownSeconds -= 1;
    if (activeSimulation.emergency.countdownSeconds === 0) {
      activeSimulation.emergency.active = false;
      activeSimulation.mode = 'ADAPTIVE';
      activeSimulation.emergency.roadsideMessage = 'Ambulance passed safely. Adaptive signal cycle restored.';
      activeSimulation.approaches.East.currentLight = 'GREEN';
    }
    broadcastState();
  }
}, 1000);

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Adaptive Signal Web Backend', wsClients: wss.clients.size });
});

app.get('/api/state', (req, res) => {
  res.json(activeSimulation);
});

// Trigger Emergency from Web API
app.post('/api/emergency/trigger', async (req, res) => {
  const { severity = 'CRITICAL', ambulanceId = 'DL-01-AMB-889', distanceM = 850 } = req.body;
  
  try {
    // Attempt ML service triage
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/triage-emergency`, {
      ambulance_id: ambulanceId,
      patient_severity: severity,
      distance_to_junction_m: distanceM,
      current_speed_kmh: 45.0,
      route_congestion_pct: activeSimulation.approaches.East.densityPct
    }).catch(() => null);

    const triageData = mlResponse ? mlResponse.data : {
      triage_state: severity === 'CRITICAL' ? 'RED' : 'YELLOW',
      roadside_display: { message: `Ambulance approaching. Keep left lane clear. Wait 90s.`, suggested_wait_seconds: 90 }
    };

    activeSimulation.emergency = {
      active: true,
      ambulanceId: ambulanceId,
      patientSeverity: severity,
      triageLevel: triageData.triage_state || 'RED',
      etaSeconds: triageData.eta_seconds || 90,
      countdownSeconds: triageData.roadside_display?.suggested_wait_seconds || 90,
      roadsideMessage: triageData.roadside_display?.message || 'Ambulance approaching. Keep left. Wait 90s.',
      hospital: 'AIIMS Trauma Center'
    };
    activeSimulation.mode = 'EMERGENCY_CORRIDOR';
    
    // Hold conflicting lanes
    activeSimulation.approaches.North.currentLight = 'RED';
    activeSimulation.approaches.South.currentLight = 'RED';
    activeSimulation.approaches.West.currentLight = 'RED';
    activeSimulation.approaches.East.currentLight = 'GREEN';

    broadcastState();
    res.json({ success: true, state: activeSimulation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Emergency
app.post('/api/emergency/reset', (req, res) => {
  activeSimulation.emergency.active = false;
  activeSimulation.mode = 'ADAPTIVE';
  activeSimulation.emergency.countdownSeconds = 0;
  activeSimulation.emergency.roadsideMessage = 'Adaptive Signal Active. Normal traffic flow maintained.';
  broadcastState();
  res.json({ success: true, state: activeSimulation });
});

// WebSocket Connection
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'INITIAL_STATE', payload: activeSimulation }));
});

server.listen(PORT, () => {
  console.log(`[ASI Web Backend] Server running on http://localhost:${PORT}`);
});
