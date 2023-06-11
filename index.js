import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
const JWT_SECRET = "9c4b4adca110ea8f13944dd518a88018b7b82d0b4be5d61bc54f6465b3d55bb3";

import { addToDo, addUser, deleteAllToDos, getUsersToDos, logInUser, removeToDo, updateToDo } from "./db/index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
  if (req.path === "/login" || req.path === "/register") {
    next();
  } else {
    verifyToken(req, res, next);
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("missing header");
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("missing token");
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error("Unauthirized");
      } else {
        next();
      }
    });
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

app.post("/register", async function (req, res) {
  const { name, email, password } = req.body;
  const token = jwt.sign({ password }, JWT_SECRET);
  const newUser = await addUser({ name, email, token });
  res.send(newUser);
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;
  const token = jwt.sign({ password }, JWT_SECRET);
  const user = await logInUser({ email, token });
  if (!user.token) {
    res.send({ error: "no such user" });
    return;
  }
  const decodedPassFromDb = jwt.verify(user.token, JWT_SECRET).password;
  const decodedPass = jwt.verify(token, JWT_SECRET).password;
  if (decodedPassFromDb === decodedPass) {
    res.send({ authorized: true, email: user.email, name: user.name, token: user.token });
  } else {
    res.send({ authorized: false });
  }
});

app.post("/todos", async function (req, res) {
  const toDos = await getUsersToDos(req.body.email);
  res.send(toDos);
});
app.delete("/todos", async function (req, res) {
  const toDos = await deleteAllToDos(req.body.email);
  res.send(toDos);
});
app.post("/todo", async function (req, res) {
  const addedToDo = await addToDo(req.body.toDoInfo);
  res.send(addedToDo);
});
app.put("/todo", async function (req, res) {
  updateToDo(req.body._id);
  res.send(req.body);
});
app.delete("/todo", async function (req, res) {
  const message = await removeToDo(req.body._id);
  res.send(message);
});
app.get("/", async function (req, res) {
  res.send("it is working");
});

app.listen(3001, () => {
  console.log("server was started!");
});

export default app;
