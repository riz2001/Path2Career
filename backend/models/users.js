const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admissionno: { type: String, required: true },
  batch: { type: String, required: true },
  courseYear: { type: String, required: true },
  phoneno: { type: String, required: true }, 
  rollno: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  approved: { type: Boolean, default: false },
  timeSlots: [
    {
      timeSlot: { type: String, required: true },
      date: { type: Date, required: true },
      meetingLink: String,
      status: { type: String, enum: ['attended', 'not attended', 'pending'], default: 'pending' },
      confirmationStatus: { type: String, enum: ['confirmed', 'declined', 'pending'], default: 'pending' } // New field for attendance confirmation
    },
  ],
});

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
