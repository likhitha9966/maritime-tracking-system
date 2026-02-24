const express = require('express');
const router = express.Router();
const Vessel = require('../models/Vessel'); // Ensure capital 'V'

// 1. GET all vessels
router.get('/', async (req, res) => {
    try { res.json(await Vessel.find()); } catch (err) { res.status(500).json(err); }
});

// 2. GET single vessel details
router.get('/:id', async (req, res) => {
    try { res.json(await Vessel.findById(req.params.id)); } catch (err) { res.status(404).json("Vessel not found"); }
});

// 3. POST register new vessel
router.post('/', async (req, res) => {
    try { res.status(201).json(await new Vessel(req.body).save()); } catch (err) { res.status(400).json(err); }
});

// 4. PUT full update (Admin only)
router.put('/:id', async (req, res) => {
    try { res.json(await Vessel.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (err) { res.status(400).json(err); }
});

// 5. PATCH status update (Operator/Admin)
router.patch('/:id/status', async (req, res) => {
    try { res.json(await Vessel.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })); } catch (err) { res.status(400).json(err); }
});

// 6. PATCH location/speed update (Real-time Simulation)
router.patch('/:id/tracking', async (req, res) => {
    try { res.json(await Vessel.findByIdAndUpdate(req.params.id, 
        { latitude: req.body.latitude, longitude: req.body.longitude, speed: req.body.speed }, { new: true })); 
    } catch (err) { res.status(400).json(err); }
});

// 7. DELETE vessel (Admin only)
router.delete('/:id', async (req, res) => {
    try { await Vessel.findByIdAndDelete(req.params.id); res.json("Deleted"); } catch (err) { res.status(500).json(err); }
});

// 8. GET Dashboard Stats
router.get('/data/stats', async (req, res) => {
    try {
        const total = await Vessel.countDocuments();
        const submarines = await Vessel.countDocuments({ type: 'Submarine' });
        res.json({ total, submarines });
    } catch (err) { res.status(500).json(err); }
});

// 9. GET High Risk Alerts (Engine health < 50)
router.get('/alerts/health', async (req, res) => {
    try { res.json(await Vessel.find({ engineHealth: { $lt: 50 } })); } catch (err) { res.status(500).json(err); }
});

// 10. GET Search by Name
router.get('/search/:name', async (req, res) => {
    try { res.json(await Vessel.find({ name: new RegExp(req.params.name, 'i') })); } catch (err) { res.status(500).json(err); }
});

module.exports = router;