const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");

const path = require("path");

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is deployed ...D");
    });
  } catch (error) {
    console.log(`Db Error:${error}`);
  }
};

initilizeDbAndServer();

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let selectUserQuery = `select * FROM user WHERE username=${username};`;
  let dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    let postUserQuery = `
        INSERT INTO user (username,name,password,gender,location)
        VALUES (
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}';
        )  `;

    if (password.length < 5) {
      response.status(400);
      response.send("password is too short");
    } else {
      let newUser = await db.run(postUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

module.exports = app;
