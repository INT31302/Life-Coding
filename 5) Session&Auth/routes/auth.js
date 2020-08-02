const express = require("express");
const router = express.Router();
const template = require("../lib/template");

const authData = {
  email: "test@test.com",
  password: "1234",
  nickname: "est",
};

router.get("/login", (req, res) => {
  // 파일리스트 불러오기
  const title = "Login";
  var body = `<form action="/auth/login" method="post">
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

router.post("/login", (req, res) => {
  const post = req.body;
  const email = post.email;
  const password = post.password;
  if (email === authData.email && password === authData.password) {
    req.session.is_logined = true;
    req.session.nickname = authData.nickname;
    req.session.save(() => {
      res.redirect("/");
    });
  } else res.send("Who?");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

module.exports = router;
