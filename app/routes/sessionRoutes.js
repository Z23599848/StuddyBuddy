"use strict";

const express = require("express");

const ratingModel = require("../models/ratingModel");
const sessionModel = require("../models/sessionModel");
const { validateRating } = require("../utils/validation");
const {
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

// List study sessions, optionally filtered by tag/topic.
router.get("/", async function (req, res) {
  const { tag } = req.query;

  try {
    const sessions = await sessionModel.getAllSessions(tag);
    res.render("sessions", { title: "Study Sessions", sessions, selectedTag: tag });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load sessions." });
  }
});

// Show study session details, participants, ratings, and any users the viewer can rate.
router.get("/:id", async function (req, res) {
  const sid = req.params.id;

  try {
    const studySession = await sessionModel.getSessionById(sid);
    if (!studySession) return res.status(404).render("error", { message: "Session not found." });

    const [participants, sessionRatings] = await Promise.all([
      sessionModel.getSessionParticipants(sid),
      ratingModel.getSessionRatings(sid)
    ]);

    let rateableUsers = [];
    if (req.session.user && await ratingModel.canUserRateSession(sid, req.session.user.user_id)) {
      rateableUsers = await ratingModel.getRateableUsers(sid, req.session.user.user_id);
    }

    res.render("session-detail", {
      title: studySession.topic,
      session: studySession,
      participants,
      sessionRatings,
      rateableUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load session." });
  }
});

// Create or update a rating for another participant in a completed session.
router.post("/:id/ratings", requireAuth, async function (req, res) {
  const sid = req.params.id;
  const { values, errors } = validateRating(req.body);

  try {
    if (errors.length) {
      setFlash(req, "error", errors[0]);
      return res.redirect(`/sessions/${sid}`);
    }

    const canRate = await ratingModel.canUserRateSession(sid, req.session.user.user_id);
    const rateableUsers = await ratingModel.getRateableUsers(sid, req.session.user.user_id);
    const targetIsRateable = rateableUsers.some(function (user) {
      return Number(user.user_id) === Number(values.rated_user_id);
    });

    if (!canRate || !targetIsRateable) {
      setFlash(req, "error", "You can only rate students from completed sessions you joined.");
      return res.redirect(`/sessions/${sid}`);
    }

    await ratingModel.createOrUpdateRating(
      sid,
      req.session.user.user_id,
      values.rated_user_id,
      values.score,
      values.feedback
    );
    setFlash(req, "success", "Rating saved.");
    return res.redirect(`/sessions/${sid}`);
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not save rating." });
  }
});

module.exports = router;
