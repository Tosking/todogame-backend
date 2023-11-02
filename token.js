const jwt = require("jsonwebtoken");
const { pg } = require("./dbConnect.js");
require("dotenv").config();

function generateAccessToken(id, login) {
  return jwt.sign({ id: id, login: login }, process.env.ACCESS_TOKEN, {
    expiresIn: "3600s",
  });
}

function generateRefreshToken(id, login) {
  return jwt.sign({ id: id, login: login }, process.env.REFRESH_TOKEN, {
    expiresIn: "1y",
  });
}

async function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, tokenID) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.body.accessToken = tokenID;

    next();
  });
}

async function verifyRefreshToken(req, res, next) {
  try {
    const result = await pg.query(
      `SELECT refresh_token FROM users WHERE id=${req.cookies.id}`
    );
    if (req.cookies.refreshToken !== result.rows[0].refresh_token) {
      res.status(400).send("Invalid token");
      return;
    }
    jwt.verify(
      result.rows[0].refresh_token,
      process.env.REFRESH_TOKEN,
      (err, tokenID) => {
        if (err) return res.sendStatus(403);

        req.body.refreshToken = tokenID;
        next();
      }
    );
  } catch (err) {
    res.status(401).json({ messages: err.stack });
  }
}

module.exports = {
  generateAccessToken,
  authenticateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
