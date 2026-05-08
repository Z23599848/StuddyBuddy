"use strict";

const express = require("express");

const requestModel = require("../models/requestModel");
const userModel = require("../models/userModel");
const { validateStudyRequest } = require("../utils/validation");
const {
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

// List all registered study buddies.
router.get("/", async function (req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.render("users", { title: "Study Buddies", users });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load users." });
  }
});

// Show a public profile, including skills, courses, availability, and ratings.
router.get("/:id", async function (req, res) {
  const uid = req.params.id;

  try {
    const user = await userModel.getUserById(uid);
    if (!user) return res.status(404).render("error", { message: "User not found." });

    const [skills, courses, availability, ratings] = await Promise.all([
      userModel.getUserSkills(uid),
      userModel.getUserCourses(uid),
      userModel.getUserAvailability(uid),
      userModel.getUserRatings(uid)
    ]);

    let activeRequest = null;
    let reverseActiveRequest = null;
    let connected = false;
    const currentUser = req.session.user;

    // For other users, include relationship state so the profile view can show the right action.
    if (currentUser && Number(currentUser.user_id) !== Number(uid)) {
      activeRequest = await requestModel.getExistingActiveRequest(currentUser.user_id, uid);
      reverseActiveRequest = await requestModel.getExistingActiveRequest(uid, currentUser.user_id);
      connected = await requestModel.areUsersConnected(currentUser.user_id, uid);
    }

    res.render("profile", {
      title: `${user.first_name} ${user.last_name}`,
      user,
      skills,
      courses,
      availability,
      ratings,
      activeRequest,
      reverseActiveRequest,
      connected
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load profile." });
  }
});

// Send a study request to another user when no active request or connection exists.
router.post("/:id/request", requireAuth, async function (req, res) {
  const receiverId = req.params.id;
  const { values, errors } = validateStudyRequest(req.body);

  try {
    if (Number(receiverId) === Number(req.session.user.user_id)) {
      setFlash(req, "error", "You cannot send a study request to yourself.");
      return res.redirect(`/users/${receiverId}`);
    }

    if (errors.length) {
      setFlash(req, "error", errors[0]);
      return res.redirect(`/users/${receiverId}`);
    }

    const receiver = await userModel.getUserById(receiverId);
    if (!receiver) return res.status(404).render("error", { message: "User not found." });

    const connected = await requestModel.areUsersConnected(req.session.user.user_id, receiverId);
    const outgoing = await requestModel.getExistingActiveRequest(req.session.user.user_id, receiverId);
    const incoming = await requestModel.getExistingActiveRequest(receiverId, req.session.user.user_id);

    if (connected || outgoing || incoming) {
      setFlash(req, "error", "There is already an active study request or connection.");
      return res.redirect(`/users/${receiverId}`);
    }

    await requestModel.createRequest(req.session.user.user_id, receiverId, values.message);
    setFlash(req, "success", "Study request sent.");
    return res.redirect("/requests");
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not send study request." });
  }
});

module.exports = router;
