const express = require("express");
const router = express.Router();
const template = require("../lib/template");

router.get("/", (req, res) => {
  // 파일리스트 불러오기
  const title = "Login";
  var body = `<form action="login" method="post">
  <p><input type="text" name="email" placeholder="email" ></p>
  <p><input type="password" name="password" placeholder="password"></p>
  <p><input type="submit" value="Login"></p>
  </form>`;
  var list = template.list(req.list);
  var html = template.html(
    title,
    list,
    body,
    `<a href="/topic/create">create</a>`
  );
  res.send(html);
});

router.post("/", (req, res) => {
  const body = req.body;
  if (body.email === "test@test.com" && body.password === "1234") {
    res.cookie("email", body.email, {
      httpOnly: true,
    });
    res.cookie("password", body.password, {
      httpOnly: true,
    });
    res.cookie("nickname", "test");
    res.redirect("/");
  } else res.send("Who?");
});

module.exports = router;
