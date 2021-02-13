const router = require("express").Router();

const feedControllers = require("../controllers/feed");

// GET /feed/posts
router.get("/posts", feedControllers.getPosts);

// POST /feed/post
router.post("/post", feedControllers.postPost);

module.exports = router;
