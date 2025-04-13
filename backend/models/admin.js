const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({

  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Allowed user types
  type: { 
    type: String, 
    enum: ['btech', 'mca', 'mba', 'admin'], 
    required: true 
  }
});

module.exports = mongoose.model('Admin', adminSchema);
