const jwt = require('jsonwebtoken')
require('dotenv').config()

function generateAccessToken(username) {
  return jwt.sign({username: username}, process.env.TOKEN, { expiresIn: '3600s' });
}


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN, (err, login) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      req.body.tokenLogin = login
  
      next()
    })
  }

module.exports = {
    generateAccessToken,
    authenticateToken
}
  