const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function text(value) {
  return (value || '').toString().trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPositiveInteger(value) {
  return /^\d+$/.test((value || '').toString()) && Number(value) > 0;
}

function hasMaxLength(value, max) {
  return text(value).length <= max;
}

function validateRegistration(body) {
  const values = {
    first_name: text(body.first_name),
    last_name: text(body.last_name),
    email: text(body.email).toLowerCase(),
    password: body.password || '',
    password_confirm: body.password_confirm || '',
    university_id: text(body.university_id),
    department_id: text(body.department_id),
    academic_level: text(body.academic_level),
    bio: text(body.bio),
    study_preferences: text(body.study_preferences)
  };
  const errors = [];

  if (!values.first_name) errors.push('First name is required.');
  if (!values.last_name) errors.push('Last name is required.');
  if (!isEmail(values.email)) errors.push('Enter a valid email address.');
  if (values.password.length < 8) errors.push('Password must be at least 8 characters.');
  if (values.password !== values.password_confirm) errors.push('Passwords must match.');
  if (!isPositiveInteger(values.university_id)) errors.push('Choose a university.');
  if (!isPositiveInteger(values.department_id)) errors.push('Choose a department.');
  if (!hasMaxLength(values.bio, 1000)) errors.push('Bio must be 1000 characters or fewer.');
  if (!hasMaxLength(values.study_preferences, 1000)) errors.push('Study preferences must be 1000 characters or fewer.');

  return { values, errors };
}

function validateLogin(body) {
  const values = {
    email: text(body.email).toLowerCase(),
    password: body.password || ''
  };
  const errors = [];

  if (!isEmail(values.email)) errors.push('Enter a valid email address.');
  if (!values.password) errors.push('Password is required.');

  return { values, errors };
}

function validateProfile(body) {
  const values = {
    university_id: text(body.university_id),
    department_id: text(body.department_id),
    academic_level: text(body.academic_level),
    bio: text(body.bio),
    study_preferences: text(body.study_preferences),
    skill_name: text(body.skill_name),
    proficiency_level: text(body.proficiency_level),
    course_code: text(body.course_code),
    course_name: text(body.course_name),
    semester: text(body.semester),
    year: text(body.year)
  };
  const errors = [];

  if (!isPositiveInteger(values.university_id)) errors.push('Choose a university.');
  if (!isPositiveInteger(values.department_id)) errors.push('Choose a department.');
  if (!hasMaxLength(values.bio, 1000)) errors.push('Bio must be 1000 characters or fewer.');
  if (!hasMaxLength(values.study_preferences, 1000)) errors.push('Study preferences must be 1000 characters or fewer.');
  if (values.year && !/^\d{4}$/.test(values.year)) errors.push('Year must use four digits.');

  return { values, errors };
}

function validateAvailability(body) {
  const days = asArray(body.day_of_week);
  const starts = asArray(body.start_time);
  const ends = asArray(body.end_time);
  const errors = [];
  const availability = [];
  const maxRows = Math.max(days.length, starts.length, ends.length);

  for (let index = 0; index < maxRows; index += 1) {
    const day = text(days[index]);
    const start = text(starts[index]);
    const end = text(ends[index]);

    if (!day && !start && !end) continue;

    if (!DAYS.includes(day)) {
      errors.push('Availability day must be valid.');
      continue;
    }
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
      errors.push('Availability times must use HH:MM format.');
      continue;
    }
    if (start >= end) {
      errors.push('Availability end time must be after the start time.');
      continue;
    }

    availability.push({
      day_of_week: day,
      start_time: `${start}:00`,
      end_time: `${end}:00`
    });
  }

  return { availability, errors };
}

function validateStudyRequest(body) {
  const values = {
    message: text(body.message)
  };
  const errors = [];

  if (!values.message) errors.push('Add a short message for your request.');
  if (!hasMaxLength(values.message, 500)) errors.push('Request message must be 500 characters or fewer.');

  return { values, errors };
}

function validateMessage(body) {
  const values = {
    content: text(body.content)
  };
  const errors = [];

  if (!values.content) errors.push('Message cannot be empty.');
  if (!hasMaxLength(values.content, 1000)) errors.push('Message must be 1000 characters or fewer.');

  return { values, errors };
}

function validateRating(body) {
  const values = {
    rated_user_id: text(body.rated_user_id),
    score: Number(body.score),
    feedback: text(body.feedback)
  };
  const errors = [];

  if (!isPositiveInteger(values.rated_user_id)) errors.push('Choose a student to rate.');
  if (!Number.isInteger(values.score) || values.score < 1 || values.score > 5) errors.push('Rating must be between 1 and 5.');
  if (!hasMaxLength(values.feedback, 500)) errors.push('Feedback must be 500 characters or fewer.');

  return { values, errors };
}

module.exports = {
  DAYS,
  validateRegistration,
  validateLogin,
  validateProfile,
  validateAvailability,
  validateStudyRequest,
  validateMessage,
  validateRating
};
