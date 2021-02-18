const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const env = require("dotenv").config();
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

// parser configuration
app.use(bodyParser.json()); //application/json parser
app.use("/images", express.static(path.join(__dirname, "images")));

// add http headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// add Routes
app.use("/feed", feedRoutes);

// error handing
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

// connect mongoDB server
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_MONGO_USER}:${process.env.DB_MONGO_PASSWORD}@cluster0.9uqk2.mongodb.net/${process.env.DB_MONGO_DATABASE}`
  )
  .then(() => app.listen(8000)) // start app
  .catch((error) => console.log(error));
