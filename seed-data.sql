-- StudyBuddy Seed Data – Sprint 3 Demo
-- Run in phpMyAdmin at http://localhost:8081 after docker-compose up

USE `sd2-db`;

-- Universities
INSERT IGNORE INTO university (university_id, name, location) VALUES
(1, 'University of Roehampton', 'London'),
(2, 'University of Greenwich',  'London');

-- Departments
INSERT IGNORE INTO department (department_id, university_id, name) VALUES
(1, 1, 'Computer Science'),
(2, 1, 'Business and Computing'),
(3, 2, 'Software Engineering');

-- Users (demo password for seeded accounts: password123)
INSERT IGNORE INTO user (user_id, university_id, department_id, first_name, last_name, email, password_hash, academic_level, bio, study_preferences) VALUES
(1, 1, 1, 'Ali',     'Hassan',  'ali@uni.ac.uk',    'scrypt:studybuddy-demo-salt:af4db5098e73bef6b644ec01b7382bedb0f54cb6cf07433544d7f615c9e5f263a3a1ff172027c3d2ae3a837177d8a711e16e01ffd150a56a43d2b1dd8fce97f7', 'Year 2', 'Group leader and backend developer. Enjoys Node.js.', 'Prefers small in-person groups and practical coding sessions.'),
(2, 1, 1, 'Nilay',   'Sharma',  'nilay@uni.ac.uk',  'scrypt:studybuddy-demo-salt:af4db5098e73bef6b644ec01b7382bedb0f54cb6cf07433544d7f615c9e5f263a3a1ff172027c3d2ae3a837177d8a711e16e01ffd150a56a43d2b1dd8fce97f7', 'Year 2', 'Interested in UX and ethical software design.', 'Likes online planning calls followed by focused solo tasks.'),
(3, 1, 2, 'Lan',     'Nguyen',  'lan@uni.ac.uk',    'scrypt:studybuddy-demo-salt:af4db5098e73bef6b644ec01b7382bedb0f54cb6cf07433544d7f615c9e5f263a3a1ff172027c3d2ae3a837177d8a711e16e01ffd150a56a43d2b1dd8fce97f7', 'Year 2', 'Passionate about design and meeting coordination.', 'Prefers structured weekly sessions with clear goals.'),
(4, 1, 1, 'Maywon',  'Tan',     'maywon@uni.ac.uk', 'scrypt:studybuddy-demo-salt:af4db5098e73bef6b644ec01b7382bedb0f54cb6cf07433544d7f615c9e5f263a3a1ff172027c3d2ae3a837177d8a711e16e01ffd150a56a43d2b1dd8fce97f7', 'Year 2', 'Focuses on user stories and personas.', 'Likes short revision sessions and peer feedback.'),
(5, 2, 3, 'Tavishi', 'Patel',   'tavishi@uni.ac.uk','scrypt:studybuddy-demo-salt:af4db5098e73bef6b644ec01b7382bedb0f54cb6cf07433544d7f615c9e5f263a3a1ff172027c3d2ae3a837177d8a711e16e01ffd150a56a43d2b1dd8fce97f7', 'Year 2', 'Project management and Kanban board maintenance.', 'Prefers checklist-driven group study and deadline planning.');

UPDATE user
SET password_hash = 'scrypt:studybuddy-demo-salt:af4db5098e73bef6b644ec01b7382bedb0f54cb6cf07433544d7f615c9e5f263a3a1ff172027c3d2ae3a837177d8a711e16e01ffd150a56a43d2b1dd8fce97f7'
WHERE password_hash = 'hashed_pw';

-- Skills
INSERT IGNORE INTO skill (skill_id, skill_name) VALUES
(1, 'JavaScript'), (2, 'MySQL'), (3, 'HTML/CSS'),
(4, 'Node.js'), (5, 'Docker'), (6, 'UI Design'), (7, 'Project Management');

-- User Skills
INSERT IGNORE INTO user_skill (user_id, skill_id, proficiency_level) VALUES
(1, 1, 'Advanced'), (1, 2, 'Intermediate'), (1, 4, 'Intermediate'), (1, 5, 'Beginner'),
(2, 1, 'Intermediate'), (2, 3, 'Advanced'),
(3, 3, 'Advanced'), (3, 6, 'Intermediate'),
(4, 1, 'Beginner'),  (4, 3, 'Intermediate'),
(5, 7, 'Advanced'), (5, 5, 'Intermediate');

-- Availability
INSERT IGNORE INTO availability (availability_id, user_id, day_of_week, start_time, end_time) VALUES
(1, 1, 'Monday',    '10:00:00', '12:00:00'),
(2, 1, 'Wednesday', '14:00:00', '16:00:00'),
(3, 2, 'Monday',    '11:00:00', '13:00:00'),
(4, 2, 'Thursday',  '15:00:00', '17:00:00'),
(5, 3, 'Wednesday', '14:30:00', '16:30:00'),
(6, 3, 'Friday',    '10:00:00', '12:00:00'),
(7, 4, 'Monday',    '10:30:00', '12:30:00'),
(8, 4, 'Tuesday',   '13:00:00', '15:00:00'),
(9, 5, 'Wednesday', '13:30:00', '15:30:00'),
(10, 5, 'Friday',   '11:00:00', '13:00:00');

-- Courses
INSERT IGNORE INTO course (course_id, department_id, course_code, course_name) VALUES
(1, 1, 'CMP-N204-0', 'Software Engineering'),
(2, 1, 'CMP-N201-0', 'Database Systems'),
(3, 1, 'CMP-N211-0', 'Digital Forensics');

-- Enrollments
INSERT IGNORE INTO enrollment (user_id, course_id, semester, year) VALUES
(1, 1, 'Spring', '2026'), (1, 2, 'Spring', '2026'),
(2, 1, 'Spring', '2026'), (2, 3, 'Spring', '2026'),
(3, 1, 'Spring', '2026'),
(4, 1, 'Spring', '2026'), (4, 2, 'Spring', '2026'),
(5, 1, 'Spring', '2026');

-- Study Sessions
INSERT IGNORE INTO study_session (session_id, created_by, topic, location, scheduled_time, max_participants) VALUES
(1, 1, 'JavaScript', 'Library Room 3', '2026-04-01 10:00:00', 5),
(2, 2, 'MySQL',      'Online – Zoom',  '2026-04-02 14:00:00', 4),
(3, 3, 'Docker',     'Lab B104',       '2026-04-03 11:00:00', 6),
(4, 4, 'HTML/CSS',   'Café',           '2026-04-04 13:00:00', 3),
(5, 5, 'JavaScript', 'Library Study Pod', '2026-04-05 15:00:00', 4);

-- Session Participants
INSERT IGNORE INTO session_participant (session_id, user_id, status) VALUES
(1, 2, 'joined'), (1, 3, 'joined'),
(2, 1, 'joined'), (2, 4, 'joined'),
(3, 1, 'joined'), (3, 5, 'joined'),
(4, 2, 'joined'),
(5, 3, 'joined'), (5, 4, 'joined');

-- Study Requests
INSERT IGNORE INTO study_request (request_id, requester_id, receiver_id, message, status, created_at, responded_at) VALUES
(1, 1, 2, 'Want to revise JavaScript callbacks together this week?', 'accepted', '2026-03-25 09:00:00', '2026-03-25 11:00:00'),
(2, 4, 1, 'Can we work through the database assignment together?', 'pending', '2026-04-10 12:30:00', NULL),
(3, 5, 3, 'Would you like to plan our Sprint 4 evidence together?', 'accepted', '2026-04-11 10:00:00', '2026-04-11 13:00:00');

-- Conversations and Messages
INSERT IGNORE INTO conversation (conversation_id, conversation_type, created_at) VALUES
(1, 'direct', '2026-03-25 11:01:00'),
(2, 'direct', '2026-04-11 13:01:00');

INSERT IGNORE INTO conversation_participant (conversation_id, user_id, joined_at) VALUES
(1, 1, '2026-03-25 11:01:00'),
(1, 2, '2026-03-25 11:01:00'),
(2, 5, '2026-04-11 13:01:00'),
(2, 3, '2026-04-11 13:01:00');

INSERT IGNORE INTO message (message_id, conversation_id, sender_id, content, sent_at, is_read) VALUES
(1, 1, 1, 'Great, I will bring the notes from the JavaScript session.', '2026-03-25 11:05:00', TRUE),
(2, 1, 2, 'Perfect. I can prepare a few practice questions.', '2026-03-25 11:08:00', TRUE),
(3, 2, 5, 'I made a checklist for the Sprint 4 screenshots.', '2026-04-11 13:05:00', TRUE),
(4, 2, 3, 'Nice. I will review the meeting notes and design evidence.', '2026-04-11 13:12:00', FALSE);

-- Ratings
INSERT IGNORE INTO session_rating (rating_id, session_id, rated_by, rated_user_id, score, feedback) VALUES
(1, 1, 2, 1, 5, 'Clear explanations and helpful examples.'),
(2, 1, 3, 1, 4, 'Useful session and well organised.'),
(3, 3, 1, 5, 5, 'Great planning support and follow-up notes.');
