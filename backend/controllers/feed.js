const { validationResult } = require("express-validator/check");

exports.getPosts = (req, res) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First title",
        content: "First content",
        imageURL: "images/test.png",
        creator: {
          name: "TestUSer",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postPost = (req, res) => {
  // validation block
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: validationErrors.array() });
  }

  // post requests
  const title = req.body.title;
  const content = req.body.content;

  res.status(201).json({
    message: "Post created !",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: {
        name: "TestUser",
      },
      createdAt: new Date(),
    },
  });
};
