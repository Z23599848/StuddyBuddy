const db = require('../services/db');

async function getAllSessions(tag = null) {
  const params = [];
  let sql = `
    SELECT ss.session_id, ss.topic, ss.location, ss.scheduled_time,
           ss.max_participants, u.first_name, u.last_name,
           COUNT(sp.user_id) AS participant_count
    FROM study_session ss
    JOIN user u ON ss.created_by = u.user_id
    LEFT JOIN session_participant sp ON ss.session_id = sp.session_id
  `;
  if (tag) { 
    sql += " WHERE ss.topic LIKE ?"; 
    params.push(`%${tag}%`); 
  }
  sql += `
    GROUP BY ss.session_id, ss.topic, ss.location, ss.scheduled_time,
             ss.max_participants, u.first_name, u.last_name
    ORDER BY ss.scheduled_time ASC
  `;
  return await db.query(sql, params);
}

async function getSessionById(sid) {
  const [session] = await db.query(`
    SELECT ss.session_id, ss.topic, ss.location, ss.scheduled_time,
           ss.max_participants, u.first_name, u.last_name, u.user_id AS creator_id
    FROM study_session ss
    JOIN user u ON ss.created_by = u.user_id 
    WHERE ss.session_id = ?
  `, [sid]);
  return session;
}

async function getSessionParticipants(sid) {
  return await db.query(`
    SELECT u.user_id, u.first_name, u.last_name, sp.status
    FROM session_participant sp
    JOIN user u ON sp.user_id = u.user_id 
    WHERE sp.session_id = ?
  `, [sid]);
}

module.exports = {
  getAllSessions,
  getSessionById,
  getSessionParticipants
};
