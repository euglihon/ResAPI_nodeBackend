const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const User = require("../models/user");

const clearImage = (filePathName) => {
  // delete old images
  const filePath = path.join(__dirname, "..", filePathName);
  fs.unlink(filePath, (error) => console.log(error)); // delete image file
};

exports.getPosts = (req, res, next) => {
  // pagination param
  const currentPage = req.query.page || 1; // query get param
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts success !!",
        posts: posts,
        totalItems: totalItems,
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

  let creator;

  //create new post
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created !",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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

      // user not authorized
      if (post.creator.toString() !== req.userId) {
        const Error = new Error("Not authorized !");
        error.statusCode = 403;
        throw error;
      }

      // delete old image file
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = updateTitle;
      post.content = updateContent;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((savedPost) => {
      res.status(200).json({
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

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId; //get param

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post !");
        error.statusCode = 404;
        throw error;
      }

      // user not authorized
      if (post.creator.toString() !== req.userId) {
        const Error = new Error("Not authorized !");
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Post deleted !",
      });
    })

    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
