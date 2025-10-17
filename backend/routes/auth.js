const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const fetchuser = require("./fetchuser");
const PersonalTask = require('../models/PersonalTask');

const JWT_SECRET = "hkjjcbcja"; 


//http://localhost:5000/api/auth/createuser
router.post('/createuser', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password length should be at least 5').isLength({ min: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    let user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const data = {
      user: {
        id: user.id,
      }
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success:true,response:"user created successfully",authtoken:authtoken});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

//http://localhost:5000/api/auth/login
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password length should be at least 1').isLength({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  let success = false;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const data = {
      user: {
        id: user.id,
      }
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ authtoken, success });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//http://localhost:5000/api/auth/deleteuser
router.delete('/deleteuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    await User.deleteOne({ _id: userId });
    await PersonalTask.deleteMany({ user: userId });

    res.json({ success: true, message: "User and associated personal tasks deleted." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
