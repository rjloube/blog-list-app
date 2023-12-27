const express = require("express");
const cors = require("cors");
const Blog = require("./models/blog");
const config = require("./utils/config");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/blogs", (request, response, next) => {
  Blog.find({})
    .then((blogs) => {
      response.json(blogs);
    })
    .catch((error) => next(error));
});

app.post("/api/blogs", (request, response, next) => {
  const blog = new Blog(request.body);

  blog
    .save()
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "SyntaxError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

module.exports = app;
