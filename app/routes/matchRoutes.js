"use strict";

const express = require("express");

const matchModel = require("../models/matchModel");
const { requireAuth } = require("./helpers");

const router = express.Router();

// Show recommended study matches for the signed-in user.
router.get("/", requireAuth, async function (req, res) {
  try {
    const matches = await matchModel.getMatchesForUser(req.session.user.user_id);
    res.render("matches", { title: "Study Matches", matches });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load matches." });
  }
});

module.exports = router;
