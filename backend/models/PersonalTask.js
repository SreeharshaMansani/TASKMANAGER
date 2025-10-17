const mongoose = require('mongoose');

const personalTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate:{type:Date,default:Date.now},
  dueDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('PersonalTask', personalTaskSchema);
