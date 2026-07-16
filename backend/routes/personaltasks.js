const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('./fetchuser');
const Data = require('../models/PersonalTask');

// ROUTE 1: Create a new task | POST "/api/tasks/createtask"
router.post('/createtask', fetchuser, [
  body('title', 'Title is required').isLength({ min: 1 }),
  body('description', 'Description is required').isLength({ min: 1 }),
  body('dueDate', 'Valid due date is required').isISO8601().toDate(),
  body('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Priority must be High, Medium, or Low'),
  body('category').optional().isIn(['Personal', 'Work', 'Study']).withMessage('Category must be Personal, Work, or Study'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
  body('steps').optional().isArray().withMessage('Steps must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => err.msg),
      });
    }

    const { title, description, dueDate, priority, category, status, sections, steps, startDate } = req.body;
    const validdueDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(validdueDate);
    checkDate.setHours(23, 59, 59, 999);
    if (checkDate < today) { 
      return res.status(400).json({ 
        success: false, 
        error: "Due date must be today or in the future" 
      });
    }
    const data = new Data({
      title,
      description,
      startDate: startDate ? new Date(startDate) : new Date(),
      dueDate: validdueDate,
      priority: priority || 'Medium',
      category: category || 'Personal',
      status: status || 'Pending',
      sections: sections || [],
      steps: steps || [],
      user: req.user.id,
    });

    const savedData = await data.save();
    res.status(201).json(savedData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


// ROUTE 2: Get all personal tasks | GET "/api/tasks/fetchtasks"
router.get('/fetchtasks', fetchuser, async (req, res) => {
  try {
    const datas = await Data.find({ user: req.user.id });
    res.status(200).json(datas);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 3: Update a task | PUT "/api/tasks/updatetask/:id"
router.put('/updatetask/:id', fetchuser, async (req, res) => {
  const { title, description, dueDate, priority, category, status, sections, steps, startDate } = req.body;

  try {
    const newData = {};
    if (title !== undefined) newData.title = title;
    if (description !== undefined) newData.description = description;
    if (dueDate !== undefined) {
      const validdueDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(validdueDate);
      checkDate.setHours(23, 59, 59, 999);
      if (checkDate < today) {
        return res.status(400).json({
          success: false,
          error: "Due date must be today or in the future"
        });
      }
      newData.dueDate = validdueDate;
    }
    if (startDate !== undefined) newData.startDate = startDate;
    if (priority !== undefined) newData.priority = priority;
    if (category !== undefined) newData.category = category;
    if (status !== undefined) newData.status = status;
    if (sections !== undefined) newData.sections = sections;
    if (steps !== undefined) newData.steps = steps;

    let data = await Data.findById(req.params.id);
    if (!data) return res.status(404).send("Task Not Found");

    if (data.user.toString() !== req.user.id) {
      return res.status(403).send("Access Denied");
    }

    data = await Data.findByIdAndUpdate(req.params.id, { $set: newData }, { new: true });
    res.status(200).json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Delete a task | DELETE "/api/tasks/deletetask/:id"
router.delete('/deletetask/:id', fetchuser, async (req, res) => {
  try {
    let data = await Data.findById(req.params.id);
    if (!data) return res.status(404).send("Task Not Found");

    if (data.user.toString() !== req.user.id) {
      return res.status(403).send("Access Denied");
    }

    await Data.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: "Task has been deleted", data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
