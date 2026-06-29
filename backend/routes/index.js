const express = require('express');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');
const taskController = require('../controllers/taskController');
const aiController = require('../controllers/aiController');
const { getHabits, createHabit, toggleHabit, deleteHabit, getSummary, getWeekly } = require('../controllers/otherControllers');

const router = express.Router();

// ── Auth ──────────────────────────────────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);
router.put('/auth/profile', protect, authController.updateProfile);
router.put('/auth/settings', protect, authController.updateSettings);

// ── Tasks ─────────────────────────────────────────────────────────────────
router.get('/tasks', protect, taskController.getTasks);
router.get('/tasks/stats', protect, taskController.getStats);
router.get('/tasks/:id', protect, taskController.getTask);
router.post('/tasks', protect, taskController.createTask);
router.put('/tasks/:id', protect, taskController.updateTask);
router.delete('/tasks/:id', protect, taskController.deleteTask);
router.post('/tasks/bulk', protect, taskController.bulkUpdate);

// ── AI Agents ─────────────────────────────────────────────────────────────
router.post('/ai/plan', protect, aiController.plan);
router.post('/ai/prioritize', protect, aiController.prioritize);
router.post('/ai/procrastination', protect, aiController.procrastination);
router.post('/ai/rescue', protect, aiController.rescue);
router.post('/ai/reflection', protect, aiController.reflection);
router.post('/ai/habits', protect, aiController.habitInsight);
router.post('/ai/voice', protect, aiController.voice);
router.post('/ai/suggestion', protect, aiController.suggestion);
router.get('/ai/history', protect, aiController.getHistory);

// ── Habits ────────────────────────────────────────────────────────────────
router.get('/habits', protect, getHabits);
router.post('/habits', protect, createHabit);
router.post('/habits/:id/toggle', protect, toggleHabit);
router.delete('/habits/:id', protect, deleteHabit);

// ── Analytics ─────────────────────────────────────────────────────────────
router.get('/analytics/summary', protect, getSummary);
router.get('/analytics/weekly', protect, getWeekly);

module.exports = router;
