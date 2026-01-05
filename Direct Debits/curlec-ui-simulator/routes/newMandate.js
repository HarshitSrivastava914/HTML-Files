const express = require("express");
const router = express.Router();

router.get("/ui/new-mandate", (req, res) => {
  res.render("new-mandate");
});

module.exports = router;
