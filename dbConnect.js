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

module.exports = {
    pg
}