const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role || 'Viewer'
        });
        await newUser.save();
        res.status(201).json({ message: "User created!" });
    } catch (err) { res.status(500).json(err); }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json("User not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        const token = jwt.sign({ id: user._id, role: user.role }, "SECRET_KEY");
        res.status(200).json({ token, role: user.role, username: user.username });
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;