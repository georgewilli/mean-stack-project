
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


router.post('/signup', async (req, res) => {
    try {
        const {username, password} = req.body;        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(500).json({ error: 'User already exists' });
        }
        const hashedPassword= await bcrypt.hash(password, 10);
        const user = new User({ username, password:hashedPassword });
        await user.save();
        const users = await User.find();
        res.status(200).json({ message: 'User created successfully' , users});
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        const token= jwt.sign({ userId: user._id , username: user._username}, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful' , token , user});
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

module.exports = router;