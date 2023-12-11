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

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use("/style", express.static(path.join(__dirname, "style")));
app.use(cookieParser());
app.use(session({
  cookie: {expires: new Date(253402300000000)}
}));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(routerPublic.routerPublic);
app.use(routerPrivate.routerPrivate);

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
