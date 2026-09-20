# USMS — University Student Management System

A full-stack web application for managing the academic lifecycle of a university — students, faculty, courses, enrollments, attendance, grades, timetables, and notifications, with an AI assistant layered on top for quick summaries and drafting.

**Stack:** React 18 · Redux Toolkit · Vite · Tailwind CSS · Node.js · Express · MongoDB · Groq API

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Docker](#docker)
- [AI Features](#ai-features)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Registration & Approval Flow](#registration--approval-flow)
- [Tech Stack Details](#tech-stack-details)
- [License](#license)

---

## Features

### Authentication & Security
- JWT authentication — access token + refresh token flow
- Email verification via OTP, sent through Brevo
- Forgot/reset password flow with a time-limited reset token
- Rate limiting on general traffic, with a tighter limit specifically on AI routes
- Helmet, CORS, mongo-sanitize, and XSS-clean middleware
- Role-based access control — `admin`, `faculty`, `student`

### Generative AI
- In-app assistant — answers questions about the system, grounded in real data
- AI performance summaries, generated from a student's actual grades and attendance
- Announcement drafting for admins, reviewed before sending
- Course description generator on the course form
- Runs on Groq's API — the free tier is enough to use every feature above
- Degrades safely with no key set: `/api/v1/ai/status` reports `enabled: false` and AI panels hide themselves in the UI instead of erroring

### Admin
- Review and approve/reject pending student & faculty registrations
- Full CRUD for students, faculty, and courses
- Assign faculty to courses
- Mark and manage attendance for any course
- Enter and publish grades
- Manage timetable entries
- Role-scoped dashboard with stats
- Send announcements to all users

### Faculty
- View assigned courses and students in each
- Mark attendance per class session
- Enter and publish student grades
- View their own timetable
- Use the same AI assistant and student-summary tools as admins, scoped to their own courses

### Student
- Self-register (requires admin approval before full access)
- Enroll in and drop active courses
- View own grades and full transcript
- View own attendance, including a per-course percentage
- View own timetable
- Ask the AI assistant questions about their own record

---

## Architecture

```
Browser (React SPA)
       │  REST API
       ▼
Express API  ──►  MongoDB
       │
       ├──►  Brevo (transactional email — OTP, password reset)
       └──►  Groq API (AI assistant, summaries, drafts)
```

- **Frontend** — single-page app built with Vite, state managed with Redux Toolkit slices per feature
- **Backend** — RESTful API on Express, one controller/service/route file per resource
- **Database** — MongoDB via Mongoose
- **Auth** — JWT-based, with role checks enforced per-route via middleware

---

## Project Structure

```
student_management_/
├── server/
│   ├── src/
│   │   ├── config/            # db.js, jwt.js
│   │   ├── controllers/       # One file per resource (ai, auth, student, faculty,
│   │   │                      # course, enrollment, attendance, grade, timetable,
│   │   │                      # notification, registration, dashboard, user)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js       # JWT protect
│   │   │   ├── role.middleware.js       # authorize(...roles)
│   │   │   ├── upload.middleware.js     # Multer avatar upload
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── models/             # User, Student, Faculty, Course, Enrollment,
│   │   │                       # Attendance, Grade, Timetable, Notification,
│   │   │                       # PendingRegistration
│   │   ├── routes/             # Express routers, one per resource
│   │   ├── services/           # Business logic, called from controllers
│   │   │   └── ai.service.js   # All Groq API calls live here
│   │   ├── utils/
│   │   │   ├── ApiError.js / ApiResponse.js / asyncHandler.js
│   │   │   ├── email.js        # Brevo integration
│   │   │   ├── gpaCalculator.js
│   │   │   └── logger.js       # Winston
│   │   ├── validators/         # express-validator schemas
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js             # Generates realistic sample data
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── app/store.js               # Redux store
│   │   ├── features/                  # Redux Toolkit slices, one per resource
│   │   │                              # (ai, auth, students, faculty, courses,
│   │   │                              #  enrollment, attendance, grades,
│   │   │                              #  timetable, notifications,
│   │   │                              #  registrations, dashboard, users)
│   │   ├── components/
│   │   │   ├── common/                # ErrorBoundary, PendingApprovalBanner, ...
│   │   │   └── layout/                # Header, Sidebar, MainLayout
│   │   ├── pages/
│   │   │   ├── auth/                  # Login, Register, VerifyEmail,
│   │   │   │                          # ForgotPassword, ResetPassword
│   │   │   ├── dashboard/
│   │   │   ├── students/  faculty/  courses/
│   │   │   ├── grades/                # Grades, Transcript, CourseGrades
│   │   │   ├── attendance/            # Attendance, MarkAttendance
│   │   │   ├── timetable/  notifications/  profile/
│   │   │   ├── ai/                    # AssistantPage
│   │   │   └── admin/                 # PendingRegistrationsPage
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx     # Redirect to login if unauthenticated
│   │   │   └── RoleRoute.jsx          # Redirect if wrong role
│   │   └── services/
│   │       ├── api.js                 # Axios instance
│   │       └── socket.js
│   └── vite.config.js
│
└── docker-compose.yml
```

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | name, email, password (bcrypt), role, isEmailVerified, isActive, avatar |
| `Student` | userId, studentId, department, program, semester, batch, CGPA, dateOfBirth, gender |
| `Faculty` | userId, facultyId, department, designation, qualification, experience |
| `Course` | title, code, department, credits, semester, maxStudents, faculty, status |
| `Enrollment` | student, course, enrollmentDate, status |
| `Attendance` | student, course, date, status (present/absent/late), markedBy |
| `Grade` | student, course, midterm, finalExam, assignments, quizzes, totalMarks, grade, isPublished |
| `Timetable` | course, faculty, day, startTime, endTime, room, semester |
| `Notification` | recipient, title, message, type, read |
| `PendingRegistration` | userId, role, department, phone, dateOfBirth, gender, status, rejectionReason |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- A [Brevo](https://brevo.com) account for email
- A [Groq](https://console.groq.com) account for AI features (free tier)

### 1. Clone

```bash
git clone https://github.com/Flash7890/StudentManagementApp.git
cd StudentManagementApp
```

### 2. Install everything

```bash
npm run install:all
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
```
Fill in the values — see the table below.

### 4. Seed the database (optional but recommended)

```bash
cd server
node src/seed.js
```

This wipes existing data and generates a realistic set of faculty, students, courses, timetable slots, enrollments, grades, and attendance — with deliberately uneven counts per department so the dashboard charts look real rather than perfectly even.

> **Warning:** this clears the database first — don't run it against data you want to keep.

Default credentials after seeding are printed to the terminal:

| Role | Email pattern | Password |
|---|---|---|
| Admin | `admin@usms.com` | `Admin@123` |
| Faculty | `<firstname>.f<n>@usms.com` | `Faculty@123` |
| Student | `<firstname>.s<n>@usms.com` | `Student@123` |

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Random secret — generate with the command below |
| `JWT_REFRESH_SECRET` | ✅ | Random secret, separate from `JWT_SECRET` |
| `JWT_EXPIRE` | | Access token TTL, default `15m` |
| `JWT_REFRESH_EXPIRE` | | Refresh token TTL, default `7d` |
| `PORT` | | Default `5000` |
| `CLIENT_URL` | ✅ | Frontend origin, e.g. `http://localhost:5173` |
| `BREVO_API_KEY` | ✅ | From [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api) |
| `EMAIL_FROM_NAME` | ✅ | Sender display name |
| `EMAIL_FROM_ADDRESS` | ✅ | Verified sender address |
| `GROQ_API_KEY` | for AI | From [console.groq.com/keys](https://console.groq.com/keys) |
| `GROQ_MODEL` | | Defaults to a current Groq model — check [console.groq.com/docs/models](https://console.groq.com/docs/models), as Groq deprecates models fairly often |
| `AI_MAX_TOKENS` | | Default `800` |
| `AI_ENABLED` | | Set `false` to hard-disable AI regardless of key |

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Running the App

```bash
npm run dev
```
Runs backend and frontend together from the project root.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/v1 |

---

## Docker

```bash
docker-compose up --build
```
Spins up `mongo`, `server`, and `client` containers together, networked so the server can reach Mongo without any manual setup.

To stop:
```bash
docker-compose down
```

---

## AI Features

All AI logic lives in one file — `server/src/services/ai.service.js` — so prompts, model config, and error handling stay in one place. It talks to **Groq's** OpenAI-compatible chat completions API.

### Setup

```env
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
AI_MAX_TOKENS=800
AI_ENABLED=true
```

Leave `GROQ_API_KEY` empty to run the app without AI — every AI route returns a `503` and the frontend hides the assistant panels instead of breaking.

### How data is scoped

- A **student** asking for a summary only ever gets their own record — the server pulls it from the JWT, not from anything the client sends
- **Faculty and admin** can request a summary for any student, subject to the same role checks as the rest of the API
- Nothing is written to the database by the AI on its own — an admin reviews a drafted announcement before it's actually sent
- AI routes sit behind a tighter rate limit (40 requests / 15 min) than the rest of the API

### Endpoints

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| GET | `/ai/status` | ✅ | Whether AI is configured, and which model |
| POST | `/ai/ask` | ✅ | Assistant Q&A |
| GET | `/ai/me/summary` | student | Performance summary of the caller's own record |
| GET | `/ai/student/:studentId/summary` | admin, faculty | Performance summary for one student |
| POST | `/ai/announcement/draft` | admin | Draft a title + message from a topic line |
| POST | `/ai/announcement/send` | admin | Send the reviewed draft |
| POST | `/ai/course/:courseId/description` | admin, faculty | Generate a course description |

---

## API Reference

All endpoints are prefixed `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register, sends OTP email |
| POST | `/auth/verify-email` | Verify OTP |
| POST | `/auth/resend-otp` | Resend OTP |
| POST | `/auth/login` | Login, returns tokens |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh-token` | Exchange refresh token for a new access token |
| POST | `/auth/forgot-password` | Send reset email |
| PATCH | `/auth/reset-password/:token` | Reset password |
| GET | `/auth/me` | Current user |

### Students
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/students/me` | student |
| GET | `/students` | admin, faculty |
| GET | `/students/:id` | admin, faculty |
| POST | `/students` | admin |
| PATCH | `/students/:id` | admin |
| DELETE | `/students/:id` | admin |

### Faculty
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/faculty/me` | faculty |
| GET | `/faculty` | admin, faculty, student |
| GET | `/faculty/:id` | admin, faculty |
| GET | `/faculty/:id/students` | admin, faculty |
| POST | `/faculty` | admin |
| PATCH | `/faculty/:id` | admin |
| DELETE | `/faculty/:id` | admin |

### Courses
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/courses` | all |
| GET | `/courses/:id` | all |
| GET | `/courses/:id/students` | admin, faculty |
| POST | `/courses` | admin |
| PATCH | `/courses/:id` | admin |
| PATCH | `/courses/:id/assign-faculty` | admin |
| DELETE | `/courses/:id` | admin |

### Enrollments
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/enrollments/me` | student |
| GET | `/enrollments/student/:studentId` | admin, faculty |
| GET | `/enrollments/course/:courseId` | admin, faculty |
| POST | `/enrollments` | admin, faculty, student |
| PATCH | `/enrollments/:id/drop` | student |
| PATCH | `/enrollments/:id/status` | admin, faculty |

### Attendance
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/attendance/me` | student |
| GET | `/attendance/me/summary` | student |
| GET | `/attendance/course/:courseId` | admin, faculty |
| GET | `/attendance/student/:studentId` | admin, faculty |
| GET | `/attendance/student/:studentId/course/:courseId/percentage` | admin, faculty |
| POST | `/attendance/mark` | faculty, admin |

### Grades
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/grades/me` | student |
| GET | `/grades/me/transcript` | student |
| GET | `/grades/student/:studentId` | admin, faculty |
| GET | `/grades/course/:courseId` | admin, faculty |
| POST | `/grades/assign` | faculty, admin |
| PATCH | `/grades/course/:courseId/publish` | faculty, admin |

### Timetable
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/timetable/me` | all |
| GET | `/timetable` | admin, faculty |
| POST | `/timetable` | admin |
| PATCH | `/timetable/:id` | admin |
| DELETE | `/timetable/:id` | admin |

### Registrations (Admin)
| Method | Endpoint |
|---|---|
| GET | `/registrations/count` |
| GET | `/registrations` |
| POST | `/registrations/:id/approve` |
| PATCH | `/registrations/:id/reject` |

### Notifications
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/notifications` | all |
| PATCH | `/notifications/mark-all-read` | all |
| PATCH | `/notifications/:id/read` | all |
| DELETE | `/notifications/:id` | all |
| POST | `/notifications/announcement` | admin |

### Users & Dashboard
| Method | Endpoint | Roles |
|---|---|---|
| GET / PATCH | `/users/profile` | all |
| PATCH | `/users/change-password` | all |
| GET | `/users` , `/users/:id` | admin |
| PATCH / DELETE | `/users/:id` | admin |
| GET | `/dashboard` | all (role-scoped) |

---

## Roles & Permissions

| Action | Admin | Faculty | Student |
|:---|:---:|:---:|:---:|
| Approve/reject registrations | ✅ | — | — |
| Manage students & faculty | ✅ | — | — |
| Manage courses | ✅ | — | — |
| Assign faculty to course | ✅ | — | — |
| Mark attendance | ✅ | ✅ | — |
| Enter & publish grades | ✅ | ✅ | — |
| Manage timetable | ✅ | — | — |
| Send announcements | ✅ | — | — |
| Enroll / drop courses | — | — | ✅ |
| View own grades & transcript | ✅ | ✅ | ✅ |
| View own attendance | — | — | ✅ |
| View timetable | ✅ | ✅ | ✅ |
| Use AI assistant | ✅ | ✅ | ✅ |

---

## Registration & Approval Flow

```
Student/Faculty registers
        │
        ▼
  Verify email via OTP
        │
        ▼
  PendingRegistration created (status: pending)
        │
        ▼
  Admin reviews on the Pending Registrations page
        │
        ├─── Approve → Student/Faculty profile created, full access unlocked
        │
        └─── Reject  → Rejection reason shown to the user
```

Until approved, new users see a pending-approval banner and can't hit the protected resource endpoints.

---

## Tech Stack Details

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT sign/verify |
| `bcryptjs` | Password hashing |
| `socket.io` | Real-time notifications |
| `express-rate-limit` | Rate limiting |
| `helmet` | HTTP security headers |
| `express-mongo-sanitize` | NoSQL injection prevention |
| `xss-clean` | XSS sanitization |
| `multer` | Avatar file uploads |
| `express-validator` | Request validation |
| `winston` | Structured logging |
| `morgan` | HTTP request logging |

### Frontend
| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `vite` | Build tool & dev server |
| `tailwindcss` | Styling |
| `@reduxjs/toolkit` + `react-redux` | State management |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `react-hook-form` | Form state & validation |
| `react-hot-toast` | Toast notifications |
| `react-icons` | Icons |
| `socket.io-client` | Real-time events |
| `chart.js` + `react-chartjs-2` | Dashboard charts |

---

## License

Not currently licensed for reuse — reach out if you'd like to use any part of this.
