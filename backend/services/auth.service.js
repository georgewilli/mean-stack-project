const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();




export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401).json({ message: 'No token provided, authorization failed' });
    try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET);   
     req.user = decoded;
     next();
    }catch (error) {
        return res.sendStatus(403).json({ message: 'Failed to authenticate token' });
    }
}