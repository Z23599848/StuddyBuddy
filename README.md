# Studdy Buddy

## Project Overview
Studdy buddy is a group software engineering project designed to support university students in organising their study activities, connecting with peers, and improving collaboration and wellbeing.

## Project Status
This project has completed Sprint 3 database-driven browsing pages and is being prepared for Sprint 4 MVP completion.

Sprint 4 should focus on authentication, profile editing, availability, matching, study requests, messaging, ratings, Docker evidence, and GitHub Actions evidence. See `sprint4-notes.md` for the current Sprint 4 checklist.

## Technologies
- Node.js
- Express.js
- MySQL
- Docker
- PhpMyAdmin

## Development Environment
The project uses Docker to provide a consistent cross-platform development environment.
All group members are able to run the application locally using Docker.

Before running Docker Compose locally, copy `env-sample` to `.env` and keep `.env` private.

```bash
docker compose up --build
```

## Repository
This repository is used for group collaboration, version control, and sprint-based development.

## Continuous Integration

Sprint 4 CI evidence is provided through `.github/workflows/ci.yml`.

The workflow runs JavaScript syntax checks with `npm test` and verifies that the web image can be built with Docker.

---

## Sprint 1 – Ethical Considerations (Individual Contribution)
During Sprint 1, my individual responsibility was to identify and analyse the key ethical issues relevant to the StudyBuddy project.

The ethical considerations addressed include:

- **Data privacy and protection:**  
  Ensuring that personal and academic data is handled securely, stored responsibly, and processed in compliance with GDPR principles such as data minimisation, purpose limitation, and user rights.

- **Informed consent and transparency:**  
  Providing clear and accessible information to users regarding what data is collected, how it is used, and how long it is retained, enabling informed decision-making.

- **Accessibility and inclusivity:**  
  Designing the system to be usable by students with diverse needs, including consideration of accessibility standards and avoidance of exclusionary design practices.

- **Fairness and bias:**  
  Reducing the risk of bias in system design and future algorithmic features, particularly in recommendation or prioritisation mechanisms.

- **Ethical collaboration and wellbeing:**  
  Promoting respectful communication, shared responsibility, and support within the development team, recognising the pressures of academic workloads and personal circumstances.

This ethical analysis was informed by academic literature, professional ethical guidelines, and relevant legal frameworks.  
The full ethical discussion, including IEEE-formatted references, has been shared with the team member responsible for compiling and submitting the final Sprint 1 PDF deliverable.

## Sprint 2 — Design & Requirements Pack (Submission Evidence)

Sprint 2 focuses on refining requirements and producing design artefacts to prepare for implementation in Sprint 3.  
All Sprint 2 deliverables are stored in the repository under `docs/sprint2/` to support review and demonstration.

### Use Case Diagram
The Use Case Diagram illustrates the primary interactions between users and the StudyBuddy system. 
It defines the core system functionalities, including user registration, authentication, profile management,
searching for study buddies, and sending or accepting study requests. 
This diagram helps clarify system boundaries and supports requirement validation for Sprint 2.

### Activity Diagram – User Registration
This activity diagram represents the workflow of the user registration process in the StudyBuddy system.
It outlines the sequence of user actions and system responses, including input validation, duplicate email
checks, error handling, and successful account creation. The diagram ensures that all possible execution
paths are clearly defined and supports the functional requirements identified for Sprint 2.

# Registration Flowchart

This flowchart represents the control flow of the user registration process
within the StudyBuddy system. It complements the activity diagram by focusing
on decision points and validation logic rather than system behaviour.

### Sprint 2 Artefacts (Links)
- **Project Summary (refined):** `docs/sprint2/project-summary.md`
- **Prioritised User Stories:** `docs/sprint2/user-stories.md`
- **Use Case Diagram (UML):** `docs/sprint2/use-case-diagram.png`
- **Wireframes:** `docs/sprint2/wireframes/`
- **Activity Diagrams / Flowcharts:** `docs/sprint2/activity-diagrams/`
- **Meeting Minutes:** `docs/sprint2/meeting-minutes/`
- **Kanban Screenshot (Sprint evidence):** `docs/sprint2/screenshots/kanban-sprint2.png`

### Project Management
- **GitHub Project / Kanban Board:** (paste your GitHub Projects link here)
- **Repository Link:** (paste repo link here)

---

## Scope (Sprint 2 → Sprint 3 Implementation Plan)

### MVP (Sprint 3 target)
The Minimum Viable Product (MVP) will enable:
1. Student registration and login
2. Creation of a basic study profile (subject, availability, study preferences)
3. Searching for study buddies based on compatibility criteria
4. Sending and responding to study requests (accept/reject)

### Out of Scope (for now)
To maintain quality over quantity in early sprints, the following are intentionally out of scope until core features are stable:
- Real-time chat and messaging
- Notifications and email verification
- Advanced matching algorithms (ML-based recommendations)
- Admin dashboard and moderation tooling

### Non-Functional Requirements (NFRs)
- **Security:** passwords are never stored in plain text; follow best practices for authentication and access control.
- **Privacy:** user profile data is minimised and processed only for matching and collaboration.
- **Reliability:** the system must run consistently across team members’ machines via Docker.
- **Usability:** core flows (register/login/search/request) should require minimal steps and be easy to understand.

---

## Repository Structure (Key Folders)

```text
docs/
  sprint1/
  sprint2/
    project-summary.md
    user-stories.md
    use-case-diagram.png
    wireframes/
    activity-diagrams/
    meeting-minutes/
    screenshots/
src/
app/
docker-compose.yml
README.md

Design & Analysis (Sprint 2)

1. Refined Project Description

StudyBuddy is a collaborative web-based application designed to support university students in organising their study activities, discovering compatible study partners, and maintaining productive peer-to-peer learning relationships.
Following Sprint 1 feedback, the project scope has been refined to prioritise core academic collaboration features before introducing optional social or wellbeing enhancements.

The application focuses on:

Secure user authentication

Creation of personalised study profiles

Searching and matching students based on shared academic interests

Managing study requests in a controlled and ethical manner

This refinement ensures a realistic and achievable scope while maintaining strong educational and social value.

2. Functional Scope (Sprint 2 Focus)

Sprint 2 concentrates on requirements analysis and system design, preparing the project for full implementation in Sprint 3.

Key functional areas analysed in this sprint:

User registration and authentication

Study profile creation and editing

Study buddy discovery

Sending, accepting, or rejecting study requests

These features are formally documented through user stories, use case diagrams, and activity flows.

3. Ethical and Professional Design Considerations

The system design explicitly considers ethical responsibilities associated with student data, online interactions, and inclusivity.

Key considerations include:

Privacy-by-design principles

Minimal data collection

User consent and transparency

Prevention of misuse or harassment

Accessibility and fair matching logic

Ethical considerations identified in Sprint 1 directly inform the design decisions documented in this sprint.

4. Artefacts Produced in Sprint 2

The following design artefacts have been produced to support Sprint 3 development:

Use Case Diagram

User Stories

Activity Diagrams / Flowcharts

Initial data and interaction modelling

Updated Kanban board with Sprint 2 tickets

All artefacts are aligned with Agile and industry-standard software engineering practices.

