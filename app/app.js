// Sprint 3 - StudyBuddy Application
// Author: Tavishi
// Full-stack Sprint 3 implementation

"use strict";

const express = require("express");
const path    = require("path");
const db      = require("./services/db");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../static")));
app.use(express.urlencoded({ extended: true }));

/**
 * GET /
 * Home page
 */
app.get("/", (req, res) => {
  res.render("index", { title: "StudyBuddy | Home" });
});

/**
 * GET /users
 * Users list page – lists all students with department/university info
 * Sprint 3 requirement: "Users list page" using DB data
 */
app.get("/users", async (req, res) => {
  const sql = `
    SELECT  u.user_id,
            u.first_name,
            u.last_name,
            u.academic_level,
            d.name  AS department,
            uni.name AS university
    FROM    \`user\`      u
    JOIN    department   d   ON d.department_id  = u.department_id
    JOIN    university   uni ON uni.university_id = u.university_id
    ORDER   BY u.first_name, u.last_name
  `;
  try {
    const users = await db.query(sql);
    res.render("users", { title: "Browse Study Buddies", users });
  } catch (err) {
    console.error("[/users]", err.message);
    res.status(500).render("error", { message: "Failed to load users list." });
  }
});

/**
 * GET /users/:id
 * User profile page – detailed view of a single student
 * Sprint 3 requirement: "User profile page" using DB data
 */
app.get("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).render("error", { message: "Bad user ID." });

  try {
    const [user] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email,
              u.academic_level, u.bio, u.created_at,
              d.name AS department, uni.name AS university
       FROM   \`user\` u
       JOIN   department d   ON d.department_id  = u.department_id
       JOIN   university uni ON uni.university_id = u.university_id
       WHERE  u.user_id = ?`,
      [userId]
    );
    if (!user) return res.status(404).render("error", { message: "User not found." });

    const [skills, courses] = await Promise.all([
      db.query(
        `SELECT s.skill_name, us.proficiency_level
         FROM user_skill us JOIN skill s ON s.skill_id = us.skill_id
         WHERE us.user_id = ?`, [userId]
      ),
      db.query(
        `SELECT c.course_code, c.course_name, e.semester, e.year
         FROM enrollment e JOIN course c ON c.course_id = e.course_id
         WHERE e.user_id = ?`, [userId]
      )
    ]);

    res.render("profile", {
      title: `${user.first_name} ${user.last_name}`,
      user, skills, courses
    });
  } catch (err) {
    console.error("[/users/:id]", err.message);
    res.status(500).render("error", { message: "Failed to load profile." });
  }
});

/**
 * GET /sessions
 * Listing page – all study sessions
 * Sprint 3 requirement: "Listing page" using DB data
 */
app.get("/sessions", async (req, res) => {
  const { tag } = req.query;
  const params  = [];
  let sql = `
    SELECT ss.session_id, ss.topic, ss.location, ss.scheduled_time,
           ss.max_participants,
           u.first_name, u.last_name,
           COUNT(sp.user_id) AS slots_taken
    FROM   study_session ss
    JOIN   \`user\` u ON u.user_id = ss.created_by
    LEFT JOIN session_participant sp ON sp.session_id = ss.session_id
  `;
  if (tag) { sql += " WHERE ss.topic LIKE ?"; params.push(`%${tag}%`); }
  sql += " GROUP BY ss.session_id ORDER BY ss.scheduled_time ASC";

  try {
    const sessions = await db.query(sql, params);
    res.render("sessions", { title: "Study Sessions", sessions, selectedTag: tag });
  } catch (err) {
    console.error("[/sessions]", err.message);
    res.status(500).render("error", { message: "Failed to load sessions." });
  }
});

/**
 * GET /sessions/:id
 * Detail page – full info about a single session
 * Sprint 3 requirement: "Detail page" using DB data
 */
app.get("/sessions/:id", async (req, res) => {
  const sessionId = Number(req.params.id);
  try {
    const [session] = await db.query(
      `SELECT ss.session_id, ss.topic, ss.location, ss.scheduled_time,
              ss.max_participants, u.first_name, u.last_name, u.user_id AS host_id
       FROM   study_session ss
       JOIN   \`user\` u ON u.user_id = ss.created_by
       WHERE  ss.session_id = ?`,
      [sessionId]
    );
    if (!session) return res.status(404).render("error", { message: "Session not found." });

    const participants = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, sp.status
       FROM   session_participant sp
       JOIN   \`user\` u ON u.user_id = sp.user_id
       WHERE  sp.session_id = ?`,
      [sessionId]
    );
    res.render("session-detail", { title: session.topic, session, participants });
  } catch (err) {
    console.error("[/sessions/:id]", err.message);
    res.status(500).render("error", { message: "Failed to load session." });
  }
});

/**
 * GET /tags
 * Tags/categories page – browse sessions by topic
 * Sprint 3 requirement: "Tags/categories" using DB data
 */
app.get("/tags", async (_req, res) => {
  try {
    const tags = await db.query(
      `SELECT topic AS tag, COUNT(*) AS total
       FROM study_session GROUP BY topic ORDER BY total DESC`
    );
    res.render("tags", { title: "Browse by Topic", tags });
  } catch (err) {
    console.error("[/tags]", err.message);
    res.status(500).render("error", { message: "Failed to load topics." });
  }
});

app.listen(3000, () => console.log("StudyBuddy listening at http://127.0.0.1:3000/"));
