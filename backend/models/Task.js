const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  category: { type: String, default: 'Work' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  deadline: { type: Date },
  estimatedTime: { type: Number },     // hours
  actualTime: { type: Number },        // hours
  labels: [{ type: String }],
  subtasks: [SubtaskSchema],
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    nextDue: { type: Date },
  },
  aiPriorityScore: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

TaskSchema.index({ user: 1, deadline: 1 });
TaskSchema.index({ user: 1, priority: 1 });
TaskSchema.index({ user: 1, completed: 1 });

TaskSchema.pre('save', function () {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
    this.status = 'completed';
  }
});

module.exports = mongoose.model('Task', TaskSchema);
