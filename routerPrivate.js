const express = require("express");
const token = require("./token.js");
const inputHandler = require("./inputHandler.js");
const { pg } = require("./dbConnect.js");
const routerPrivate = express.Router();

routerPrivate.use(async (req, res, next) => {
  console.log("work");
  try {
    accessToken = token.authenticateAccessToken(req);
    
  } catch (TokenExpiredError) {
    res.status(401).send("Token has expired");
    return;
  }
  if (!accessToken && !req.cookies["refreshToken"]) {
    res.status(401).send("No token has been provided");
  } else {
    req.body.tokenID = accessToken;
    
    next();
  }
});

routerPrivate.post("/refresh", async (req, res) => {
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

routerPrivate.get("/get/list", async (req, res) => {
  const resObj = {};
  resObj.tasks = (
    await pg.query(
      `SELECT id, title, description, category, deadline, completed FROM task WHERE userid=${req.body.tokenID.id}`
    )
  ).rows;
  resObj.categories = (
    await pg.query(
      `SELECT id, title, description FROM category WHERE userid=${req.body.tokenID.id}`
    )
  ).rows;
  if (!resObj) {
    res.status(400).send("Empty list");
  } else {
    res.status(200).send(resObj);
  }
});

routerPrivate.get("/get/task", async (req, res) => {
  pg.query(
    `SELECT title, description, category, deadline, completed FROM task WHERE userid=${req.body.tokenID.id} AND id=${req.body.id}`,
    (err, result) => {
      if (!result.rows[0]) {
        res.status(400).send("No task with given id");
      } else {
        res.status(200).send(result.rows[0]);
      }
    }
  );
});

routerPrivate.get("/get/category", async (req, res) => {
  pg.query(
    `SELECT title, description FROM category WHERE userid=${req.body.tokenID.id} AND id=${req.body.id}`,
    (err, result) => {
      if (!result.rows[0]) {
        res.status(400).send("No category with given id");
      } else {
        res.status(200).send(result.rows[0]);
      }
    }
  );
});

routerPrivate.post("/task/create", async (req, res) => {
  const task = inputHandler.taskInputHandler(req);
  console.log(req.body.tokenID.id);
  pg.query(
    `INSERT INTO task (userid, title, description ${task.category?',category':''}) VALUES ('${req.body.tokenID.id}', '${task.title}', '${task.description}' ${task.category?`,${task.category}`:''} ) RETURNING id`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error when inserting tasks into database");
      } else {
        task.id = result.rows[0].id;
        res.status(200).json(task);
      }
    }
  );
});

routerPrivate.post("/task/delete", (req, res) => {
 
  pg.query(
    `DELETE FROM task WHERE id=${req.body.id} AND userid=${req.body.tokenID.id} RETURNING id`,
    (err, result) => {
      if (!result.rows[0]) {
        console.log(req.body);
        res.status(400).send("Non-existent task");
      } else {
        res.status(200).send(result.rows[0].id);
      }
    }
  );
});

routerPrivate.post("/category/create", (req, res) => {
  const category = inputHandler.taskInputHandler(req);
  pg.query(
    `INSERT INTO category (userid, title, description) VALUES ('${req.body.tokenID.id}', '${category.title}', '${category.description}') RETURNING id`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error when inserting category into database");
      } else {
        category.id = result.rows[0].id;
        res.status(200).json(category);
      }
    }
  );
});

routerPrivate.post("/category/delete", (req, res) => {
  pg.query(
    `DELETE FROM category WHERE id=${req.body.id} AND userid=${req.body.tokenID.id} RETURNING id`,
    (err, result) => {
      if (!result.rows[0]) {
        res.status(400).send("Non-existent category");
      } else {
        res.status(200).send(result.rows[0].id);
      }
    }
  );
});

routerPrivate.post("/task/change", async (req, res) => {
  const task = inputHandler.taskInputHandler(req);
  console.log(task);

  pg.query(
    `UPDATE task SET title='${task.title}', description='${task.description}' WHERE userid=${req.body.tokenID.id} AND id=${task.id}`,
    (err, result) => {
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.status(200).send(task);
    }
  );
});

routerPrivate.post("/category/change", async (req, res) => {
  const category = inputHandler.taskInputHandler(req);
  pg.query(
    `UPDATE category SET title='${category.title}', description='${category.description}' WHERE userid=${req.body.tokenID.id} AND id=${req.body.id}`,
    (err, result) => {
      if (!err) {
        res.sendStatus(500);
        return;
      }
      res.status(200).send(category);
    }
  );
});

module.exports = {
  routerPrivate,
};
