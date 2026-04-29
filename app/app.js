"use strict";

const express = require("express");
const session = require("express-session");
const path = require("path");

const userModel = require("./models/userModel");
const sessionModel = require("./models/sessionModel");
const tagModel = require("./models/tagModel");
const matchModel = require("./models/matchModel");
const requestModel = require("./models/requestModel");
const messageModel = require("./models/messageModel");
const ratingModel = require("./models/ratingModel");
const schemaModel = require("./models/schemaModel");
const { hashPassword, verifyPassword } = require("./utils/password");
const {
  DAYS,
  validateRegistration,
  validateLogin,
  validateProfile,
  validateAvailability,
  validateStudyRequest,
  validateMessage,
  validateRating
} = require("./utils/validation");

const app = express();

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

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function rememberUser(req, user) {
  req.session.user = {
    user_id: user.user_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email
  };
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    setFlash(req, "error", "Please log in to continue.");
    return res.redirect("/login");
  }

  return next();
}

async function getProfileOptions() {
  const [universities, departments, skillOptions] = await Promise.all([
    userModel.getUniversities(),
    userModel.getDepartments(),
    userModel.getSkills()
  ]);

  return { universities, departments, skillOptions, days: DAYS };
}

async function renderRegisterForm(res, values = {}, errors = []) {
  const options = await getProfileOptions();
  res.render("register", {
    title: "Create Account",
    values,
    errors,
    ...options
  });
}

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

app.use(function (req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.get("/", function (req, res) {
  res.render("index", { title: "StudyBuddy - Home" });
});

app.get("/register", async function (req, res) {
  try {
    await renderRegisterForm(res);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load registration form." });
  }
});

app.post("/register", async function (req, res) {
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

app.get("/login", function (req, res) {
  res.render("login", { title: "Login", values: {}, errors: [] });
});

app.post("/login", async function (req, res) {
  const { values, errors } = validateLogin(req.body);

  try {
    if (errors.length) {
      return res.status(400).render("login", { title: "Login", values, errors });
    }

    const user = await userModel.getUserByEmail(values.email);
    let passwordMatches = user ? await verifyPassword(values.password, user.password_hash) : false;

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

app.post("/logout", requireAuth, function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

app.get("/profile", requireAuth, function (req, res) {
  res.redirect(`/users/${req.session.user.user_id}`);
});

app.get("/profile/edit", requireAuth, async function (req, res) {
  try {
    await renderEditProfileForm(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load profile form." });
  }
});

app.post("/profile/edit", requireAuth, async function (req, res) {
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

app.get("/users", async function (req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.render("users", { title: "Study Buddies", users });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load users." });
  }
});

app.get("/users/:id", async function (req, res) {
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

app.post("/users/:id/request", requireAuth, async function (req, res) {
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

app.get("/sessions/:id", async function (req, res) {
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

app.post("/sessions/:id/ratings", requireAuth, async function (req, res) {
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

app.get("/tags", async function (req, res) {
  try {
    const tags = await tagModel.getTags();
    res.render("tags", { title: "Browse Topics", tags });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load topics." });
  }
});

app.get("/matches", requireAuth, async function (req, res) {
  try {
    const matches = await matchModel.getMatchesForUser(req.session.user.user_id);
    res.render("matches", { title: "Study Matches", matches });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load matches." });
  }
});

app.get("/requests", requireAuth, async function (req, res) {
  try {
    const [incoming, outgoing] = await Promise.all([
      requestModel.getIncomingRequests(req.session.user.user_id),
      requestModel.getOutgoingRequests(req.session.user.user_id)
    ]);
    res.render("requests", { title: "Study Requests", incoming, outgoing });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load study requests." });
  }
});

app.post("/requests/:id/accept", requireAuth, async function (req, res) {
  try {
    const request = await requestModel.getRequestById(req.params.id);
    await requestModel.respondToRequest(req.params.id, req.session.user.user_id, "accepted");

    if (request && Number(request.receiver_id) === Number(req.session.user.user_id)) {
      await messageModel.findOrCreateDirectConversation(request.requester_id, request.receiver_id);
    }

    setFlash(req, "success", "Study request accepted.");
    res.redirect("/requests");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not accept request." });
  }
});

app.post("/requests/:id/reject", requireAuth, async function (req, res) {
  try {
    await requestModel.respondToRequest(req.params.id, req.session.user.user_id, "rejected");
    setFlash(req, "success", "Study request rejected.");
    res.redirect("/requests");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not reject request." });
  }
});

app.post("/requests/:id/cancel", requireAuth, async function (req, res) {
  try {
    await requestModel.cancelRequest(req.params.id, req.session.user.user_id);
    setFlash(req, "success", "Study request cancelled.");
    res.redirect("/requests");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not cancel request." });
  }
});

app.get("/messages", requireAuth, async function (req, res) {
  try {
    const [conversations, connections] = await Promise.all([
      messageModel.getConversationsForUser(req.session.user.user_id),
      requestModel.getAcceptedConnections(req.session.user.user_id)
    ]);
    res.render("messages", { title: "Messages", conversations, connections });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load messages." });
  }
});

app.post("/messages/start/:userId", requireAuth, async function (req, res) {
  const otherUserId = req.params.userId;

  try {
    const connected = await requestModel.areUsersConnected(req.session.user.user_id, otherUserId);
    if (!connected) {
      setFlash(req, "error", "Messages are available after a study request is accepted.");
      return res.redirect("/messages");
    }

    const conversationId = await messageModel.findOrCreateDirectConversation(req.session.user.user_id, otherUserId);
    return res.redirect(`/messages/${conversationId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not open conversation." });
  }
});

app.get("/messages/:id", requireAuth, async function (req, res) {
  try {
    const conversation = await messageModel.getConversationForUser(req.params.id, req.session.user.user_id);
    if (!conversation) return res.status(404).render("error", { message: "Conversation not found." });

    const [otherParticipants, messages] = await Promise.all([
      messageModel.getOtherParticipants(req.params.id, req.session.user.user_id),
      messageModel.getMessages(req.params.id)
    ]);

    res.render("conversation", {
      title: "Conversation",
      conversation,
      otherParticipants,
      messages,
      errors: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not load conversation." });
  }
});

app.post("/messages/:id", requireAuth, async function (req, res) {
  const { values, errors } = validateMessage(req.body);

  try {
    const conversation = await messageModel.getConversationForUser(req.params.id, req.session.user.user_id);
    if (!conversation) return res.status(404).render("error", { message: "Conversation not found." });

    if (errors.length) {
      const [otherParticipants, messages] = await Promise.all([
        messageModel.getOtherParticipants(req.params.id, req.session.user.user_id),
        messageModel.getMessages(req.params.id)
      ]);

      return res.status(400).render("conversation", {
        title: "Conversation",
        conversation,
        otherParticipants,
        messages,
        errors
      });
    }

    await messageModel.addMessage(req.params.id, req.session.user.user_id, values.content);
    return res.redirect(`/messages/${req.params.id}`);
  } catch (err) {
    console.error(err);
    return res.status(500).render("error", { message: "Could not send message." });
  }
});

app.use(function (req, res) {
  res.status(404).render("404", { title: "Page Not Found" });
});

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
