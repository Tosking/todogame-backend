const express = require('express')
const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const cors = require('cors')
const token = require("./token.js")
const inputHandler = require("./inputHandler.js")
const { pg } = require("./dbConnect.js")
const app = express()
const port = 3000
require('dotenv').config()

const minute = 60000
const hour = minute * 60
const day = hour * 24


app.use(cors()); 
app.use("/style", express.static(path.join(__dirname, 'style')))
app.use(cookieParser());
app.use( bodyParser.json() );    
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.post("/auth/signup", async (req, res) => {
  const credentials = inputHandler.signupHandler(req)
  console.log(credentials)
  if(!credentials){
    res.sendStatus(400)
    return
  }
  const pass = crypto.createHash('sha256').update(credentials.password).digest('hex')
  const result = pg.query(`SELECT id FROM users WHERE login = '${credentials.login}' OR email = '${credentials.email}'`, (err, result) => {
    if(result.rows){
      pg.query(`INSERT INTO users (login, email, password) VALUES ('${credentials.login}', '${credentials.email}', '${pass}') RETURNING id, login;`, (err, result) => {
        const refreshToken = token.generateRefreshToken(result.rows[0].id)
        const accessToken = token.generateAccessToken(result.rows[0].id)
        pg.query(`UPDATE users SET refresh_token = '${refreshToken}'`)
        res.cookie('refreshToken',refreshToken, { maxAge: day*365, expires: new Date(Date.now() + day*365), httpOnly: true });
        res.cookie('accessToken',accessToken, { maxAge: minute*10, expires: new Date(Date.now() + minute*10), httpOnly: true });
        res.cookie('id', result.rows[0].id)
        res.cookie('login', result.rows[0].login)
        res.sendStatus(200)
      })
    }
    else {
      res.status(400).send("Account with that email already exists")
    }
  })
})

app.post("/auth/signin", async (req, res) => {
  const credentials = inputHandler.signupHandler(req)
  const pass = crypto.createHash('sha256').update(credentials.password).digest('hex')
  const result = pg.query(`SELECT id, login FROM users WHERE password = '${pass}' AND login = '${credentials.login}'`, async (err, result) => {
      if(!credentials || !result.rows){
        res.status(400).send("Логин или пароль введены неверно")
        return
      }
      else {
          const refreshToken = token.generateRefreshToken(result.rows[0].id)
          const accessToken = token.generateAccessToken(result.rows[0].id)
          res.cookie('refreshToken',refreshToken, { maxAge: day*365, expires: new Date(Date.now() + day*365), httpOnly: true });
          res.cookie('accessToken',accessToken, { maxAge: minute*10, expires: new Date(Date.now() + minute*10), httpOnly: true });
          res.cookie('id', result.rows[0].id)
          res.cookie('login', result.rows[0].login)
          res.sendStatus(200)
          return
      }
  })
})

app.post("/auth/token", verifyRefreshToken, (req, res) => {
  const accessToken = token.generateAccessToken(result.rows[0].id)
  res.send(200).cookie('accessToken',accessToken, { maxAge: minute*10, expires: new Date(Date.now() + minute*10), httpOnly: true })
})

app.post("/task/create", token.authenticateToken, (req, res) => {

})

app.listen(port, () => {
    console.log("server started at port 3000")
})
