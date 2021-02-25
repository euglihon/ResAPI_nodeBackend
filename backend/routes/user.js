const router = require("express").Router();
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");

const User = require("../models/user");

const userControllers = require("../controllers/user");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDocument) => {
          if (userDocument) {
            return Promise.reject("email address already exists!");
          }
        });
      })
      .normalizeEmail(),

    body("password").trim().isLength({ min: 8 }),

    body("name").trim().not().isEmpty(),
  ],

  userControllers.signup
);

router.post("/login", userControllers.login);

router.get("/status", isAuth, userControllers.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  userControllers.updateUserStatus
);

module.exports = router;
