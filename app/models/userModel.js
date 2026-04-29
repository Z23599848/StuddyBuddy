const db = require('../services/db');

async function getAllUsers() {
  return await db.query(`
    SELECT u.user_id, u.first_name, u.last_name, u.academic_level,
           d.name AS department, uni.name AS university,
           COALESCE(r.rating_average, 0) AS rating_average,
           COALESCE(r.rating_count, 0) AS rating_count,
           COALESCE(p.points, 0) AS points
    FROM user u
    JOIN department d   ON u.department_id  = d.department_id
    JOIN university uni ON u.university_id   = uni.university_id
    LEFT JOIN (
      SELECT rated_user_id, ROUND(AVG(score), 1) AS rating_average, COUNT(*) AS rating_count
      FROM session_rating
      GROUP BY rated_user_id
    ) r ON u.user_id = r.rated_user_id
    LEFT JOIN (
      SELECT user_id, SUM(points) AS points
      FROM (
        SELECT requester_id AS user_id, COUNT(*) * 10 AS points
        FROM study_request
        WHERE status = 'accepted'
        GROUP BY requester_id
        UNION ALL
        SELECT receiver_id AS user_id, COUNT(*) * 10 AS points
        FROM study_request
        WHERE status = 'accepted'
        GROUP BY receiver_id
        UNION ALL
        SELECT rated_user_id AS user_id, SUM(score) AS points
        FROM session_rating
        GROUP BY rated_user_id
      ) earned_points
      GROUP BY user_id
    ) p ON u.user_id = p.user_id
    ORDER BY u.first_name ASC
  `);
}

async function getUserById(uid) {
  const [user] = await db.query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email,
           u.university_id, u.department_id, u.academic_level,
           u.bio, u.study_preferences, u.created_at,
           d.name AS department, uni.name AS university,
           COALESCE(r.rating_average, 0) AS rating_average,
           COALESCE(r.rating_count, 0) AS rating_count,
           COALESCE(p.points, 0) AS points
    FROM user u
    JOIN department d   ON u.department_id  = d.department_id
    JOIN university uni ON u.university_id   = uni.university_id
    LEFT JOIN (
      SELECT rated_user_id, ROUND(AVG(score), 1) AS rating_average, COUNT(*) AS rating_count
      FROM session_rating
      GROUP BY rated_user_id
    ) r ON u.user_id = r.rated_user_id
    LEFT JOIN (
      SELECT user_id, SUM(points) AS points
      FROM (
        SELECT requester_id AS user_id, COUNT(*) * 10 AS points
        FROM study_request
        WHERE status = 'accepted'
        GROUP BY requester_id
        UNION ALL
        SELECT receiver_id AS user_id, COUNT(*) * 10 AS points
        FROM study_request
        WHERE status = 'accepted'
        GROUP BY receiver_id
        UNION ALL
        SELECT rated_user_id AS user_id, SUM(score) AS points
        FROM session_rating
        GROUP BY rated_user_id
      ) earned_points
      GROUP BY user_id
    ) p ON u.user_id = p.user_id
    WHERE u.user_id = ?
  `, [uid]);
  return user;
}

async function getUserByEmail(email) {
  const [user] = await db.query(`
    SELECT user_id, first_name, last_name, email, password_hash
    FROM user
    WHERE email = ?
  `, [email]);
  return user;
}

async function createUser(user) {
  const result = await db.query(`
    INSERT INTO user (
      university_id, department_id, first_name, last_name, email,
      password_hash, academic_level, bio, study_preferences
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    user.university_id,
    user.department_id,
    user.first_name,
    user.last_name,
    user.email,
    user.password_hash,
    user.academic_level || null,
    user.bio || null,
    user.study_preferences || null
  ]);

  return result.insertId;
}

async function updatePasswordHash(uid, passwordHash) {
  return await db.query(`
    UPDATE user
    SET password_hash = ?
    WHERE user_id = ?
  `, [passwordHash, uid]);
}

async function getUserSkills(uid) {
  return await db.query(`
    SELECT s.skill_name, us.proficiency_level 
    FROM user_skill us
    JOIN skill s ON us.skill_id = s.skill_id 
    WHERE us.user_id = ?
  `, [uid]);
}

async function getUserCourses(uid) {
  return await db.query(`
    SELECT c.course_code, c.course_name, e.semester, e.year
    FROM enrollment e 
    JOIN course c ON e.course_id = c.course_id 
    WHERE e.user_id = ?
  `, [uid]);
}

async function getUserAvailability(uid) {
  return await db.query(`
    SELECT availability_id, day_of_week, start_time, end_time
    FROM availability
    WHERE user_id = ?
    ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
             start_time
  `, [uid]);
}

async function getUserRatings(uid) {
  return await db.query(`
    SELECT sr.score, sr.feedback, sr.created_at, ss.topic,
           u.first_name AS reviewer_first_name, u.last_name AS reviewer_last_name
    FROM session_rating sr
    JOIN user u ON sr.rated_by = u.user_id
    JOIN study_session ss ON sr.session_id = ss.session_id
    WHERE sr.rated_user_id = ?
    ORDER BY sr.created_at DESC
  `, [uid]);
}

async function getUniversities() {
  return await db.query(`
    SELECT university_id, name
    FROM university
    ORDER BY name ASC
  `);
}

async function getDepartments() {
  return await db.query(`
    SELECT d.department_id, d.university_id, d.name, u.name AS university_name
    FROM department d
    JOIN university u ON d.university_id = u.university_id
    ORDER BY u.name ASC, d.name ASC
  `);
}

async function getSkills() {
  return await db.query(`
    SELECT skill_id, skill_name
    FROM skill
    ORDER BY skill_name ASC
  `);
}

async function updateUserProfile(uid, profile) {
  return await db.query(`
    UPDATE user
    SET university_id = ?,
        department_id = ?,
        academic_level = ?,
        bio = ?,
        study_preferences = ?
    WHERE user_id = ?
  `, [
    profile.university_id,
    profile.department_id,
    profile.academic_level || null,
    profile.bio || null,
    profile.study_preferences || null,
    uid
  ]);
}

async function saveUserSkill(uid, skillName, proficiencyLevel) {
  if (!skillName) return null;

  await db.query(`
    INSERT IGNORE INTO skill (skill_name)
    VALUES (?)
  `, [skillName]);

  const [skill] = await db.query(`
    SELECT skill_id
    FROM skill
    WHERE skill_name = ?
  `, [skillName]);

  if (!skill) return null;

  await db.query(`
    INSERT INTO user_skill (user_id, skill_id, proficiency_level)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level)
  `, [uid, skill.skill_id, proficiencyLevel || null]);

  return skill.skill_id;
}

async function saveUserCourse(uid, departmentId, courseCode, courseName, semester, year) {
  if (!courseCode) return null;

  const cleanCourseCode = courseCode.toUpperCase();

  await db.query(`
    INSERT IGNORE INTO course (department_id, course_code, course_name)
    VALUES (?, ?, ?)
  `, [departmentId, cleanCourseCode, courseName || cleanCourseCode]);

  const [course] = await db.query(`
    SELECT course_id
    FROM course
    WHERE department_id = ? AND course_code = ?
  `, [departmentId, cleanCourseCode]);

  if (!course) return null;

  await db.query(`
    INSERT INTO enrollment (user_id, course_id, semester, year)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE semester = VALUES(semester), year = VALUES(year)
  `, [
    uid,
    course.course_id,
    semester || 'Spring',
    year || new Date().getFullYear().toString()
  ]);

  return course.course_id;
}

async function replaceUserAvailability(uid, availabilityRows) {
  await db.query(`
    DELETE FROM availability
    WHERE user_id = ?
  `, [uid]);

  for (const slot of availabilityRows) {
    await db.query(`
      INSERT INTO availability (user_id, day_of_week, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `, [uid, slot.day_of_week, slot.start_time, slot.end_time]);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updatePasswordHash,
  getUserSkills,
  getUserCourses,
  getUserAvailability,
  getUserRatings,
  getUniversities,
  getDepartments,
  getSkills,
  updateUserProfile,
  saveUserSkill,
  saveUserCourse,
  replaceUserAvailability
};
