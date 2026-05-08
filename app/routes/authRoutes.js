"use strict";

const express = require("express");

const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const {
  validateRegistration,
  validateLogin
} = require("../utils/validation");
const {
  getProfileOptions,
  rememberUser,
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

// Render the registration form with current values and validation errors.
async function renderRegisterForm(res, values = {}, errors = []) {
  const options = await getProfileOptions();
  res.render("register", {
    title: "Create Account",
    values,
    errors,
    ...options
  });
}

// Display the account creation form.
router.get("/register", async function (req, res) {
  try {
    await renderRegisterForm(res);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load registration form." });
  }
});

// Create a user account after validation and duplicate email checks.
router.post("/register", async function (req, res) {
  const { values, errors } = validateRegistration(req.body);

  try {
    if (errors.length) return await renderRegisterForm(res, values, errors);

    const existingUser = await userModel.getUserByEmail(values.email);
    if (existingUser) {
      return await renderRegisterForm(res, values, ["An account already exists for that email address."]);
    }

    const passwordHash = await hashPassword(values.password);
    const userId = await userModel.createUser({
      ...values,
      password_hash: passwordHash
    });
    const user = await userModel.getUserById(userId);

    rememberUser(req, user);
    setFlash(req, "success", "Account created. Add your study profile details next.");
    return res.redirect("/profile/edit");
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not create account." });
  }
});

// Display the login form.
router.get("/login", function (req, res) {
  res.render("login", { title: "Login", values: {}, errors: [] });
});

// Authenticate a user and store their identity in the session.
router.post("/login", async function (req, res) {
  const { values, errors } = validateLogin(req.body);

  try {
    if (errors.length) {
      return res.status(400).render("login", { title: "Login", values, errors });
    }

    const user = await userModel.getUserByEmail(values.email);
    let passwordMatches = user ? await verifyPassword(values.password, user.password_hash) : false;

    // Upgrade the seeded demo password value to a real hash the first time it is used.
    if (!passwordMatches && user && user.password_hash === "hashed_pw" && values.password === "password123") {
      const upgradedHash = await hashPassword(values.password);
      await userModel.updatePasswordHash(user.user_id, upgradedHash);
      passwordMatches = true;
    }

    if (!user || !passwordMatches) {
      return res.status(401).render("login", {
        title: "Login",
        values,
        errors: ["Email or password is incorrect."]
      });
    }

    rememberUser(req, user);
    setFlash(req, "success", "You are logged in.");
    return res.redirect("/profile");
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not log in." });
  }
});

// End the current login session.
router.post("/logout", requireAuth, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
