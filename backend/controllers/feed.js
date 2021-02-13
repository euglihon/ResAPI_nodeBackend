exports.getPosts = (req, res) => {
  res.status(200).json({
    posts: [
      {
        title: "First title",
        content: "First content",
      },
    ],
  });
};

exports.postPost = (req, res) => {
  // post requests
  const title = req.body.title;
  const content = req.body.content;

  res.status(201).json({
    message: "Post created !",
    post: {
      id: "9999",
      title: title,
      content: content,
    },
  });
};
