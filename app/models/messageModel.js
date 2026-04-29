const db = require('../services/db');

async function getConversationsForUser(uid) {
  return await db.query(`
    SELECT c.conversation_id, c.created_at,
           other_user.user_id AS other_user_id,
           other_user.first_name, other_user.last_name,
           latest.content AS latest_message,
           latest.sent_at AS latest_sent_at
    FROM conversation c
    JOIN conversation_participant current_cp
      ON c.conversation_id = current_cp.conversation_id
     AND current_cp.user_id = ?
    JOIN conversation_participant other_cp
      ON c.conversation_id = other_cp.conversation_id
     AND other_cp.user_id <> ?
    JOIN user other_user ON other_cp.user_id = other_user.user_id
    LEFT JOIN message latest
      ON latest.message_id = (
        SELECT m.message_id
        FROM message m
        WHERE m.conversation_id = c.conversation_id
        ORDER BY m.sent_at DESC, m.message_id DESC
        LIMIT 1
      )
    WHERE c.conversation_type = 'direct'
    ORDER BY COALESCE(latest.sent_at, c.created_at) DESC
  `, [uid, uid]);
}

async function findDirectConversation(userA, userB) {
  const [conversation] = await db.query(`
    SELECT c.conversation_id
    FROM conversation c
    JOIN conversation_participant cp ON c.conversation_id = cp.conversation_id
    WHERE c.conversation_type = 'direct'
      AND cp.user_id IN (?, ?)
    GROUP BY c.conversation_id
    HAVING COUNT(DISTINCT cp.user_id) = 2
    LIMIT 1
  `, [userA, userB]);

  return conversation;
}

async function createDirectConversation(userA, userB) {
  const result = await db.query(`
    INSERT INTO conversation (conversation_type)
    VALUES ('direct')
  `);

  await db.query(`
    INSERT INTO conversation_participant (conversation_id, user_id)
    VALUES (?, ?), (?, ?)
  `, [result.insertId, userA, result.insertId, userB]);

  return result.insertId;
}

async function findOrCreateDirectConversation(userA, userB) {
  const existing = await findDirectConversation(userA, userB);
  if (existing) return existing.conversation_id;

  return await createDirectConversation(userA, userB);
}

async function getConversationForUser(conversationId, uid) {
  const [conversation] = await db.query(`
    SELECT c.conversation_id, c.conversation_type, c.created_at
    FROM conversation c
    JOIN conversation_participant cp ON c.conversation_id = cp.conversation_id
    WHERE c.conversation_id = ?
      AND cp.user_id = ?
  `, [conversationId, uid]);

  return conversation;
}

async function getOtherParticipants(conversationId, uid) {
  return await db.query(`
    SELECT u.user_id, u.first_name, u.last_name
    FROM conversation_participant cp
    JOIN user u ON cp.user_id = u.user_id
    WHERE cp.conversation_id = ?
      AND cp.user_id <> ?
    ORDER BY u.first_name ASC
  `, [conversationId, uid]);
}

async function getMessages(conversationId) {
  return await db.query(`
    SELECT m.message_id, m.content, m.sent_at, m.is_read,
           u.user_id AS sender_id, u.first_name, u.last_name
    FROM message m
    JOIN user u ON m.sender_id = u.user_id
    WHERE m.conversation_id = ?
    ORDER BY m.sent_at ASC, m.message_id ASC
  `, [conversationId]);
}

async function addMessage(conversationId, senderId, content) {
  const result = await db.query(`
    INSERT INTO message (conversation_id, sender_id, content)
    VALUES (?, ?, ?)
  `, [conversationId, senderId, content]);

  return result.insertId;
}

module.exports = {
  getConversationsForUser,
  findOrCreateDirectConversation,
  getConversationForUser,
  getOtherParticipants,
  getMessages,
  addMessage
};
