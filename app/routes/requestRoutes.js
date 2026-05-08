"use strict";

const express = require("express");

const messageModel = require("../models/messageModel");
const requestModel = require("../models/requestModel");
const {
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

router.use(requireAuth);

// Display incoming and outgoing study requests for the signed-in user.
router.get("/", async function (req, res) {
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

// Accept a study request and create a direct conversation for the new connection.
router.post("/:id/accept", async function (req, res) {
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

// Reject a study request received by the signed-in user.
router.post("/:id/reject", async function (req, res) {
  try {
    await requestModel.respondToRequest(req.params.id, req.session.user.user_id, "rejected");
    setFlash(req, "success", "Study request rejected.");
    res.redirect("/requests");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not reject request." });
  }
});

// Cancel a study request sent by the signed-in user.
router.post("/:id/cancel", async function (req, res) {
  try {
    await requestModel.cancelRequest(req.params.id, req.session.user.user_id);
    setFlash(req, "success", "Study request cancelled.");
    res.redirect("/requests");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Could not cancel request." });
  }
});

module.exports = router;
