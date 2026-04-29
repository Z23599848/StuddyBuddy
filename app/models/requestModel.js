const db = require('../services/db');

async function getExistingActiveRequest(requesterId, receiverId) {
  const [request] = await db.query(`
    SELECT request_id, status
    FROM study_request
    WHERE requester_id = ?
      AND receiver_id = ?
      AND status IN ('pending', 'accepted')
    ORDER BY created_at DESC
    LIMIT 1
  `, [requesterId, receiverId]);

  return request;
}

async function getRequestById(requestId) {
  const [request] = await db.query(`
    SELECT request_id, requester_id, receiver_id, message, status
    FROM study_request
    WHERE request_id = ?
  `, [requestId]);

  return request;
}

async function createRequest(requesterId, receiverId, message) {
  const result = await db.query(`
    INSERT INTO study_request (requester_id, receiver_id, message, status)
    VALUES (?, ?, ?, 'pending')
  `, [requesterId, receiverId, message || null]);

  return result.insertId;
}

async function getIncomingRequests(uid) {
  return await db.query(`
    SELECT sr.request_id, sr.message, sr.status, sr.created_at, sr.responded_at,
           u.user_id AS other_user_id, u.first_name, u.last_name
    FROM study_request sr
    JOIN user u ON sr.requester_id = u.user_id
    WHERE sr.receiver_id = ?
    ORDER BY sr.created_at DESC
  `, [uid]);
}

async function getOutgoingRequests(uid) {
  return await db.query(`
    SELECT sr.request_id, sr.message, sr.status, sr.created_at, sr.responded_at,
           u.user_id AS other_user_id, u.first_name, u.last_name
    FROM study_request sr
    JOIN user u ON sr.receiver_id = u.user_id
    WHERE sr.requester_id = ?
    ORDER BY sr.created_at DESC
  `, [uid]);
}

async function respondToRequest(requestId, receiverId, status) {
  return await db.query(`
    UPDATE study_request
    SET status = ?, responded_at = CURRENT_TIMESTAMP
    WHERE request_id = ?
      AND receiver_id = ?
      AND status = 'pending'
  `, [status, requestId, receiverId]);
}

async function cancelRequest(requestId, requesterId) {
  return await db.query(`
    UPDATE study_request
    SET status = 'cancelled', responded_at = CURRENT_TIMESTAMP
    WHERE request_id = ?
      AND requester_id = ?
      AND status = 'pending'
  `, [requestId, requesterId]);
}

async function areUsersConnected(userA, userB) {
  const [connection] = await db.query(`
    SELECT request_id
    FROM study_request
    WHERE status = 'accepted'
      AND (
        (requester_id = ? AND receiver_id = ?)
        OR
        (requester_id = ? AND receiver_id = ?)
      )
    LIMIT 1
  `, [userA, userB, userB, userA]);

  return Boolean(connection);
}

async function getAcceptedConnections(uid) {
  return await db.query(`
    SELECT sr.request_id,
           CASE WHEN sr.requester_id = ? THEN sr.receiver_id ELSE sr.requester_id END AS other_user_id,
           u.first_name, u.last_name
    FROM study_request sr
    JOIN user u
      ON u.user_id = CASE WHEN sr.requester_id = ? THEN sr.receiver_id ELSE sr.requester_id END
    WHERE sr.status = 'accepted'
      AND (sr.requester_id = ? OR sr.receiver_id = ?)
    ORDER BY u.first_name ASC
  `, [uid, uid, uid, uid]);
}

module.exports = {
  getRequestById,
  getExistingActiveRequest,
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToRequest,
  cancelRequest,
  areUsersConnected,
  getAcceptedConnections
};
