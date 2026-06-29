const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const { priority, category, completed, search, sort = '-createdAt', page = 1, limit = 50 } = req.query;
    const filter = { user: req.user._id };

    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;
    if (completed !== undefined) filter.completed = completed === 'true';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({ tasks, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, deadline, estimatedTime, labels, subtasks, notes, recurring } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required.' });

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description, priority, category,
      deadline: deadline ? new Date(deadline) : undefined,
      estimatedTime: estimatedTime ? parseFloat(estimatedTime) : undefined,
      labels: labels || [],
      subtasks: subtasks || [],
      notes, recurring,
    });

    res.status(201).json(task);
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const allowedFields = ['title', 'description', 'priority', 'category', 'deadline', 'estimatedTime', 'actualTime', 'labels', 'subtasks', 'notes', 'completed', 'status', 'recurring'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'deadline') task[field] = req.body[field] ? new Date(req.body[field]) : undefined;
        else task[field] = req.body[field];
      }
    });

    await task.save();
    res.json(task);
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.', id: req.params.id });
  } catch (err) { next(err); }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { ids, updates } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'Task IDs required.' });

    await Task.updateMany({ _id: { $in: ids }, user: req.user._id }, { $set: updates });
    res.json({ message: `${ids.length} tasks updated.` });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, completed, critical, today] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, completed: true }),
      Task.countDocuments({ user: userId, priority: 'critical', completed: false }),
      Task.countDocuments({
        user: userId,
        deadline: { $gte: new Date().setHours(0,0,0,0), $lt: new Date().setHours(23,59,59,999) },
      }),
    ]);

    res.json({ total, completed, critical, today, completionRate: total ? Math.round(completed/total*100) : 0 });
  } catch (err) { next(err); }
};
