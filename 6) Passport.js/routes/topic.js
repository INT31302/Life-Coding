const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const auth = require("../lib/auth");

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

  fs.writeFile(`./data/${title}`, description, "utf8", (err) => {
    if (err) throw err;
    console.log("The file has been saved");
    res.redirect(`/topic/${title}`);
  });
});

router.get("/update/:updateId", (req, res) => {
  if (!req.user) {
    res.send('Login required!! <a href="/auth/login">go login</a>');
    return false;
  }
  // 파일리스트 불러오기
  const filteredId = path.parse(req.params.updateId).base;
  fs.readFile(`./data/${filteredId}`, "utf8", (err2, description) => {
    if (err2) throw err2;
    // 파일 읽기
    let title = filteredId;
    let list = template.list(req.list);
    let control;
    let body = `
        <form action="/topic/update" method="post">
        <input type="hidden", name ="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p><textarea name="description" placeholder="description">${description}</textarea></p>
        <p><input type="submit"></p>
        `;
    control = `<a href="/topic/create">create</a>
          <a href="/topic/update/${title}">update</a>
          <form action="/topic/delete" method="post">
            <input type="hidden" name="id" value="${title}">
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
});

router.post("/update", (req, res) => {
  const post = req.body;
  const filteredId = path.parse(post.id).base;
  const filteredTitle = path.parse(post.title).base;
  let id = filteredId;
  let title = filteredTitle;
  let description = post.description;
  fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
    if (err) throw err;
    fs.writeFile(`./data/${title}`, description, "utf8", (err2) => {
      if (err2) throw err2;
      console.log("The file has been saved");
      res.redirect(`/topic/${title}`);
    });
  });
});

router.post("/delete", (req, res) => {
  if (!req.user) {
    res.send('Login required!! <a href="/auth/login">go login</a>');
    return false;
  }
  const post = req.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`./data/${filteredId}`, function (err) {
    if (err) throw err;
    res.redirect("/");
  });
});
router.get("/:pageId", (req, res, next) => {
  // 파일리스트 불러오기
  const filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`./data/${filteredId}`, "utf8", (err, description) => {
    if (err) next(err);
    else {
      // 파일 읽기
      let sanitizedTitle = sanitizeHtml(req.params.pageId);
      let sanitizedDescription = sanitizeHtml(description);
      let list = template.list(req.list);
      let body = `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`;
      let html = template.html(
        sanitizedTitle,
        list,
        body,
        `<a href="/topic/create">create</a>
    <a href="/topic/update/${sanitizedTitle}">update</a>
    <form action="/topic/delete" method="post">
    <input type="hidden" name="id" value="${sanitizedTitle}">
    <input type="submit" value="delete">
    </form>`,
        auth.authStatusUI(req)
      );
      res.send(html);
    }
  });
});

module.exports = router;
