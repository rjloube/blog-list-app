const bcrypt = require("bcrypt");
const User = require("../models/user");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash("sekret", 10);
  const user = new User({ username: "root", passwordHash });
  await user.save();
});

describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    console.log("usersAtEnd", usersAtEnd, typeof usersAtEnd);
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("username must be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("creation fails with proper statuscode and message if username or password is missing or too short", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser1 = {
      username: "user1",
      name: "User One",
      password: "pw",
    };

    const newUser2 = {
      username: "",
      name: "User Two",
      password: "password",
    };

    const newUser3 = {
      username: "user3",
      name: "User Three",
      password: "",
    };

    const result1 = await api
      .post("/api/users")
      .send(newUser1)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result1.body.error).toContain(
      "username and password must be at least 3 characters long"
    );

    const result2 = await api
      .post("/api/users")
      .send(newUser2)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result2.body.error).toContain(
      "username and password must be at least 3 characters long"
    );

    const result3 = await api
      .post("/api/users")
      .send(newUser3)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result3.body.error).toContain(
      "username and password must be at least 3 characters long"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});
