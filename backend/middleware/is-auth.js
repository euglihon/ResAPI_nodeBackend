const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization"); // frontend request Authorization header

  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];

  let decodedToken;

  try {
    // decoding token
    decodedToken = jwt.verify(token, "test-secret-token-key");
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated !");
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
