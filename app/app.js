"use strict";

/**
 * StudyBuddy Express application.
 *
 * This file connects the server middleware, Pug views, route modules, session
 * state, and schema startup checks that power the StudyBuddy web app.
 */

// Core framework and middleware dependencies.
const express = require("express");
const session = require("express-session");
const path = require("path");

const routes = require("./routes");
const schemaModel = require("./models/schemaModel");

const app = express();

// Configure Pug templates and shared request middleware.
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../static")));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "studybuddy-development-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 4
  }
}));

// Expose current user and flash message data to every Pug template.
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use("/", routes);

// Render a friendly 404 page for unmatched routes.
app.use(function (req, res) {
  res.status(404).render("404", { title: "Page Not Found" });
});

// Ensure the latest schema additions exist, then start the web server.
async function startServer() {
  try {
    await schemaModel.ensureSprint4Schema();
  } catch (err) {
    console.warn("Sprint 4 schema check skipped:", err.message);
  }

  app.listen(3000, function () {
    console.log("StudyBuddy running at http://127.0.0.1:3000/");
  });
}

startServer();

module.exports = app;
