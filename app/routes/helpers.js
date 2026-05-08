"use strict";

const userModel = require("../models/userModel");
const { DAYS } = require("../utils/validation");

// Store one-time feedback messages in the session for the next page render.
function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

// Keep only safe, commonly-used user fields in the session.
function rememberUser(req, user) {
  req.session.user = {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email
  };
}

// Protect routes that require a logged-in user.
function requireAuth(req, res, next) {
  if (!req.session.user) {
    setFlash(req, "error", "Please log in to continue.");
    return res.redirect("/login");
  }

  return next();
}

// Load shared dropdown/checkbox options used by profile and registration forms.
async function getProfileOptions() {
  const [universities, departments, skillOptions] = await Promise.all([
    userModel.getUniversities(),
    userModel.getDepartments(),
    userModel.getSkills()
  ]);

  return { universities, departments, skillOptions, days: DAYS };
}

module.exports = {
  getProfileOptions,
  rememberUser,
  requireAuth,
  setFlash
};
