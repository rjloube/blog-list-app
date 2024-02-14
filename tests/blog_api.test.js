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

describe("when there is initially some blogs saved", () => {
  test("the correct amount of blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
  test("the unique identifier property of the blog posts is named id", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });
});

describe("addition of a new blog", () => {
  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "Test blog",
      author: "Mike Rotch",
      url: "http://www.testblog.com",
      likes: 0,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    const title = response.body.map((r) => r.title);
    const author = response.body.map((r) => r.author);
    const url = response.body.map((r) => r.url);
    const likes = response.body.map((r) => r.likes);

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
    expect(title).toContain("Test blog");
    expect(author).toContain("Mike Rotch");
    expect(url).toContain("http://www.testblog.com");
    expect(likes).toContain(0);
  });
  test("if the likes property is missing from the request, it will default to 0", async () => {
    const newBlog = {
      title: "Another One",
      author: "DJ Khaled",
      url: "http://www.anotherone.com",
    };

    const response = await api.post("/api/blogs").send(newBlog);
    expect(response.body.likes).toBe(0);
  }),
    test("if the title and url properties are missing from the request data, the backend responds with a 400 Bad Request status code", async () => {
      const newBlog = {
        author: "Ben Dover",
        likes: 88,
      };

      await api.post("/api/blogs").send(newBlog).expect(400);
    });
});

describe("deletion of a blog", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test("succeeds with status code of 204 even if id is invalid", async () => {
    const validNonexistingId = await helper.nonExistingId();
    console.log("validNonexistingId", validNonexistingId);
    await api.delete(`/api/blogs/${validNonexistingId}`).expect(204);
  });
});

describe("updating a blog", () => {
  test("succeeds with status code 200 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlog = helper.updatedBlog;

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog);

    expect(response.status).toBe(200);
    delete response.body.id;
    expect(response.body).toEqual(updatedBlog);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test("fails with status code 404 if id does not exist", async () => {
    const validNonexistingId = await helper.nonExistingId();
    const updatedBlog = helper.updatedBlog;

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedBlog)
      .expect(404);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const invalidId = "xxxa3d5da59070081a82a3445xxx";
    const updatedBlog = helper.updatedBlog;

    await api.put(`/api/blogs/${invalidId}`).send(updatedBlog).expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
