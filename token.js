const jwt = require('jsonwebtoken')
require('dotenv').config()

function generateAccessToken(id) {
  return jwt.sign({id: id}, process.env.ACCESS_TOKEN, { expiresIn: '3600s' });
}

function generateRefreshToken(id) {
  return jwt.sign({id: id}, process.env.REFRESH_TOKEN, { expiresIn: '3m' });
}


function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, tokenID) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.body.accessToken = tokenID

    next()
  })
}

function authenticateRefreshToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.REFRESH_TOKEN, (err, tokenID) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.body.refreshToken = tokenID

    next()
  })
}

async function verifyRefreshToken(req, res, pg){
  return pg.query(`SELECT refresh_token FROM users WHERE id=${req.cookies.id}`, (err, result) => {
    if(!result.rows){
      return false
    }
  })
}

module.exports = {
    generateAccessToken,
    authenticateAccessToken,
    authenticateRefreshToken,
    generateRefreshToken
}
  