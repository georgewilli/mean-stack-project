const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now   
    },
    updatedAt: { 
        type: Date, 
        default: Date.now   
    }
});
const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
