// Sprint 3 – StudyBuddy Main App
// All required pages: Users list, User profile, Listing, Detail, Tags

"use strict";

const express = require("express");
const path    = require("path");
const db      = require('./services/db');

const app = express();

// ── View engine setup ────────────────────────────────────────────
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ── Static files & body parsing ──────────────────────────────────
app.use(express.static(path.join(__dirname, "../static")));
app.use(express.urlencoded({ extended: true }));

const userModel = require('./models/userModel');
const sessionModel = require('./models/sessionModel');
const tagModel = require('./models/tagModel');

// ── Home ─────────────────────────────────────────────────────────
app.get("/", function (req, res) {
  res.render("index", { title: "StudyBuddy – Home" });
});

// ── USERS LIST PAGE ──────────────────────────────────────────────
app.get("/users", async function (req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.render("users", { title: "Study Buddies", users });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load users." });
  }
});

// ── USER PROFILE PAGE ────────────────────────────────────────────
app.get("/users/:id", async function (req, res) {
  const uid = req.params.id;
  try {
    const user = await userModel.getUserById(uid);
    if (!user) return res.status(404).render("error", { message: "User not found." });

    const skills = await userModel.getUserSkills(uid);
    const courses = await userModel.getUserCourses(uid);

    res.render("profile", {
      title: `${user.first_name} ${user.last_name}`,
      user, skills, courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load profile." });
  }
});

// ── LISTING PAGE ─────────────────────────────────────────────────
app.get("/sessions", async function (req, res) {
  const { tag } = req.query;
  try {
    const sessions = await sessionModel.getAllSessions(tag);
    res.render("sessions", { title: "Study Sessions", sessions, selectedTag: tag });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load sessions." });
  }
});

// ── DETAIL PAGE ──────────────────────────────────────────────────
app.get("/sessions/:id", async function (req, res) {
  const sid = req.params.id;
  try {
    const session = await sessionModel.getSessionById(sid);
    if (!session) return res.status(404).render("error", { message: "Session not found." });

    const participants = await sessionModel.getSessionParticipants(sid);
    res.render("session-detail", { title: session.topic, session, participants });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load session." });
  }
});

// ── TAGS / CATEGORIES ────────────────────────────────────────────
app.get("/tags", async function (req, res) {
  try {
    const tags = await tagModel.getTags();
    res.render("tags", { title: "Browse Topics", tags });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load topics." });
  }
});

// Start server
app.listen(3000, function () {
  console.log("StudyBuddy running at http://127.0.0.1:3000/");
});