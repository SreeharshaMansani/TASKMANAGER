const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('./fetchuser');
const TeamTask = require('../models/TeamTask');
const User = require('../models/User');

// ROUTE 1: Create a team task - POST "/api/teamtasks/createtask"
router.post('/createtask', fetchuser, [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().toDate().withMessage('Valid due date is required'),
  body('assignedTo').optional().isArray().withMessage('assignedTo must be an array'),
  body('assignedTo.*').isEmail().withMessage('Each assignedTo must be a valid email'),
  body('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),
  body('category').optional().isIn(['Personal', 'Work', 'Study']).withMessage('Category must be Personal, Work, or Study'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
  body('steps').optional().isArray().withMessage('Steps must be an array'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array().map(err => err.msg) });
  }

  const { title, description, assignedTo, startDate, dueDate, priority, category, status, sections, steps } = req.body;

  try {
    const validdueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(validdueDate);
    checkDate.setHours(23, 59, 59, 999);
    if (checkDate < today) {
      return res.status(400).json({ success: false, error: "Due date must be today or in the future" });
    }

    let assignedToIds = [];
    if (assignedTo && assignedTo.length > 0) {
      const assignedUsers = await User.find({
        email: { $in: assignedTo.map(email => email.toLowerCase()) }
      });

      const foundEmails = assignedUsers.map(user => user.email);
      const missingEmails = assignedTo.filter(email => !foundEmails.includes(email.toLowerCase()));

      if (missingEmails.length > 0) {
        return res.status(400).json({ success: false, error: `These emails are not registered: ${missingEmails.join(', ')}` });
      }

      assignedToIds = assignedUsers.map(user => user._id);
    }

    const newTask = new TeamTask({
      title,
      description,
      assignedTo: assignedToIds,
      startDate: startDate ? new Date(startDate) : new Date(),
      dueDate,
      priority: priority || 'Medium',
      category: category || 'Personal',
      status: status || 'Pending',
      sections: sections || [],
      steps: steps || [],
      createdBy: req.user.id
    });

    const savedTask = await newTask.save();
    res.status(201).json({ success: true, task: savedTask });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// ROUTE 2: Get all tasks related to user - GET "/api/teamtasks/fetchtasks"
router.get('/fetchtasks', fetchuser, async (req, res) => {
  try {
    const tasks = await TeamTask.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    }).populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// ROUTE 3: Update a task - PUT "/api/teamtasks/updatetask/:id"
// PUT: Update a task
router.put('/updatetask/:id', fetchuser, [
  body('title').optional().notEmpty(),
  body('description').optional(),
  body('assignedTo').optional().isArray().withMessage('assignedTo must be an array'),
  body('assignedTo.*').optional().isEmail().withMessage('Invalid email in assignedTo'),
  body('addUsers').optional().isArray().withMessage('addUsers must be an array'),
  body('addUsers.*').optional().isEmail().withMessage('Invalid email in addUsers'),
  body('removeUsers').optional().isArray().withMessage('removeUsers must be an array'),
  body('removeUsers.*').optional().isEmail().withMessage('Invalid email in removeUsers'),
  body('startDate').optional().isISO8601().toDate(),
  body('dueDate').optional().isISO8601().toDate().withMessage('Valid due date is required'),
  body('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),
  body('category').optional().isIn(['Personal', 'Work', 'Study']).withMessage('Category must be Personal, Work, or Study'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
  body('steps').optional().isArray().withMessage('Steps must be an array'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array().map(e => e.msg) });
  }

  const { title, description, assignedTo, addUsers, removeUsers, startDate, dueDate, priority, category, status, sections, steps } = req.body;

  try {
    const task = await TeamTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not allowed to update this task" });
    }

    // Check for conflicting parameters
    if (assignedTo && (addUsers || removeUsers)) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot use assignedTo with addUsers or removeUsers in the same request" 
      });
    }

    // Validate dates
    const newStartDate = startDate !== undefined ? startDate : task.startDate;
    const newDueDate = dueDate !== undefined ? dueDate : task.dueDate;
    if (newStartDate && newDueDate && newDueDate < newStartDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Due date must be after start date' 
      });
    }

    // Check dueDate is in the future (if applicable)
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Due date must be in the future' 
      });
    }

    // Prepare update object
    const dbUpdate = {};

    // Handle simple fields
    if (title !== undefined) dbUpdate.title = title;
    if (description !== undefined) dbUpdate.description = description;
    if (startDate !== undefined) dbUpdate.startDate = startDate;
    if (dueDate !== undefined) dbUpdate.dueDate = dueDate;
    if (priority !== undefined) dbUpdate.priority = priority;
    if (category !== undefined) dbUpdate.category = category;
    if (status !== undefined) dbUpdate.status = status;
    if (sections !== undefined) dbUpdate.sections = sections;
    if (steps !== undefined) dbUpdate.steps = steps;

    // Process assignedTo (replace)
    if (assignedTo !== undefined) {
      const emails = assignedTo.map(e => e.toLowerCase());
      const users = await User.find({ email: { $in: emails } });
      const foundEmails = users.map(u => u.email.toLowerCase());
      const missing = assignedTo.filter(e => !foundEmails.includes(e.toLowerCase()));
      if (missing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Emails not found: ${missing.join(', ')}` 
        });
      }
      dbUpdate.assignedTo = users.map(u => u._id);
    }

    // Process addUsers (add to existing)
    let addUserIds = [];
    if (addUsers?.length > 0) {
      const emails = addUsers.map(e => e.toLowerCase());
      const users = await User.find({ email: { $in: emails } });
      const foundEmails = users.map(u => u.email.toLowerCase());
      const missing = addUsers.filter(e => !foundEmails.includes(e.toLowerCase()));
      if (missing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Emails not found in addUsers: ${missing.join(', ')}` 
        });
      }
      addUserIds = users.map(u => u._id);
    }

    // Process removeUsers (remove from existing)
    let removeUserIds = [];
    if (removeUsers?.length > 0) {
      const emails = removeUsers.map(e => e.toLowerCase());
      const users = await User.find({ email: { $in: emails } });
      const foundEmails = users.map(u => u.email.toLowerCase());
      const missing = removeUsers.filter(e => !foundEmails.includes(e.toLowerCase()));
      if (missing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Emails not found in removeUsers: ${missing.join(', ')}` 
        });
      }
      removeUserIds = users.map(u => u._id);
    }

    // Build MongoDB update operators
    const updateOperators = {};
    if (Object.keys(dbUpdate).length > 0) {
      updateOperators.$set = dbUpdate;
    }
    if (addUserIds.length > 0) {
      updateOperators.$addToSet = { assignedTo: { $each: addUserIds } };
    }
    if (removeUserIds.length > 0) {
      updateOperators.$pull = { assignedTo: { $in: removeUserIds } };
    }

    // Apply all updates in a single operation
    const updatedTask = await TeamTask.findByIdAndUpdate(
      req.params.id,
      updateOperators,
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Task updated', updatedTask });

  } catch (err) {
    console.error('Error in updateTask route:', err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// ROUTE 4: Delete a task - DELETE "/api/teamtasks/deletetask/:id"
router.delete('/deletetask/:id', fetchuser, async (req, res) => {
  try {
    const task = await TeamTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not allowed to delete this task" });
    }

    await TeamTask.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Task deleted successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
