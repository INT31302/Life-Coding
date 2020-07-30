const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.clearCookie("email");
  res.clearCookie("password");
  res.clearCookie("nickname");
  res.redirect("/");
});

module.exports = router;
