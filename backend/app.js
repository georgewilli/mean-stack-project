const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const lockedContacts = new Map();

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:4200", // Your Angular app URL
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });
const dotenv = require('dotenv');

dotenv.config();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
  
    // Send current locked contacts to newly connected user
    const lockedContactsArray = Array.from(lockedContacts.entries()).map(([contactId, data]) => ({
      contactId,
      lockedBy: data.userId,
      lockedAt: data.lockedAt
    }));
    socket.emit('locked-contacts', lockedContactsArray);
  
    // Handle contact lock request
    socket.on('lock-contact', (data) => {
      const { contactId, userId, userName } = data;
  
      if (lockedContacts.has(contactId)) {
        const lockData = lockedContacts.get(contactId);
        if (lockData.userId !== userId) {
          socket.emit('lock-failed', {
            contactId,
            message: `Contact is being edited by ${lockData.userName}`,
            lockedBy: lockData.userName
          });
          return;
        }
      }
  
      // Lock the contact
      const lockedAt = new Date();
      lockedContacts.set(contactId, {
        userId,
        userName,
        socketId: socket.id,
        lockedAt
      });
  
      io.emit('contact-locked', {
        contactId,
        lockedBy: userId,
        userName,
        lockedAt
      });
  
      socket.emit('lock-success', { contactId });
    });
  
    // Handle contact unlock request
    socket.on('unlock-contact', (data) => {
      const { contactId, userId } = data;  
      if (lockedContacts.has(contactId)) {
        const lockData = lockedContacts.get(contactId);
        if (lockData.userId === userId) {
          lockedContacts.delete(contactId);
          io.emit('contact-unlocked', { contactId });
        } 
      } 
    });
  
    // Handle disconnect - unlock all contacts locked by this user
    socket.on('disconnect', () => {  
      const contactsToUnlock = [];
      for (const [contactId, lockData] of lockedContacts.entries()) {
        if (lockData.socketId === socket.id) {
          contactsToUnlock.push(contactId);
          lockedContacts.delete(contactId);
        }
      }
  
      contactsToUnlock.forEach(contactId => {
        io.emit('contact-unlocked', { contactId });
      });
    });
  });
  
// enable CORS to allow requests from the frontend
app.use(cors());

// parse JSON bodies
app.use(express.json());

// routes
const contactsRoutes = require('./routes/contacts');
app.use('/api/contacts', contactsRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// home route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// start the server
server.listen(port, (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Server is running on http://localhost:${port}`);
});
main().catch(err => console.log(err)); 
async function main() {
    try {
        const connectionString = process.env.CONNECTION_STRING;
        await mongoose.connect(connectionString , {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        mongoose.set('strictQuery', true);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}