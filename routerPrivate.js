const express = require("express");
const token = require("./token.js");
const inputHandler = require("./inputHandler.js");
const { pg } = require("./dbConnect.js");
const routerPrivate = express.Router();

routerPrivate.use((req, res, next) => {
  try {
    accessToken = token.authenticateAccessToken(req);
  } catch (TokenExpiredError) {
    res.status(401).send("Token has expired");
    return
  }
  if (!accessToken) {
    res.status(401).send("No token has been provided");
  } else {
    req.body.tokenID = accessToken;
    next();
  }
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

routerPrivate.post("/task/create", (req, res) => {
  const task = inputHandler.taskInputHandler(req);
  pg.query(
    `INSERT INTO task (userid, title, description) VALUES ('${req.body.tokenID.id}', '${task.title}', '${task.description}')`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error when inserting tasks into database");
      } else {
        res.status(200).json(task);
      }
    }
  );
});

module.exports = {
  routerPrivate,
};
