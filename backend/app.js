const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const env = require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const userRoutes = require("./routes/user");

const app = express();

// upload file storage and filter
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// parser configuration
app.use(bodyParser.json()); //application/json parser
app.use(
  // upload file
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images"))); // image parser

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
app.use("/auth", userRoutes);

// error handing
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// connect mongoDB server
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_MONGO_USER}:${process.env.DB_MONGO_PASSWORD}@cluster0.9uqk2.mongodb.net/${process.env.DB_MONGO_DATABASE}`
  )
  .then(() => app.listen(8080)) // start app
  .catch((error) => console.log(error));
