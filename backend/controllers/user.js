const User = require("../models/user");
const { validationResult } = require("express-validator/check");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

exports.login = (req, res, next) => {
  // request params
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("User could not be found");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcryptjs.compare(password, user.password);
    })

    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "test-secret-token-key",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })

    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
