const router = require("express").Router();
const { body } = require("express-validator/check");

const feedControllers = require("../controllers/feed");

// GET /feed/posts
router.get("/posts", feedControllers.getPosts);

// POST /feed/post
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedControllers.postPost
);

// GET /feed/post/:postId
router.get("/post/:postId", feedControllers.getPost);

// PUT /post/:postId - delete post
router.put("/post/:postId");

module.exports = router;
