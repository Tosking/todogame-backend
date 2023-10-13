const express = require('express')
const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { createHash } = require('crypto');
const app = express()
const port = 3000
require('dotenv').config()

const { Client } = require('pg');
const pg = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
})
pg.connect()

app.use("/style", express.static(path.join(__dirname, 'style')))
app.use(cookieParser());
app.use( bodyParser.json() );    
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.post("/auth/register", (req, res) => {
  console.log(req.body)
  if(req.body.login == null || req.body.password == null || !req.body.email.match("^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$")){
    res.sendStatus(400)
    return
  }
  const pass = createHash('sha256').update(req.body.password).digest('hex')
  const result = pg.query(`SELECT id FROM users WHERE password = '${pass}' AND email = '${req.body.email}'`, (result) => {
    if(result.rows[0].id == undefined){
      pg.query(`INSERT INTO users (login, email, password) VALUES ('${req.body.login}', '${req.body.email}', '${pass}') RETURNING id, login;`, (err, result) => {
        const randomNumber=createHash('sha256').update(req.body.password + req.body.email).digest('hex')
        res.cookie('cookie',randomNumber, { maxAge: 900000, httpOnly: true });
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

app.listen(port, () => {
    console.log("server started at port 3000")
})
