const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const auth = require("../lib/auth");
const db = require("../lib/db");
const shortid = require("shortid");

router.get("/create", (req, res) => {
  if (!req.user) {
    res.send('Login required!! <a href="/auth/login">go login</a>');
    return false;
  }
  // 파일리스트 불러오기
  var title = "WEB - create";
  var list = template.list(req.list);
  var html = template.html(
    title,
    list,
    `
        <form action="/topic/create" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
        `,
    ``,
    auth.authStatusUI(req)
  );
  res.send(html);
});

router.post("/create", (req, res) => {
  const post = req.body;
  const filteredTitle = path.parse(post.title).base;
  let title = filteredTitle;
  let description = post.description;
  let id = shortid.generate();
  db.get("topics")
    .push({
      id: id,
      title: title,
      description: description,
      user_id: req.user.id,
    })
    .write();
  res.redirect(`/topic/${id}`);
});

router.get("/update/:updateId", (req, res) => {
  if (!req.user) {
    res.send('Login required!! <a href="/auth/login">go login</a>');
    return false;
  }
  const topic = db.get("topics").find({ id: req.params.updateId }).value();
  if (req.user.id !== topic.user_id) {
    req.flash("error", "No access");
    res.redirect("/");
    return false;
  }
  let title = topic.title;
  let list = template.list(req.list);
  let control;
  let body = `
        <form action="/topic/update" method="post">
        <input type="hidden", name ="id" value="${topic.id}">
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p><textarea name="description" placeholder="description">${topic.description}</textarea></p>
        <p><input type="submit"></p>
        `;
  control = `<a href="/topic/create">create</a>
          <a href="/topic/update/${topic.id}">update</a>
          <form action="/topic/delete" method="post">
            <input type="hidden" name="id" value="${topic.id}">
            <input type="submit" value="delete">
          </form>`;
  const html = template.html(
    title,
    list,
    body,
    control,
    auth.authStatusUI(req)
  );
  res.send(html);
});

router.post("/update", (req, res) => {
  const post = req.body;
  const filteredId = path.parse(post.id).base;
  const filteredTitle = path.parse(post.title).base;
  let id = filteredId;
  let title = filteredTitle;
  let description = post.description;
  db.get("topics")
    .find({ id: post.id })
    .assign({ title: title, description: description })
    .write();
  res.redirect(`/topic/${id}`);
});

router.post("/delete", (req, res) => {
  if (!req.user) {
    res.send('Login required!! <a href="/auth/login">go login</a>');
    return false;
  }
  const post = req.body;
  let id = post.id;
  const topic = db.get("topics").find({ id: id }).value();
  if (req.user.id !== topic.user_id) {
    req.flash("error", "No access");
    res.redirect("/");
    return false;
  }
  db.get("topics").remove({ id: id }).write();
  res.redirect("/");
});
router.get("/:pageId", (req, res, next) => {
  const topic = db.get("topics").find({ id: req.params.pageId }).value();
  // 파일 읽기
  let sanitizedTitle = sanitizeHtml(topic.title);
  let sanitizedDescription = sanitizeHtml(topic.description);
  let user = db.get("users").find({ id: topic.user_id }).value();
  let list = template.list(req.list);
  let body = `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p><p>by ${user.displayName}</p>`;
  let html = template.html(
    sanitizedTitle,
    list,
    body,
    `<a href="/topic/create">create</a>
    <a href="/topic/update/${topic.id}">update</a>
    <form action="/topic/delete" method="post">
    <input type="hidden" name="id" value="${topic.id}">
    <input type="submit" value="delete">
    </form>`,
    auth.authStatusUI(req)
  );
  res.send(html);
});

module.exports = router;
