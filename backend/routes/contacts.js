const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { verifyToken, requireRole } = require('../middlewares/auth');

// GET all contacts (with pagination + filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { name, phone, address } = req.query;

    const filter = {};
    if (name) filter.name = { $regex: new RegExp(name, 'i') };
    if (phone) filter.phone = { $regex: new RegExp(phone, 'i') };
    if (address) filter.address = { $regex: new RegExp(address, 'i') };

    const totalContacts = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalContacts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET a single contact by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// POST a new contact (admin only)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const contact = new Contact(req.body);
     await contact.save();
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

// PUT to update a contact by ID
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE a contact (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedContact = await Contact.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedContact);
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;