const db = require('../services/db');

async function canUserRateSession(sessionId, uid) {
  const [row] = await db.query(`
    SELECT ss.session_id
    FROM study_session ss
    LEFT JOIN session_participant sp
      ON ss.session_id = sp.session_id
     AND sp.user_id = ?
    WHERE ss.session_id = ?
      AND ss.scheduled_time <= CURRENT_TIMESTAMP
      AND (ss.created_by = ? OR sp.user_id IS NOT NULL)
  `, [uid, sessionId, uid]);

  return Boolean(row);
}

async function getRateableUsers(sessionId, uid) {
  return await db.query(`
    SELECT DISTINCT u.user_id, u.first_name, u.last_name
    FROM (
      SELECT created_by AS user_id
      FROM study_session
      WHERE session_id = ?
      UNION
      SELECT user_id
      FROM session_participant
      WHERE session_id = ?
    ) involved_users
    JOIN user u ON involved_users.user_id = u.user_id
    WHERE u.user_id <> ?
    ORDER BY u.first_name ASC
  `, [sessionId, sessionId, uid]);
}

async function createOrUpdateRating(sessionId, ratedBy, ratedUserId, score, feedback) {
  const result = await db.query(`
    INSERT INTO session_rating (session_id, rated_by, rated_user_id, score, feedback)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      score = VALUES(score),
      feedback = VALUES(feedback),
      created_at = CURRENT_TIMESTAMP
  `, [sessionId, ratedBy, ratedUserId, score, feedback || null]);

  return result.insertId;
}

async function getSessionRatings(sessionId) {
  return await db.query(`
    SELECT sr.rating_id, sr.score, sr.feedback, sr.created_at,
           reviewer.first_name AS reviewer_first_name,
           reviewer.last_name AS reviewer_last_name,
           rated.first_name AS rated_first_name,
           rated.last_name AS rated_last_name
    FROM session_rating sr
    JOIN user reviewer ON sr.rated_by = reviewer.user_id
    JOIN user rated ON sr.rated_user_id = rated.user_id
    WHERE sr.session_id = ?
    ORDER BY sr.created_at DESC
  `, [sessionId]);
}

module.exports = {
  canUserRateSession,
  getRateableUsers,
  createOrUpdateRating,
  getSessionRatings
};
