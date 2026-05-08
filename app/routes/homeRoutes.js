"use strict";

const express = require("express");

const router = express.Router();

// Home page.
router.get("/", function (req, res) {
  res.render("index", { title: "StudyBuddy - Home" });
});

module.exports = router;
