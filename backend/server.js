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


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
