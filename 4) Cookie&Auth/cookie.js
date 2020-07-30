const express = require("express");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const app = express();

app.use(cookieParser("waeoifwaefnfasdiojfjsodij"));
app.use("*", (req, res) => {
  let cookies = {};
  if (req.headers.cookie != undefined) {
    cookies = cookie.parse(req.headers.cookie);
  }
  console.log(cookies);
  console.log(cookies.yummy_cookie);
  console.log(req.cookies.yummy_cookie);
  res.cookie("yummy_cookie", "choco");
  res.cookie("taste_cookie", "strawberry");
  res.cookie("Permanent", "cookies", {
    maxAge: 60 * 60 * 1000,
    path: "/cookie",
  });
  res.cookie("Secure", "Secure", { secure: true });
  res.cookie("HttpOnly", "HttpOnly", { httpOnly: true });
  res.send("Cookie!!");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
