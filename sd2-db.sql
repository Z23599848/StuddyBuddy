-- StudyBuddy Schema (MySQL 8 / phpMyAdmin importable)
-- Replaces test_table with the ERD-based schema

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Keep consistent charset/collation
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- CORE STRUCTURE
-- --------------------------------------------------------

CREATE TABLE `university` (
  `university_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NULL,
  PRIMARY KEY (`university_id`),
  UNIQUE KEY `uq_university_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `department` (
  `department_id` INT NOT NULL AUTO_INCREMENT,
  `university_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`department_id`),
  KEY `idx_department_university_id` (`university_id`),
  UNIQUE KEY `uq_department_university_name` (`university_id`, `name`),
  CONSTRAINT `fk_department_university`
    FOREIGN KEY (`university_id`) REFERENCES `university` (`university_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `university_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `academic_level` VARCHAR(100) NULL,
  `bio` TEXT NULL,
  `study_preferences` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `idx_user_university_id` (`university_id`),
  KEY `idx_user_department_id` (`department_id`),
  CONSTRAINT `fk_user_university`
    FOREIGN KEY (`university_id`) REFERENCES `university` (`university_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_department`
    FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `course` (
  `course_id` INT NOT NULL AUTO_INCREMENT,
  `department_id` INT NOT NULL,
  `course_code` VARCHAR(50) NOT NULL,
  `course_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`course_id`),
  KEY `idx_course_department_id` (`department_id`),
  UNIQUE KEY `uq_course_department_code` (`department_id`, `course_code`),
  CONSTRAINT `fk_course_department`
    FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `enrollment` (
  `enrollment_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `semester` VARCHAR(20) NOT NULL,
  `year` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`enrollment_id`),
  KEY `idx_enrollment_user_id` (`user_id`),
  KEY `idx_enrollment_course_id` (`course_id`),
  UNIQUE KEY `uq_enrollment_user_course_term` (`user_id`, `course_id`, `semester`, `year`),
  CONSTRAINT `fk_enrollment_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollment_course`
    FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `skill` (
  `skill_id` INT NOT NULL AUTO_INCREMENT,
  `skill_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`skill_id`),
  UNIQUE KEY `uq_skill_name` (`skill_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_skill` (
  `user_id` INT NOT NULL,
  `skill_id` INT NOT NULL,
  `proficiency_level` VARCHAR(50) NULL,
  PRIMARY KEY (`user_id`, `skill_id`),
  KEY `idx_user_skill_skill_id` (`skill_id`),
  CONSTRAINT `fk_user_skill_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_skill_skill`
    FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `availability` (
  `availability_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `day_of_week` VARCHAR(20) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  PRIMARY KEY (`availability_id`),
  KEY `idx_availability_user_id` (`user_id`),
  KEY `idx_availability_day_time` (`day_of_week`, `start_time`, `end_time`),
  CONSTRAINT `fk_availability_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- PROJECTS
-- --------------------------------------------------------

CREATE TABLE `project` (
  `project_id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `deadline` DATETIME NULL,
  PRIMARY KEY (`project_id`),
  KEY `idx_project_course_id` (`course_id`),
  CONSTRAINT `fk_project_course`
    FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `project_member` (
  `project_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `role` VARCHAR(100) NULL,
  PRIMARY KEY (`project_id`, `user_id`),
  KEY `idx_project_member_user_id` (`user_id`),
  CONSTRAINT `fk_project_member_project`
    FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_project_member_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- STUDY SESSIONS
-- --------------------------------------------------------

CREATE TABLE `study_session` (
  `session_id` INT NOT NULL AUTO_INCREMENT,
  `created_by` INT NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NULL,
  `scheduled_time` DATETIME NOT NULL,
  `max_participants` INT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_study_session_created_by` (`created_by`),
  KEY `idx_study_session_scheduled_time` (`scheduled_time`),
  CONSTRAINT `fk_study_session_creator`
    FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `session_participant` (
  `session_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'joined',
  PRIMARY KEY (`session_id`, `user_id`),
  KEY `idx_session_participant_user_id` (`user_id`),
  CONSTRAINT `fk_session_participant_session`
    FOREIGN KEY (`session_id`) REFERENCES `study_session` (`session_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_session_participant_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `session_rating` (
  `rating_id` INT NOT NULL AUTO_INCREMENT,
  `session_id` INT NOT NULL,
  `rated_by` INT NOT NULL,
  `rated_user_id` INT NOT NULL,
  `score` TINYINT NOT NULL,
  `feedback` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `uq_rating_once` (`session_id`, `rated_by`, `rated_user_id`),
  KEY `idx_session_rating_session_id` (`session_id`),
  KEY `idx_session_rating_rated_by` (`rated_by`),
  KEY `idx_session_rating_rated_user_id` (`rated_user_id`),
  CONSTRAINT `fk_session_rating_session`
    FOREIGN KEY (`session_id`) REFERENCES `study_session` (`session_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_session_rating_rated_by`
    FOREIGN KEY (`rated_by`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_session_rating_rated_user`
    FOREIGN KEY (`rated_user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_session_rating_score`
    CHECK (`score` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- SOCIAL FOLLOW SYSTEM
-- --------------------------------------------------------

CREATE TABLE `follow` (
  `follower_id` INT NOT NULL,
  `following_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`, `following_id`),
  KEY `idx_follow_following_id` (`following_id`),
  CONSTRAINT `fk_follow_follower`
    FOREIGN KEY (`follower_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_follow_following`
    FOREIGN KEY (`following_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `study_request` (
  `request_id` INT NOT NULL AUTO_INCREMENT,
  `requester_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `message` TEXT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` DATETIME NULL,
  PRIMARY KEY (`request_id`),
  KEY `idx_study_request_requester_id` (`requester_id`),
  KEY `idx_study_request_receiver_id` (`receiver_id`),
  KEY `idx_study_request_status` (`status`),
  CONSTRAINT `fk_study_request_requester`
    FOREIGN KEY (`requester_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_study_request_receiver`
    FOREIGN KEY (`receiver_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_study_request_status`
    CHECK (`status` IN ('pending', 'accepted', 'rejected', 'cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- SOCIAL POSTS
-- --------------------------------------------------------

CREATE TABLE `post` (
  `post_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `caption` TEXT NULL,
  `visibility` VARCHAR(50) NOT NULL DEFAULT 'public',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `idx_post_user_id` (`user_id`),
  KEY `idx_post_created_at` (`created_at`),
  CONSTRAINT `fk_post_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `media` (
  `media_id` INT NOT NULL AUTO_INCREMENT,
  `post_id` INT NOT NULL,
  `media_url` VARCHAR(2048) NOT NULL,
  `media_type` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`media_id`),
  KEY `idx_media_post_id` (`post_id`),
  CONSTRAINT `fk_media_post`
    FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `comment` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `idx_comment_post_id` (`post_id`),
  KEY `idx_comment_user_id` (`user_id`),
  KEY `idx_comment_created_at` (`created_at`),
  CONSTRAINT `fk_comment_post`
    FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `post_like` (
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `post_id`),
  KEY `idx_post_like_post_id` (`post_id`),
  CONSTRAINT `fk_post_like_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_post_like_post`
    FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- MESSAGING SYSTEM
-- --------------------------------------------------------

CREATE TABLE `conversation` (
  `conversation_id` INT NOT NULL AUTO_INCREMENT,
  `conversation_type` VARCHAR(50) NOT NULL, -- e.g. 'direct' or 'group'
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `idx_conversation_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `conversation_participant` (
  `conversation_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`, `user_id`),
  KEY `idx_conversation_participant_user_id` (`user_id`),
  CONSTRAINT `fk_conversation_participant_conversation`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conversation_participant_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `message` (
  `message_id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`message_id`),
  KEY `idx_message_conversation_id` (`conversation_id`),
  KEY `idx_message_sender_id` (`sender_id`),
  KEY `idx_message_sent_at` (`sent_at`),
  CONSTRAINT `fk_message_conversation`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_message_sender`
    FOREIGN KEY (`sender_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT;
