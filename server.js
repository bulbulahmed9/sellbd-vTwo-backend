const express = require("express");
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

// initialize app
const app = express();

// connect DB
const connectDB = require('./config/db')
connectDB();


// initialize middleware
app.use(express.json({extended: true}))
app.use(cors())
app.use(morgan("dev"))

// base route
app.get("/", (req, res) => res.json({ message: "Working" }));

// others routes
app.use("/", require("./routes/userRoutes"))

// Error Handling
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res
    .status(error.status || 500)
    .json({ message: error.message || "Something went wrong" });
});

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
