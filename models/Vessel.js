const mongoose = require('mongoose');

const VesselSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // Cargo, Tanker, Submarine, etc.
    status: { type: String, default: 'In Transit' },
    
    // NEW TRACKING FIELDS
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, required: true }, // in knots
    engineHealth: { type: Number, default: 100 }, // 0 to 100%
    fuelLevel: { type: Number, default: 100 }    // 0 to 100%
}, { timestamps: true });

module.exports = mongoose.model('Vessel', VesselSchema);