# StudyBuddy Sprint 4 Notes

These notes are not a final submission. Use them to write your own Sprint 4 report, add screenshots, and acknowledge any AI/tool support according to the assessment rules.

## Current Evidence In The Repository

- Sprint 3 database-driven pages are present:
  - `/users`
  - `/users/:id`
  - `/sessions`
  - `/sessions/:id`
  - `/tags`
- MySQL schema and demo seed data are present in `sd2-db.sql` and `seed-data.sql`.
- Docker support is present through `Dockerfile` and `docker-compose.yml`.
- A real GitHub Actions CI workflow has been added at `.github/workflows/ci.yml`.
- The CI workflow runs:
  - `npm ci`
  - `npm test`
  - `docker build -t studybuddy-web .`
- Sprint 3 demo defects fixed:
  - Session list now returns `participant_count`, matching `sessions.pug`.
  - Session detail now returns `creator_id`, matching `session-detail.pug`.

## Sprint 4 User Stories To Prioritise

| Priority | ID | Feature | Sprint 4 Outcome |
| --- | --- | --- | --- |
| Must | US1 | Account Registration | Students can create an account with validated input. |
| Must | US2 | Login | Students can securely access their profile. |
| Must | US22 | Logout | Students can end their session safely. |
| Must | US3 | Input Validation | Forms reject missing or invalid data. |
| Must | US4 | Create Profile | Students can add course, skill, bio, and study preferences. |
| Must | US5 | Update Profile | Students can keep their profile accurate. |
| Must | US6 | Add Availability | Matching can use shared study times. |
| Should | New | Basic Matching Algorithm | Students are ranked by shared course, skills, and availability. |
| Should | US10-US13 | Study Requests | Students can send, receive, accept, and reject study requests. |
| Should | US14 | Messaging System | Accepted study buddies can exchange planning messages. |
| Could | New | Ratings / Points | Students can rate completed study sessions. |
| Could | US15 | Notifications | Students can see request/message updates. |
| Polish | US18-US20 | Homepage/support/footer | Final presentation feels complete and ethical/legal links are visible. |

## Suggested Sprint 4 Task Breakdown

1. Authentication and validation
   - Add registration and login routes.
   - Store password hashes, never plain text passwords.
   - Add logout and navigation state.

2. Profile and availability
   - Add create/update profile forms.
   - Extend the database only if the current schema cannot store required fields.
   - Show availability on profile pages.

3. Matching
   - Add a `/matches` page.
   - Rank users by shared course, department, skills, and availability.
   - Explain the matching logic clearly in the Sprint 4 report.

4. Study requests
   - Add request table or reuse an appropriate relationship table.
   - Allow pending, accepted, and rejected states.
   - Show incoming/outgoing requests.

5. Messaging
   - Use the existing `conversation`, `conversation_participant`, and `message` tables.
   - Only allow messaging after a request is accepted.

6. Ratings
   - Add a rating table linked to users and study sessions.
   - Show average rating on profile pages.

7. CI/CD and Docker evidence
   - Screenshot the GitHub Actions workflow run.
   - Screenshot the app running in Docker.
   - Mention `npm test` and Docker build checks.

## Report Evidence Checklist

- Screenshots of new Sprint 4 pages/features.
- Updated user story table showing which Sprint 4 stories were completed.
- Screenshot of GitHub Actions passing.
- Screenshot of Docker app running.
- Updated Kanban board screenshot.
- Task allocation table with each team member's work.
- Short explanation of the matching algorithm.
- Ethical issues revisited: privacy, password security, safety, fairness in matching, and user consent.
- AI/tool acknowledgement where required.
