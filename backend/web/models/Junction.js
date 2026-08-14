const mongoose = require('mongoose');

const ApproachSchema = new mongoose.Schema({
  name: { type: String, required: true }, // North, South, East, West
  vehicleCount: { type: Number, default: 0 },
  densityPct: { type: Number, default: 0 },
  status: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  greenDurationSec: { type: Number, default: 30 },
  currentLight: { type: String, enum: ['RED', 'YELLOW', 'GREEN'], default: 'RED' }
});

const JunctionSchema = new mongoose.Schema({
  junctionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, default: 'New Delhi' },
  mode: { type: String, enum: ['ADAPTIVE', 'MANUAL', 'EMERGENCY_CORRIDOR'], default: 'ADAPTIVE' },
  totalVehicles: { type: Number, default: 0 },
  avgDensityPct: { type: Number, default: 0 },
  approaches: [ApproachSchema],
  activeEmergencyId: { type: String, default: null },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Junction', JunctionSchema);
