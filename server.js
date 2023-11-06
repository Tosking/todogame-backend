const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const port = 3001;
require("dotenv").config();

const routerPrivate = require("./routerPrivate.js");
const routerPublic = require("./routerPublic.js");

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

app.use(routerPrivate.routerPrivate);
app.use(routerPublic.routerPublic);

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
