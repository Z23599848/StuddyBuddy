"use strict";

const express = require("express");

const tagModel = require("../models/tagModel");
const { validateTopic } = require("../utils/validation");
const {
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

// Display all available topic tags.
router.get("/", async function (req, res) {
  try {
    const tags = await tagModel.getTags();
    res.render("tags", { title: "Browse Topics", tags });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load topics." });
  }
});

// Let signed-in users create a standalone topic.
router.post("/", requireAuth, async function (req, res) {
  const { values, errors } = validateTopic(req.body);

  try {
    if (errors.length) {
      setFlash(req, "error", errors[0]);
      return res.redirect("/tags");
    }

    const created = await tagModel.createTopic(values.topic_name, req.session.user.user_id);
    if (!created) {
      setFlash(req, "error", "That topic already exists.");
      return res.redirect("/tags");
    }

    setFlash(req, "success", "Topic created.");
    return res.redirect("/tags");
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not create topic." });
  }
});

module.exports = router;
