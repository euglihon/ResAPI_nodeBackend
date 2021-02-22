const router = require("express").Router();
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");

const feedControllers = require("../controllers/feed");

// GET /feed/posts
router.get("/posts", isAuth, feedControllers.getPosts);

// POST /feed/post
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedControllers.postPost
);

// GET /feed/post/:postId
router.get("/post/:postId", isAuth, feedControllers.getPost);

// PUT /feed/post/:postId - update post route
router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedControllers.updatePost
);

// DELETE /feed/post/:postId - delete post route
router.delete("/post/:postId", isAuth, feedControllers.deletePost);

module.exports = router;
