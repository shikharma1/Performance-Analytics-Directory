const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add the employee name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    trim: true,
  },
  skills: {
    type: [String],
    required: [true, 'Please add at least one skill'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Employee must have at least one skill.',
    },
  },
  performanceScore: {
    type: Number,
    required: [true, 'Please add a performance score'],
    min: [0, 'Performance score cannot be less than 0'],
    max: [100, 'Performance score cannot be more than 100'],
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience'],
    min: [0, 'Years of experience cannot be negative'],
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', EmployeeSchema);
