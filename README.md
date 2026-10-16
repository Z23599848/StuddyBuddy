# StudyBuddy

[![StudyBuddy CI](https://github.com/Z23599848/StuddyBuddy/actions/workflows/ci.yml/badge.svg)](https://github.com/Z23599848/StuddyBuddy/actions/workflows/ci.yml)

A university group project that helps students find study partners, coordinate availability, and organise peer learning. Built with Node.js, Express, Pug, and MySQL, with Docker Compose for local development.

[Run locally](#run-locally) · [How matching works](#how-matching-works) · [Development](#development) · [Project records](#project-records)

## What it does

- **Student profiles:** register, sign in, and edit courses, skills, study preferences, and weekly availability.
- **Study partner discovery:** browse students or view ranked matches based on shared courses, skills, department, and overlapping availability.
- **Study requests:** send, accept, reject, or cancel requests to connect with another student.
- **Messaging:** exchange messages after a study request is accepted.
- **Sessions and feedback:** browse study sessions by topic and rate fellow participants after a completed session.

The application uses server-rendered Pug views, Express routes, model modules for database access, and a MySQL schema with sample data.

## Run locally

Install Git and Docker with Docker Compose, then run:

```sh
git clone https://github.com/Z23599848/StuddyBuddy.git
cd StuddyBuddy
cp env-sample .env
docker compose up --build
```

The copy command also works in PowerShell. Keep `.env` private; the sample settings are intended for local development.

- **Application:** <http://127.0.0.1:3000/>
- **Database browser (phpMyAdmin):** <http://127.0.0.1:8081/>
- **MySQL from the host:** port `3308`

Wait for MySQL to initialise before opening the application. The schema and seed data are imported when MySQL first creates its data directory; existing local data in `db/` is retained across restarts.

For a local demonstration, sign in as `ali@uni.ac.uk` or `nilay@uni.ac.uk` with password `password123`. These are seeded demo accounts.

Stop the containers with:

```sh
docker compose down
```

## How matching works

Matches use a weighted SQL score:

```text
score = 3 × shared courses
      + 2 × shared skills
      + overlapping availability pairs
      + 1 if both students share a department
```

Higher scores appear first, followed by shared courses, shared skills, and first name to resolve ties. The implementation is in [matchModel.js](app/models/matchModel.js).

## Development

Use Node.js 22 to match the Docker image and CI environment. To install dependencies and run the available checks:

```sh
npm ci
npm test
npm audit --omit=dev
```

`npm test` checks JavaScript syntax and runs the availability validation tests. These checks do not cover the complete application or replace testing user journeys against MySQL. [GitHub Actions](.github/workflows/ci.yml) also audits production dependencies and builds the web Docker image.

| Location | Purpose |
| --- | --- |
| [app/app.js](app/app.js) | Routes, authentication, and request handling |
| [app/models/](app/models/) | Database queries and matching logic |
| [app/views/](app/views/) | Pug page templates |
| [app/utils/](app/utils/) | Input validation and password helpers |
| [static/](static/) | Styles and static assets |
| [sd2-db.sql](sd2-db.sql), [seed-data.sql](seed-data.sql) | Database schema and demonstration data |
| [test/](test/) | Automated validation tests |

## Status and limitations

The repository contains the Sprint 4 MVC implementation and is intended as a local coursework demonstration. Real-time chat, email verification, notifications, and moderation tools are outside the current scope.

The development configuration includes demo credentials, an in-memory session store, and a fallback session secret. A public deployment would require separate configuration and security work, including persistent session storage and deployment-specific secrets.

## Project records

StudyBuddy is a collaborative project by **Ali, Lan, Maywon, Nilay, and Tavishi**. The [submission checklist](submission-checklist.md) and [meeting records](meetings/) document the team and its work; this repository should be read as a group project.

- [Design artefacts](design/): requirements, user stories, diagrams, and wireframe records.
- [Sprint 4 implementation notes](sprint4-notes.md): features and evidence checklist.
- [Original README and coursework history](docs/coursework-history.md): the complete former README, including the original individual-contribution narrative and sprint submission material.
- [Code of conduct](CODE_OF_CONDUCT.md).

The repository includes an [Apache 2.0 license](LICENSE).
