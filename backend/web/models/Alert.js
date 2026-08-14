const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  junctionId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['CONGESTION', 'RISKY_MOVEMENT', 'LANE_VIOLATION', 'EMERGENCY_CORRIDOR', 'SYSTEM'], 
    default: 'CONGESTION' 
  },
  severity: { 
    type: String, 
    enum: ['HEALTHY', 'MODERATE', 'WARNING', 'CRITICAL'], 
    default: 'WARNING' 
  },
  suggestedAction: { type: String },
  targetApproach: { type: String },
  riskScore: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'], default: 'ACTIVE' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
