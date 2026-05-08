"use strict";

const express = require("express");

const messageModel = require("../models/messageModel");
const requestModel = require("../models/requestModel");
const { validateMessage } = require("../utils/validation");
const {
  requireAuth,
  setFlash
} = require("./helpers");

const router = express.Router();

router.use(requireAuth);

// List direct-message conversations and accepted connections.
router.get("/", async function (req, res) {
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

// Start or reopen a direct conversation with an accepted connection.
router.post("/start/:userId", async function (req, res) {
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

// Display one conversation and its message history.
router.get("/:id", async function (req, res) {
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

// Add a new message to a conversation the signed-in user belongs to.
router.post("/:id", async function (req, res) {
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

module.exports = router;
