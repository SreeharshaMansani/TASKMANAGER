const mongoose = require('mongoose');

const teamTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  category: { type: String, enum: ['Personal', 'Work', 'Study'], default: 'Personal' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  sections: [{
    title: { type: String, required: true },
    description: { type: String, default: "" }
  }],
  steps: [{
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('TeamTask', teamTaskSchema);
