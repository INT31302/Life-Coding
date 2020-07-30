const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
const owner = require("./lib/Owner");
const topicRouter = require("./routes/topic");
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static("public"));

app.get("*", (req, res, next) => {
  owner.authIsOwner(req, res);
  console.log(owner.getOwner());
  fs.readdir("./data", (err, filelist) => {
    if (err) throw err;
    req.list = filelist;
    next();
  });
});

app.use("/login", loginRouter);

app.use("/logout", logoutRouter);

app.use("/topic", topicRouter);

app.use("/", indexRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Somthing break");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
