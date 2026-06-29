const mongoose = require('mongoose');

const HabitLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
  note: { type: String },
});

const HabitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  icon: { type: String, default: 'default' },
  color: { type: String, default: '#7c3aed' },
  target: { type: Number, default: 1 },
  unit: { type: String, default: 'times' },
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completedToday: { type: Boolean, default: false },
  logs: [HabitLogSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true });

const AnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  tasksCreated: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  focusMinutes: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  onTimeCompletions: { type: Number, default: 0 },
  lateCompletions: { type: Number, default: 0 },
  categoriesWorked: [{ type: String }],
}, { timestamps: true });

AnalyticsSchema.index({ user: 1, date: -1 });

const AIHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  agent: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  tokens: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = {
  Habit: mongoose.model('Habit', HabitSchema),
  Analytics: mongoose.model('Analytics', AnalyticsSchema),
  AIHistory: mongoose.model('AIHistory', AIHistorySchema),
};
