const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const db = [];

const app = express();

app.use(cors());
app.use(express.json());

// const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = db.find((user) => user.username === username);

  if (user) {
    request.username = user;
    return next();
  }

  return response.status(401).send("User not found");
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const user = db.find((user) => user.username === username);

  if (user) {
    return response.status(400).send({ error: "User already created" });
  }
  const userData = { id: uuidv4(), name: name, username: username, todos: [] };
  db.push(userData);
  return response.status(201).send(userData);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  return response.status(200).send(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const id = uuidv4();
  const todoData = {
    id: id,
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  username.todos.push(todoData);
  return response.status(201).send(todoData);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const task = username.todos.find((task) => task.id === id);
  if (task) {
    task.title = title;
    task.deadline = new Date(deadline);
    return response.status(201).send(task);
  }

  return response.status(404).send({ error: "Not found" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const task = username.todos.find((task) => task.id === id);

  if (task) {
    task.done = true;
    return response.status(201).send(task);
  }
  return response.status(404).send({ error: "Not found" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const task = username.todos.find((task) => task.id === id);
  if (task) {
    username.todos.splice(task, 1);
    return response.status(204).send();
  }

  return response.status(404).send({ error: "Not found" });
});

module.exports = app;
