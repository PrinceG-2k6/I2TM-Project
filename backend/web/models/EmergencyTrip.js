const mongoose = require('mongoose');

const EmergencyTripSchema = new mongoose.Schema({
  ambulanceId: { type: String, required: true },
  patientSeverity: { 
    type: String, 
    enum: ['CRITICAL', 'SERIOUS', 'STABLE'], 
    default: 'CRITICAL' 
  },
  triageLevel: { 
    type: String, 
    enum: ['RED', 'YELLOW', 'GREEN'], 
    default: 'RED' 
  },
  targetHospital: { type: String, default: 'AIIMS Trauma Center' },
  originLocation: { type: String, default: 'Connaught Place Outer Ring' },
  corridorStatus: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'PASSED', 'COMPLETED'], 
    default: 'ACTIVE' 
  },
  etaSeconds: { type: Number, default: 90 },
  countdownSeconds: { type: Number, default: 90 },
  clearedJunctions: [{ type: String }],
  upcomingJunctions: [{ type: String }],
  roadsideMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyTrip', EmergencyTripSchema);
