const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const helper = require("./test_helper");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe(
  "api tests",
  () => {
    test("the correct amount of blogs are returned", async () => {
      const response = await api.get("/api/blogs");
      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });
  },
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  })
);

afterAll(async () => {
  await mongoose.connection.close();
});
