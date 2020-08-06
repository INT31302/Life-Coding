const express = require("express");
const router = express.Router();
const template = require("../lib/template");

//lowdb
const db = require("../lib/db");
//shortid
const shortid = require("shortid");
//bcrypt
const bcrypt = require("bcrypt");

module.exports = (passport) => {
  router.get("/login", (req, res) => {
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

  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["https://www.googleapis.com/auth/plus.login", "email"],
    })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth/login",
    }),
    (req, res) => {
      res.redirect("/");
    }
  );

  router.get("/logout", (req, res) => {
    req.logOut();
    req.session.save(() => {
      res.redirect("/");
    });
  });

  router.get("/register", (req, res) => {
    const title = "Register";
    const fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var body = `<div style="color:red;">${feedback}</div><form action="/auth/register" method="post">
    <p><input type="text" name="email" placeholder="email" value="test@test.com"></p>
    <p><input type="password" name="password" placeholder="password" value="1234"></p>
    <p><input type="password" name="password2" placeholder="password" value="1234"></p>
    <p><input type="text" name="displayName" placeholder="display name" value="est"></p>
    <p><input type="submit" value="Register"></p>
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

  router.post("/register", (req, res) => {
    const post = req.body;
    const email = post.email;
    const password = post.password;
    const password2 = post.password2;
    const displayName = post.displayName;
    if (
      email === "" ||
      password === "" ||
      password2 === "" ||
      displayName === ""
    ) {
      req.flash("error", "input necessary infomation");
      res.redirect("/auth/register");
      return false;
    }
    if (password !== password2) {
      req.flash("error", "password must same!");
      res.redirect("/auth/register");
      return false;
    }
    if (db.get("users").find({ email: post.email }).value()) {
      req.flash("error", "already exist email");
      res.redirect("/auth/register");
      return false;
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;
      const user = {
        id: shortid.generate(),
        email: email,
        password: hash,
        displayName: displayName,
      };
      db.get("users").push(user).write();
      req.logIn(user, (err) => {
        if (err) throw err;
        res.redirect("/");
      });
    });
  });
  return router;
};
