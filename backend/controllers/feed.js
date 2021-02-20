const { validationResult } = require("express-validator/check");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts success !!",
        posts: posts,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.postPost = (req, res, next) => {
  // validation block
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error = new Error("Validation failed !!");
    error.statusCode = 422;
    throw error;
  }

  // request multer image file
  if (!req.file) {
    const error = new Error("No image provided !!");
    error.statusCode = 422;
    throw error;
  }

  // post requests
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;

  //create new post
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: {
      name: "TestUser",
    },
  });
  post
    .save()
    .then((resultPost) => {
      res.status(201).json({
        message: "Post created !",
        post: resultPost,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId; // get param

  // find post
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post !");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: "post fetched",
        post: post,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updatePost = (req, res, next) => {
  // validation block
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error = new Error("Validation failed !!");
    error.statusCode = 422;
    throw error;
  }

  // request get param
  const postId = req.params.postId;
  // request params
  const updateTitle = req.body.title;
  const updateContent = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No image file picked");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post !");
        error.statusCode = 404;
        throw error;
      }
      post.title = updateTitle;
      post.content = updateContent;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((savedPost) => {
      res.statusCode(200).json({
        message: "Post updated!",
        post: savedPost,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
