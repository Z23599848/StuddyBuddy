const db = require('../services/db');

async function columnExists(tableName, columnName) {
  const [column] = await db.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
  `, [tableName, columnName]);

  return Boolean(column);
}

async function ensureColumn(tableName, columnName, alterSql) {
  if (!(await columnExists(tableName, columnName))) {
    await db.query(alterSql);
  }
}

async function ensureSprint4Schema() {
  await ensureColumn('user', 'study_preferences', `
    ALTER TABLE \`user\`
    ADD COLUMN \`study_preferences\` TEXT NULL AFTER \`bio\`
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS availability (
      availability_id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      day_of_week VARCHAR(20) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      PRIMARY KEY (availability_id),
      KEY idx_availability_user_id (user_id),
      KEY idx_availability_day_time (day_of_week, start_time, end_time),
      CONSTRAINT fk_availability_user
        FOREIGN KEY (user_id) REFERENCES \`user\` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS study_request (
      request_id INT NOT NULL AUTO_INCREMENT,
      requester_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME NULL,
      PRIMARY KEY (request_id),
      KEY idx_study_request_requester_id (requester_id),
      KEY idx_study_request_receiver_id (receiver_id),
      KEY idx_study_request_status (status),
      CONSTRAINT fk_study_request_requester
        FOREIGN KEY (requester_id) REFERENCES \`user\` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_study_request_receiver
        FOREIGN KEY (receiver_id) REFERENCES \`user\` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT chk_study_request_status
        CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS session_rating (
      rating_id INT NOT NULL AUTO_INCREMENT,
      session_id INT NOT NULL,
      rated_by INT NOT NULL,
      rated_user_id INT NOT NULL,
      score TINYINT NOT NULL,
      feedback TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (rating_id),
      UNIQUE KEY uq_rating_once (session_id, rated_by, rated_user_id),
      KEY idx_session_rating_session_id (session_id),
      KEY idx_session_rating_rated_by (rated_by),
      KEY idx_session_rating_rated_user_id (rated_user_id),
      CONSTRAINT fk_session_rating_session
        FOREIGN KEY (session_id) REFERENCES study_session (session_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_session_rating_rated_by
        FOREIGN KEY (rated_by) REFERENCES \`user\` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_session_rating_rated_user
        FOREIGN KEY (rated_user_id) REFERENCES \`user\` (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT chk_session_rating_score
        CHECK (score BETWEEN 1 AND 5)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

module.exports = {
  ensureSprint4Schema
};
