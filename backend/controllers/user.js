const User = require("../models/user");
const { validationResult } = require("express-validator/check");

const bcryptjs = require("bcryptjs");

exports.signup = (req, res, next) => {
  // validation block
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error = new Error("Validation failed !!");
    error.statusCode = 422;
    throw error;
  }

  // request params
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  // hashing password and create new user
  bcryptjs
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      });
      return user.save();
    })
    .then((createdUser) => {
      return res
        .status(201)
        .json({ message: "User created", userId: createdUser._id });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
