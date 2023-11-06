const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const cors = require("cors");
const token = require("./token.js");
const inputHandler = require("./inputHandler.js");
const { pg } = require("./dbConnect.js");
const app = express();
const port = 3001;
require("dotenv").config();

const routerPrivate = express.Router();
const routerPublic = express.Router();

const minute = 60000;
const hour = minute * 60;
const day = hour * 24;

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use("/style", express.static(path.join(__dirname, "style")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

routerPrivate.use((req, res, next) => {
  accessToken = token.authenticateAccessToken(req)
  if(!accessToken){
    res.sendStatus(401)
  }
  else {
    req.body.token = accessToken
    next()
  }
})

routerPublic.post("/auth/signup", async (req, res) => {
  const credentials = inputHandler.signupHandler(req);
  //console.log(credentials);
  if (!credentials) {
    res.sendStatus(400);
    return;
  }
  const pass = crypto
    .createHash("sha256")
    .update(credentials.password)
    .digest("hex");
  const result = pg.query(
    `SELECT id FROM users WHERE login = '${credentials.login}' OR email = '${credentials.email}'`,
    (err, result) => {
      console.log(result.rows.length == 0);
      if (result.rows.length == 0) {
        pg.query(
          `INSERT INTO users (login, email, password) VALUES ('${credentials.login}', '${credentials.email}', '${pass}') RETURNING id, login;`,
          (err, result) => {
            console.log(result.rows[0].login, result.rows[0].id);
            const refreshToken = token.generateRefreshToken(
              result.rows[0].id,
              result.rows[0].login
            );
            const accessToken = token.generateAccessToken(
              result.rows[0].id,
              result.rows[0].login
            );
            pg.query(`UPDATE users SET refresh_token = '${refreshToken}'`);
            res.cookie("refreshToken", refreshToken, {
              maxAge: day * 365,
              expires: new Date(Date.now() + day * 365),
              httpOnly: true,
              sameSite: "strict",
            });
            res.cookie("id", result.rows[0].id);
            res.cookie("login", result.rows[0].login);

            res.status(200).send({ accessToken: accessToken });
          }
        );
      } else {
        res.status(400).send("Account with that email already exists");
      }
    }
  );
});

routerPublic.post("/auth/signin", async (req, res) => {
  const credentials = inputHandler.signinHandler(req);
  const pass = crypto
    .createHash("sha256")
    .update(credentials.password)
    .digest("hex");
  const result = pg.query(
    `SELECT id, login FROM users WHERE password = '${pass}' AND login = '${credentials.login}'`,
    async (err, result) => {
      if (!credentials || result.rows.length == 0) {
        res.status(400).send("Логин или пароль введены неверно");
        return;
      } else {
        const refreshToken = (
          await pg.query(
            `SELECT refresh_token FROM users WHERE id=${result.rows[0].id}`
          )
        ).rows[0].refresh_token;
        const accessToken = token.generateAccessToken(
          result.rows[0].id,
          result.rows[0].login
        );
        res.cookie("refreshToken", refreshToken, {
          maxAge: day * 365,
          expires: new Date(Date.now() + day * 365),
          httpOnly: true,
          sameSite: "strict",
        });
        res.cookie("id", result.rows[0].id);
        res.cookie("login", result.rows[0].login);
        res.status(200).send({ status: "OK", accessToken: accessToken });
        return;
      }
    }
  );
});

routerPrivate.post("/refresh", (req, res) => {
  const accessToken = token.generateAccessToken(req.body.id, req.body.login);
  console.log("access: ", accessToken);
  res.status(200).send({ status: "OK", accessToken: accessToken });
});
routerPrivate.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("id");
  res.clearCookie("login");
  res.end();
  res.status(200).send({ status: "OK" });
});
// app.post("/task/create", token.authenticateToken, (req, res) => {

// })

app.use(routerPrivate)
app.use(routerPublic)

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
