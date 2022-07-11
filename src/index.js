const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const username = req.headers.username;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  req.username = username;

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ error: "Nome ou Username inválidos!" });
  }

  const alreadyExistsUser = users.find((user) => user.username === username);

  if (alreadyExistsUser) {
    return res.status(400).json({ error: "Usuário já existe" });
  }

  const userObject = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: [],
  };

  users.push(userObject);

  return res.status(201).json(userObject);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { username } = req;

  const user = users.filter((user) => user.username === username);

  res.json(user[0].todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { username } = req;

  const user = users.filter((user) => user.username === username);

  const todoValues = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user[0].todos.push(todoValues);

  return res.status(201).json(todoValues);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const id = req.params.id;
  const { username } = req;
  const { title, deadline } = req.body;

  const user = users.filter((user) => user.username === username);

  const todo = user[0].todos.filter((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo inexistente" });
  }

  todo[0].title = title;
  todo[0].deadline = deadline;

  const newTodo = {
    deadline: todo[0].deadline,
    done: todo[0].done,
    title: todo[0].title,
  };

  return res.status(201).json(newTodo);
});

app.patch("/todos/:id/true", checksExistsUserAccount, (req, res) => {
  console.log("aaaa");
  const id = req.params.id;
  const { username } = req;

  const user = users.filter((user) => user.username === username);

  const todo = user[0].todos.filter((todo) => todo.id === id);
  todo[0].done = true;

  console.log(todo);

  return res.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const id = req.params.id;
  const { username } = req;

  const user = users.filter((user) => user.username === username);

  const todo = user[0].todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Usuário não existe!" });
  }

  user[0].todos = todo;

  return res.sendStatus(204);
});

module.exports = app;
