const Task = require('../models/Task');
const { AIHistory } = require('../models/Other');
const aiService = require('../services/aiService');

const saveHistory = async (userId, agent, prompt, response) => {
  try {
    await AIHistory.create({ user: userId, agent, prompt: prompt.slice(0, 500), response: response.slice(0, 2000) });
  } catch { /* non-critical */ }
};

exports.plan = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ message: 'Prompt required.' });

    const result = await aiService.plannerAgent(prompt);
    await saveHistory(req.user._id, 'planner', prompt, result);
    res.json({ result, agent: 'planner' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured. Please add your Gemini API key.' });
    next(err);
  }
};

exports.prioritize = async (req, res, next) => {
  try {
    const { prompt, taskIds } = req.body;
    let tasks;

    if (taskIds?.length) {
      tasks = await Task.find({ _id: { $in: taskIds }, user: req.user._id });
    } else {
      tasks = await Task.find({ user: req.user._id, completed: false }).limit(20);
    }

    const input = prompt || tasks;
    if (!input || (Array.isArray(input) && !input.length)) {
      return res.status(400).json({ message: 'No tasks to prioritize.' });
    }

    const result = await aiService.priorityAgent(input);
    await saveHistory(req.user._id, 'priority', JSON.stringify(input).slice(0, 200), result);
    res.json({ result, agent: 'priority' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured.' });
    next(err);
  }
};

exports.procrastination = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ message: 'Describe what you\'re avoiding.' });

    const result = await aiService.procrastinationAgent(prompt);
    await saveHistory(req.user._id, 'procrastination', prompt, result);
    res.json({ result, agent: 'procrastination' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured.' });
    next(err);
  }
};

exports.rescue = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ message: 'Describe your emergency situation.' });

    const result = await aiService.rescueAgent(prompt);
    await saveHistory(req.user._id, 'rescue', prompt, result);
    res.json({ result, agent: 'rescue' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured.' });
    next(err);
  }
};

exports.reflection = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const tasks = await Task.find({ user: req.user._id, completed: true, completedAt: { $gte: new Date().setHours(0,0,0,0) } });
    const context = prompt || `Completed ${tasks.length} tasks today: ${tasks.map(t => t.title).join(', ')}`;

    const result = await aiService.reflectionAgent(context);
    await saveHistory(req.user._id, 'reflection', context.slice(0, 200), result);
    res.json({ result, reflection: result, agent: 'reflection' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured.' });
    next(err);
  }
};

exports.habitInsight = async (req, res, next) => {
  try {
    const { habits } = req.body;
    const result = await aiService.habitAgent(habits || 'No habits tracked yet.');
    res.json({ insight: result, agent: 'habit' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured.' });
    next(err);
  }
};

exports.voice = async (req, res, next) => {
  try {
    const { command } = req.body;
    if (!command?.trim()) return res.status(400).json({ message: 'Voice command required.' });

    const response = await aiService.voiceAgent(command);
    await saveHistory(req.user._id, 'voice', command, response);
    res.json({ response, agent: 'voice' });
  } catch (err) {
    if (err.message?.includes('API_KEY')) return res.status(503).json({ message: 'AI service not configured.' });
    next(err);
  }
};

exports.suggestion = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id, completed: false }).limit(5);
    const context = tasks.length ? `User has ${tasks.length} pending tasks including: ${tasks.slice(0,3).map(t => t.title).join(', ')}` : 'New user just starting';

    const suggestion = await aiService.quickSuggestion(context);
    res.json({ suggestion });
  } catch (err) {
    res.json({ suggestion: 'Focus on your most important task first. Avoid multitasking and use 25-minute focused work blocks for best results.' });
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await AIHistory.find({ user: req.user._id }).sort('-createdAt').limit(20);
    res.json(history);
  } catch (err) { next(err); }
};
