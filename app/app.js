// Sprint 3 - StudyBuddy Application
// Author: Ali
// All routes implemented as required by Sprint 3 checklist

"use strict";

const express = require("express");
const path = require("path");
const db = require("./services/db");

const app = express();

// Set PUG as the templating engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "../static")));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────
app.get("/", function (req, res) {
  res.render("index", { title: "StudyBuddy – Home" });
});

// ─────────────────────────────────────────────
// USERS LIST PAGE
// Shows all registered users with their department
// ─────────────────────────────────────────────
app.get("/users", async function (req, res) {
  try {
    const sql = `
      SELECT u.user_id, u.first_name, u.last_name, u.email,
             u.academic_level, d.name AS department, uni.name AS university
      FROM user u
      JOIN department d ON u.department_id = d.department_id
      JOIN university uni ON u.university_id = uni.university_id
      ORDER BY u.first_name ASC
    `;
    const users = await db.query(sql);
    res.render("users", { title: "Study Buddies", users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// ─────────────────────────────────────────────
// USER PROFILE PAGE
// Shows a single user's details, skills and enrolled courses
// ─────────────────────────────────────────────
app.get("/users/:id", async function (req, res) {
  try {
    const userId = req.params.id;

    const [user] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email,
              u.academic_level, u.bio, u.created_at,
              d.name AS department, uni.name AS university
       FROM user u
       JOIN department d ON u.department_id = d.department_id
       JOIN university uni ON u.university_id = uni.university_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (!user) return res.status(404).render("404", { title: "User Not Found" });

    const skills = await db.query(
      `SELECT s.skill_name, us.proficiency_level
       FROM user_skill us
       JOIN skill s ON us.skill_id = s.skill_id
       WHERE us.user_id = ?`,
      [userId]
    );

    const courses = await db.query(
      `SELECT c.course_code, c.course_name, e.semester, e.year
       FROM enrollment e
       JOIN course c ON e.course_id = c.course_id
       WHERE e.user_id = ?`,
      [userId]
    );

    res.render("profile", { title: `${user.first_name} ${user.last_name}`, user, skills, courses });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// ─────────────────────────────────────────────
// SESSIONS LISTING PAGE
// Lists all available study sessions
// ─────────────────────────────────────────────
app.get("/sessions", async function (req, res) {
  try {
    const { tag } = req.query;
    let sql = `
      SELECT ss.session_id, ss.topic, ss.location, ss.scheduled_time,
             ss.max_participants, u.first_name, u.last_name,
             COUNT(sp.user_id) AS participant_count
      FROM study_session ss
      JOIN user u ON ss.created_by = u.user_id
      LEFT JOIN session_participant sp ON ss.session_id = sp.session_id
    `;
    const params = [];

    if (tag) {
      sql += ` WHERE ss.topic LIKE ?`;
      params.push(`%${tag}%`);
    }

    sql += ` GROUP BY ss.session_id ORDER BY ss.scheduled_time ASC`;

    const sessions = await db.query(sql, params);
    res.render("sessions", { title: "Study Sessions", sessions, selectedTag: tag || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// ─────────────────────────────────────────────
// SESSION DETAIL PAGE
// Shows details of a single study session
// ─────────────────────────────────────────────
app.get("/sessions/:id", async function (req, res) {
  try {
    const sessionId = req.params.id;

    const [session] = await db.query(
      `SELECT ss.session_id, ss.topic, ss.location, ss.scheduled_time,
              ss.max_participants, u.first_name, u.last_name, u.user_id AS creator_id
       FROM study_session ss
       JOIN user u ON ss.created_by = u.user_id
       WHERE ss.session_id = ?`,
      [sessionId]
    );

    if (!session) return res.status(404).render("404", { title: "Session Not Found" });

    const participants = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, sp.status
       FROM session_participant sp
       JOIN user u ON sp.user_id = u.user_id
       WHERE sp.session_id = ?`,
      [sessionId]
    );

    res.render("session-detail", { title: session.topic, session, participants });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// ─────────────────────────────────────────────
// TAGS / CATEGORIES PAGE
// Browse sessions grouped by topic keyword
// ─────────────────────────────────────────────
app.get("/tags", async function (req, res) {
  try {
    const sql = `
      SELECT DISTINCT topic AS tag, COUNT(*) AS count
      FROM study_session
      GROUP BY topic
      ORDER BY count DESC
    `;
    const tags = await db.query(sql);
    res.render("tags", { title: "Browse by Topic", tags });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Start server
app.listen(3000, function () {
  console.log("Server running at http://127.0.0.1:3000/");
});
