const { Habit, Analytics } = require('../models/Other')
const Task = require('../models/Task')

// ── Habits ────────────────────────────────────────────────────────────────
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, active: true }).sort(
      'createdAt'
    )
    res.json(habits)
  } catch (err) {
    next(err)
  }
}

exports.createHabit = async (req, res, next) => {
  try {
    const { name, icon, color, target, unit, frequency } = req.body
    if (!name?.trim())
      return res.status(400).json({ message: 'Name required.' })

    const habit = await Habit.create({
      user: req.user._id,
      name: name.trim(),
      icon,
      color,
      target,
      unit,
      frequency
    })
    res.status(201).json(habit)
  } catch (err) {
    next(err)
  }
}

exports.toggleHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    if (!habit) return res.status(404).json({ message: 'Habit not found.' })

    const today = new Date().toDateString()
    habit.completedToday = !habit.completedToday

    if (habit.completedToday) {
      habit.streak += 1
      habit.longestStreak = Math.max(habit.longestStreak, habit.streak)
      habit.logs.push({
        date: new Date(),
        completed: true,
        value: habit.target
      })
    } else {
      habit.streak = Math.max(0, habit.streak - 1)
    }

    await habit.save()
    res.json(habit)
  } catch (err) {
    next(err)
  }
}

exports.deleteHabit = async (req, res, next) => {
  try {
    await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { active: false }
    )
    res.json({ message: 'Habit removed.' })
  } catch (err) {
    next(err)
  }
}

// ── Analytics ─────────────────────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const [allTasks, weekTasks, recentCompleted] = await Promise.all([
      Task.find({ user: userId }),
      Task.find({ user: userId, createdAt: { $gte: weekAgo } }),
      Task.find({
        user: userId,
        completed: true,
        completedAt: { $gte: weekAgo }
      })
    ])

    // Build weekly data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weeklyData = days.map((day, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      const dayTasks = weekTasks.filter(
        t => new Date(t.createdAt).toDateString() === date.toDateString()
      )
      return {
        day,
        completed: dayTasks.filter(t => t.completed).length,
        focus: dayTasks.length * 2
      }
    })

    // Category distribution
    const categories = allTasks.reduce((acc, t) => {
      acc[t.category || 'Other'] = (acc[t.category || 'Other'] || 0) + 1
      return acc
    }, {})

    const tasksWithDeadline = allTasks.filter(task => task.deadline)

    const completedTasks = allTasks.filter(t => t.completed).length

    const completionRate =
      allTasks.length === 0
        ? 0
        : Math.round((completedTasks / allTasks.length) * 100)
    const completedOnTime = tasksWithDeadline.filter(task => {
      return (
        task.completed &&
        task.completedAt &&
        new Date(task.completedAt) <= new Date(task.deadline)
      )
    })
    const onTimeRate =
      tasksWithDeadline.length === 0
        ? 0
        : Math.round((completedOnTime.length / tasksWithDeadline.length) * 100)
    const habits = await Habit.find({
      user: userId,
      active: true
    })

    const streak = habits.reduce((max, habit) => {
      return Math.max(max, habit.streak)
    }, 0)

    const productivityScore = Math.min(
      100,
      Math.round(completionRate * 0.5 + onTimeRate * 0.3 + Math.min(streak, 20))
    )

    const todayTasks = allTasks.filter(
      task => new Date(task.createdAt).toDateString() === now.toDateString()
    )

    const pendingTasks = allTasks.filter(task => !task.completed)

    const focusHours = weeklyData.reduce((sum, day) => sum + day.focus, 0)

    const averagePerDay = Number((allTasks.length / 7).toFixed(1))

    const priority = {
      critical: allTasks.filter(t => t.priority === 'critical').length,
      high: allTasks.filter(t => t.priority === 'high').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      low: allTasks.filter(t => t.priority === 'low').length
    }

    res.json({
      totalTasks: allTasks.length,
      todayTasks: todayTasks.length,
      pendingTasks: pendingTasks.length,
      completedTasks,

      completionRate,
      onTimeRate,
      streak,
      productivityScore,

      focusHours,
      averagePerDay,

      weeklyData,
      priority,
      categories
    })
  } catch (err) {
    next(err)
  }
}

exports.getWeekly = async (req, res, next) => {
  try {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const tasks = await Task.find({
      user: req.user._id,
      createdAt: { $gte: weekAgo }
    })

    const data = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))

      const dayTasks = tasks.filter(
        t => new Date(t.createdAt).toDateString() === date.toDateString()
      )

      return {
        date: date.toISOString().split('T')[0],
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length,
        pending: dayTasks.filter(t => !t.completed).length,
        critical: dayTasks.filter(t => t.priority === 'critical').length,
        focus: dayTasks.length * 2
      }
    })

    res.json(data)
  } catch (err) {
    next(err)
  }
}
