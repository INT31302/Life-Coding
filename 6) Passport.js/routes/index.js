const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");

router.get("/", (req, res) => {
  // 파일리스트 불러오기
  const title = "Welcome";
  const fmsg = req.flash();
  let feedback = "";
  if (fmsg.success) {
    feedback = fmsg.success[0];
  }
  var description = "Hello, Node.js";
  var body = `<div style="color:blue;">${feedback}</div><h2>${title}</h2><p>${description}</p>
    <img src="/images/coding.jpg" style="width:300px; display:block; margin-top:10px;"`;
  var list = template.list(req.list);
  var html = template.html(
    title,
    list,
    body,
    `<a href="/topic/create">create</a>`,
    auth.authStatusUI(req)
  );
  res.send(html);
});

module.exports = router;
