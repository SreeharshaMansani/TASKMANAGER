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
  startDate:{type:Date,default:Date.now},
  dueDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TeamTask', teamTaskSchema);
