const fs = require('fs');
const path = require('path');

// Load environment variables from data.env if it exists, otherwise fall back to system environment variables
if (fs.existsSync(path.join(__dirname, 'data.env'))) {
  require('dotenv').config({ path: path.join(__dirname, 'data.env') });
} else {
  require('dotenv').config();
}
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./mongo.js");

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use('/api/personaltasks', require('./routes/personaltasks'));
app.use('/api/teamtasks', require('./routes/teamtasks'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
