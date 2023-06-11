// yH9uW5qmMe7kEZdJ

import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://poladikksp:yH9uW5qmMe7kEZdJ@to-do-list-project.jasndba.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function addUser(userInfo) {
  try {
    await client.connect();
    const db = await client.db("users");
    const usersCollection = await db.collection("usersList");
    const isUserExist = await usersCollection.findOne({ email: userInfo.email });
    if (isUserExist) {
      return { userExists: true, userInfo: isUserExist };
    }
    const { insertedId } = await usersCollection.insertOne(userInfo);
    const newUser = await usersCollection.findOne({ _id: insertedId });
    return { userCreated: true, userInfo: newUser };
  } finally {
    await client.close();
  }
}

export async function logInUser(userInfo) {
  try {
    await client.connect();
    const db = await client.db("users");
    const usersCollection = await db.collection("usersList");
    const user = await usersCollection.findOne({ email: userInfo.email });
    if (user) {
      return { email: user.email, name: user.name, token: user.token };
    }
    return { token: undefined };
  } finally {
    await client.close();
  }
}

export async function getUsersToDos(userEmail) {
  try {
    await client.connect();
    const db = await client.db("users");
    const toDosCollection = await db.collection("toDos");
    const toDos = await toDosCollection.find({ email: userEmail }).toArray();
    return toDos;
  } finally {
    await client.close();
  }
}
export async function addToDo(toDo) {
  try {
    await client.connect();
    const db = await client.db("users");
    const toDosCollection = await db.collection("toDos");
    const { insertedId } = await toDosCollection.insertOne(toDo);
    const newTodo = await toDosCollection.findOne({ _id: insertedId });
    return newTodo;
  } finally {
    await client.close();
  }
}
export async function removeToDo(toDoId) {
  try {
    await client.connect();
    const db = await client.db("users");
    const toDosCollection = await db.collection("toDos");
    await toDosCollection.deleteOne({ _id: new ObjectId(toDoId) });
    return "success";
  } finally {
    await client.close();
  }
}
export async function updateToDo(toDoId) {
  try {
    await client.connect();
    const db = await client.db("users");
    const toDosCollection = await db.collection("toDos");
    const toDo = await toDosCollection.findOne({ _id: new ObjectId(toDoId) });
    toDo.done = !toDo.done;
    await toDosCollection.findOneAndReplace({ _id: new ObjectId(toDoId) }, toDo);
    console.log(toDo);

    return "success";
  } finally {
    await client.close();
  }
}
export async function deleteAllToDos(userEmail) {
  try {
    await client.connect();
    const db = await client.db("users");
    const toDosCollection = await db.collection("toDos");
    const toDos = await toDosCollection.deleteMany({ email: userEmail });
    return toDos;
  } finally {
    await client.close();
  }
}
