const db = require('../services/db');

async function getTags() {
  return await db.query(`
    SELECT topic_list.tag, COUNT(ss.session_id) AS total
    FROM (
      SELECT topic_name AS tag
      FROM topic
      UNION
      SELECT topic AS tag
      FROM study_session
      WHERE topic IS NOT NULL AND TRIM(topic) <> ''
    ) AS topic_list
    LEFT JOIN study_session ss ON ss.topic = topic_list.tag
    GROUP BY topic_list.tag
    ORDER BY total DESC, topic_list.tag ASC
  `);
}

async function createTopic(topicName, createdBy) {
  const result = await db.query(`
    INSERT IGNORE INTO topic (topic_name, created_by)
    VALUES (?, ?)
  `, [topicName, createdBy]);

  return result.affectedRows === 1;
}

module.exports = {
  createTopic,
  getTags
};
