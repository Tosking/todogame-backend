const express = require('express')
const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { createHash } = require('crypto');
const app = express()
const port = 3000
require('dotenv').config()
app.set('view engine', 'ejs');  

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

app.listen(port, () => {
    console.log("server started at port 3000")
})
