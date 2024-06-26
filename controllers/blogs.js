const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const middleware = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", middleware.extractUser, async (request, response) => {
  const body = request.body;

  const user = request.user;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog.id);
  await user.save();
  console.log('savedBlog', savedBlog);

  const populatedBlog = await savedBlog.populate("user", { name: 1 });
  console.log('populatedBlog', populatedBlog);

  response.status(201).json(savedBlog);
});

blogsRouter.delete(
  "/:id",
  middleware.extractUser,
  async (request, response) => {
    const blogToDelete = await Blog.findById(request.params.id);
    if (!blogToDelete) {
      return response.status(404).json({ error: "blog not found" });
    }
    console.log("blogToDelete.user.toString()", blogToDelete.user.toString());
    console.log("request.user.id", request.user.id);
    if (blogToDelete.user.toString() === request.user.id.toString()) {
      await Blog.findByIdAndRemove(request.params.id);
      response.status(204).end();
    } else {
      response.status(401).json({ error: "unauthorized" });
    }
  }
);

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;
  console.log("request.body", request.body);
  const updatedBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  console.log("request.params.id", request.params.id);
  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, {
    new: true,
  });
  const populatedBlog = await result.populate("user", { name: 1 });
  console.log("populatedBlog", populatedBlog);
  result ? response.json(populatedBlog) : response.status(404).end();
});

module.exports = blogsRouter;
