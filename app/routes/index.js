"use strict";

const express = require("express");

const authRoutes = require("./authRoutes");
const homeRoutes = require("./homeRoutes");
const matchRoutes = require("./matchRoutes");
const messageRoutes = require("./messageRoutes");
const profileRoutes = require("./profileRoutes");
const requestRoutes = require("./requestRoutes");
const sessionRoutes = require("./sessionRoutes");
const tagRoutes = require("./tagRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/", homeRoutes);
router.use("/", authRoutes);
router.use("/", profileRoutes);
router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/tags", tagRoutes);
router.use("/matches", matchRoutes);
router.use("/requests", requestRoutes);
router.use("/messages", messageRoutes);

module.exports = router;
