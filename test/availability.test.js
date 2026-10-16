const assert = require('node:assert/strict');
const test = require('node:test');
const { validateAvailability } = require('../app/utils/validation');

function validate(start, end) {
  return validateAvailability({
    day_of_week: 'Monday',
    start_time: start,
    end_time: end
  });
}

test('accepts the valid clock-time boundaries and normalises seconds', () => {
  assert.deepEqual(validate('00:00', '23:59'), {
    availability: [{ day_of_week: 'Monday', start_time: '00:00:00', end_time: '23:59:00' }],
    errors: []
  });
});

for (const [start, end] of [
  ['24:00', '25:00'],
  ['09:00', '24:00'],
  ['09:60', '10:00'],
  ['09:00', '10:99']
]) {
  test(`rejects the out-of-range clock times ${start} to ${end}`, () => {
    const result = validate(start, end);
    assert.deepEqual(result.availability, []);
    assert.ok(result.errors.length > 0);
  });
}

test('still requires two-digit hours and minutes', () => {
  for (const start of ['9:00', '09:0', '09:00:00']) {
    const result = validate(start, '10:00');
    assert.deepEqual(result.availability, []);
    assert.ok(result.errors.length > 0);
  }
});

test('still rejects equal, reversed and overnight ranges', () => {
  for (const [start, end] of [['09:00', '09:00'], ['10:00', '09:00'], ['23:00', '01:00']]) {
    const result = validate(start, end);
    assert.deepEqual(result.availability, []);
    assert.deepEqual(result.errors, ['Availability end time must be after the start time.']);
  }
});

test('handles multiple rows and excludes an invalid row', () => {
  assert.deepEqual(validateAvailability({
    day_of_week: ['Monday', 'Tuesday'],
    start_time: ['09:00', '25:00'],
    end_time: ['10:00', '26:00']
  }), {
    availability: [{ day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00' }],
    errors: ['Availability times must be valid 24-hour times in HH:MM format.']
  });
});

test('ignores a completely blank availability row', () => {
  assert.deepEqual(validateAvailability({ day_of_week: '', start_time: '', end_time: '' }), {
    availability: [],
    errors: []
  });
});
