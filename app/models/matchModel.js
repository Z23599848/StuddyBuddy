const db = require('../services/db');

async function getMatchesForUser(uid) {
  return await db.query(`
    SELECT u.user_id, u.first_name, u.last_name, u.academic_level,
           d.name AS department, uni.name AS university,
           COALESCE(course_matches.total, 0) AS shared_courses,
           COALESCE(skill_matches.total, 0) AS shared_skills,
           COALESCE(availability_matches.total, 0) AS shared_availability,
           CASE WHEN me.department_id = u.department_id THEN 1 ELSE 0 END AS same_department,
           (
             COALESCE(course_matches.total, 0) * 3 +
             COALESCE(skill_matches.total, 0) * 2 +
             COALESCE(availability_matches.total, 0) +
             CASE WHEN me.department_id = u.department_id THEN 1 ELSE 0 END
           ) AS match_score
    FROM user u
    JOIN user me ON me.user_id = ?
    JOIN department d ON u.department_id = d.department_id
    JOIN university uni ON u.university_id = uni.university_id
    LEFT JOIN (
      SELECT e2.user_id, COUNT(DISTINCT e2.course_id) AS total
      FROM enrollment e1
      JOIN enrollment e2 ON e1.course_id = e2.course_id
      WHERE e1.user_id = ? AND e2.user_id <> ?
      GROUP BY e2.user_id
    ) course_matches ON u.user_id = course_matches.user_id
    LEFT JOIN (
      SELECT us2.user_id, COUNT(DISTINCT us2.skill_id) AS total
      FROM user_skill us1
      JOIN user_skill us2 ON us1.skill_id = us2.skill_id
      WHERE us1.user_id = ? AND us2.user_id <> ?
      GROUP BY us2.user_id
    ) skill_matches ON u.user_id = skill_matches.user_id
    LEFT JOIN (
      SELECT a2.user_id, COUNT(*) AS total
      FROM availability a1
      JOIN availability a2
        ON a1.day_of_week = a2.day_of_week
       AND a1.start_time < a2.end_time
       AND a2.start_time < a1.end_time
      WHERE a1.user_id = ? AND a2.user_id <> ?
      GROUP BY a2.user_id
    ) availability_matches ON u.user_id = availability_matches.user_id
    WHERE u.user_id <> ?
    ORDER BY match_score DESC, shared_courses DESC, shared_skills DESC, u.first_name ASC
  `, [uid, uid, uid, uid, uid, uid, uid, uid]);
}

module.exports = {
  getMatchesForUser
};
