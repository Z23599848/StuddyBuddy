"use strict";

const express = require("express");

const userModel = require("../models/userModel");
const {
  validateProfile,
  validateAvailability
} = require("../utils/validation");
const {
  getProfileOptions,
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

// Render the edit profile form with the user's existing profile details.
async function renderEditProfileForm(req, res, errors = []) {
  const uid = req.session.user.user_id;
  const [user, skills, courses, availability, options] = await Promise.all([
    userModel.getUserById(uid),
    userModel.getUserSkills(uid),
    userModel.getUserCourses(uid),
    userModel.getUserAvailability(uid),
    getProfileOptions()
  ]);

  res.render("edit-profile", {
    title: "Edit Profile",
    user,
    skills,
    courses,
    availability,
    errors,
    ...options
  });
}

// Redirect the signed-in user to their public profile page.
router.get("/profile", requireAuth, function (req, res) {
  res.redirect(`/users/${req.session.user.user_id}`);
});

// Display the editable profile form for the signed-in user.
router.get("/profile/edit", requireAuth, async function (req, res) {
  try {
    await renderEditProfileForm(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load profile form." });
  }
});

// Save profile details, skill/course information, and weekly availability.
router.post("/profile/edit", requireAuth, async function (req, res) {
  const profile = validateProfile(req.body);
  const availability = validateAvailability(req.body);
  const errors = profile.errors.concat(availability.errors);

  try {
    const departments = await userModel.getDepartments();
    const departmentMatchesUniversity = departments.some(function (department) {
      return Number(department.department_id) === Number(profile.values.department_id) &&
        Number(department.university_id) === Number(profile.values.university_id);
    });

    if (!departmentMatchesUniversity) {
      errors.push("Choose a department that belongs to the selected university.");
    }

    if (errors.length) return await renderEditProfileForm(req, res, errors);

    const uid = req.session.user.user_id;
    await userModel.updateUserProfile(uid, profile.values);
    await userModel.saveUserSkill(uid, profile.values.skill_name, profile.values.proficiency_level);
    await userModel.saveUserCourse(
      uid,
      profile.values.department_id,
      profile.values.course_code,
      profile.values.course_name,
      profile.values.semester,
      profile.values.year
    );
    await userModel.replaceUserAvailability(uid, availability.availability);

    setFlash(req, "success", "Profile updated.");
    return res.redirect(`/users/${uid}`);
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not update profile." });
  }
});

module.exports = router;
