const express = require("express");
const router = express.Router();
const template = require("../lib/template");

module.exports = (passport) => {
  router.get("/login", (req, res) => {
    // 파일리스트 불러오기
    const title = "Login";
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var body = `<div style="color:red;">${feedback}</div><form action="/auth/login" method="post">
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

  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
      successFlash: true,
    })
  );

  router.get("/logout", (req, res) => {
    req.logOut();
    req.session.save(() => {
      res.redirect("/");
    });
  });

  return router;
};
