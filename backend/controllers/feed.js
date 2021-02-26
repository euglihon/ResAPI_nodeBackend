const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const socketIo = require("../socket");

const Post = require("../models/post");
const User = require("../models/user");

const clearImage = (filePathName) => {
  // delete old images
  const filePath = path.join(__dirname, "..", filePathName);
  fs.unlink(filePath, (error) => console.log(error)); // delete image file
};

exports.getPosts = async (req, res, next) => {
  // pagination param
  const currentPage = req.query.page || 1; // query get param
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched posts success !!",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.postPost = async (req, res, next) => {
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
    creator: req.userId,
  });

  try {
    await post.save();

    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    // add socket.io message
    socketIo.getIO().emit("posts", {
      action: "create",
      post: {
        ...post._doc,
        creator: {
          _id: req.userId,
          name: user.name,
        },
      },
    });

    res.status(201).json({
      message: "Post created !",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId; // get param

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("could not find post!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "post fetched",
      post: post,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await (await Post.findById(postId)).populate("creator");
    if (!post) {
      const error = new Error("Could not find post !");
      error.statusCode = 404;
      throw error;
    }
    // user not authorized
    if (post.creator._id.toString() !== req.userId) {
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

    const result = await post.save();

    // add socket.io message
    socketIo.getIO().emit("posts", {
      action: "update",
      post: result,
    });

    res.status(200).json({
      message: "Post updated!",
      post: result,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId; //get param

  try {
    const post = await Post.findById(postId);
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
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();

    socketIo.getIO().emit("posts", {
      action: "delete",
      post: postId,
    });

    res.status(200).json({
      message: "Post deleted !",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
