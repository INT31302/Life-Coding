const express = require("express");
const router = express.Router();
const owner = require("../lib/Owner");
const template = require("../lib/template");

router.get("/", (req, res) => {
  // 파일리스트 불러오기
  const title = "Welcome";
  var description = "Hello, Node.js";
  var body = `<h2>${title}</h2><p>${description}</p>
    <img src="/images/coding.jpg" style="width:300px; display:block; margin-top:10px;"`;
  var list = template.list(req.list);
  var html = template.html(
    title,
    list,
    body,
    `<a href="/topic/create">create</a>`,
    template.authStatusUI()
  );
  res.send(html);
});

module.exports = router;
