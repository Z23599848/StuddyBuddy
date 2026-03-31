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

-- Users (passwords are hashed, placeholder hash used for demo)
INSERT IGNORE INTO user (user_id, university_id, department_id, first_name, last_name, email, password_hash, academic_level, bio) VALUES
(1, 1, 1, 'Ali',     'Hassan',  'ali@uni.ac.uk',    'hashed_pw', 'Year 2', 'Group leader and backend developer. Enjoys Node.js.'),
(2, 1, 1, 'Nilay',   'Sharma',  'nilay@uni.ac.uk',  'hashed_pw', 'Year 2', 'Interested in UX and ethical software design.'),
(3, 1, 2, 'Lan',     'Nguyen',  'lan@uni.ac.uk',    'hashed_pw', 'Year 2', 'Passionate about design and meeting coordination.'),
(4, 1, 1, 'Maywon',  'Tan',     'maywon@uni.ac.uk', 'hashed_pw', 'Year 2', 'Focuses on user stories and personas.'),
(5, 2, 3, 'Tavishi', 'Patel',   'tavishi@uni.ac.uk','hashed_pw', 'Year 2', 'Project management and Kanban board maintenance.');

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
