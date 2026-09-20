# USMS — University Student Management System

A full-stack web application for managing the complete academic lifecycle of a university — students, faculty, courses, enrollments, attendance, grades, timetables, and notifications.

**Stack:** React 18 · Redux Toolkit · Vite · Tailwind CSS · Node.js · Express · MongoDB · Socket.IO · Claude API

Live Link: https://usms-ten.vercel.app/

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
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
- JWT authentication with short-lived **access tokens** + long-lived **refresh tokens** (stored in httpOnly cookies)
- Email verification via 6-digit OTP (powered by [Brevo](https://brevo.com))
- Forgot/reset password flow with secure token
- Rate limiting — 1000 req/15min general, 50 req/15min on auth endpoints
- Helmet, CORS, mongo-sanitize, and XSS-clean middleware
- Role-based access control — `admin`, `faculty`, `student`

### Generative AI
- In-app assistant — answers questions about attendance, grades, courses and how to use the system
- AI performance summaries for a student, generated from that student's real grade and attendance records
- Announcement drafting for admins — one line in, a ready title and message out, reviewed before sending
- Course description generator on the course form
- Everything degrades safely: with no API key set, `/api/v1/ai/status` reports `enabled: false` and the UI hides the AI controls

### Admin
- Review and approve/reject pending student & faculty registrations
- Full CRUD for students, faculty, and courses
- Assign faculty to courses
- Mark and manage attendance for any course
- Enter and publish grades
- Manage timetable entries
- Real-time dashboard with enrollment, attendance, and grade statistics
- Broadcast notifications

### Faculty
- View assigned courses and enrolled students
- Mark attendance per class session
- Enter student grades (internal, midterm, final)
- View timetable
- Receive real-time notifications

### Student
- Self-register (requires admin approval before full access)
- Enroll in active courses (gated behind profile approval)
- View own grades, CGPA, and transcript (PDF-ready)
- View personal attendance summary per course
- View personal timetable
- Receive real-time notifications via Socket.IO

---

## Screenshots
<img width="1675" height="887" alt="image" src="https://github.com/user-attachments/assets/8ad85f96-aa08-4da9-8ab7-8321d3e0f326" />
<img width="1669" height="880" alt="image" src="https://github.com/user-attachments/assets/e0ba0125-fe41-4b7b-bf4b-59a7a6e51660" />
<img width="1670" height="880" alt="image" src="https://github.com/user-attachments/assets/7168d2a8-d9a3-4569-b932-19f15ff82d8e" />
<img width="1667" height="879" alt="image" src="https://github.com/user-attachments/assets/7777f336-8d06-439e-b4fe-e04381f3762e" />
<img width="1669" height="879" alt="image" src="https://github.com/user-attachments/assets/6512e1fc-1a65-4180-9a4f-dfc6a697ae8a" />

---

## Architecture

```
Browser (React SPA)
       │  REST + WebSocket
       ▼
Express API  ──►  MongoDB
       │
       └──►  Brevo (transactional email)
```

- **Frontend** — single-page app served by Vite in dev, Nginx in Docker
- **Backend** — RESTful API on Express; Socket.IO server for real-time notifications
- **Database** — MongoDB via Mongoose ODM
- **Auth** — stateless JWT; refresh token stored httpOnly cookie; access token in memory / Authorization header

---

## Project Structure

```
usms/
├── server/
│   ├── src/
│   │   ├── config/           # db.js, jwt.js
│   │   ├── controllers/      # One file per resource
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── faculty.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── enrollment.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── grade.controller.js
│   │   │   ├── timetable.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── registration.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT protect
│   │   │   ├── role.middleware.js    # authorize(...roles)
│   │   │   ├── upload.middleware.js  # Multer avatar upload
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Faculty.js
│   │   │   ├── Course.js
│   │   │   ├── Enrollment.js
│   │   │   ├── Attendance.js
│   │   │   ├── Grade.js
│   │   │   ├── Timetable.js
│   │   │   ├── Notification.js
│   │   │   └── PendingRegistration.js
│   │   ├── routes/           # Express routers
│   │   ├── services/
│   │   │   └── auth.service.js       # register, login, OTP, password reset
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── email.js              # Brevo integration
│   │   │   ├── gpaCalculator.js
│   │   │   └── logger.js             # Winston
│   │   ├── validators/       # express-validator schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/              # Avatar images
│   ├── logs/
│   ├── tests/                # Supertest integration tests
│   ├── Dockerfile
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js              # Redux store
│   │   ├── features/                 # Redux Toolkit slices
│   │   │   ├── auth/authSlice.js
│   │   │   ├── students/studentSlice.js
│   │   │   ├── faculty/facultySlice.js
│   │   │   ├── courses/courseSlice.js
│   │   │   ├── enrollment/enrollmentSlice.js
│   │   │   ├── attendance/attendanceSlice.js
│   │   │   ├── grades/gradeSlice.js
│   │   │   ├── timetable/timetableSlice.js
│   │   │   ├── notifications/notificationSlice.js
│   │   │   ├── registrations/registrationSlice.js
│   │   │   ├── dashboard/dashboardSlice.js
│   │   │   └── users/userSlice.js
│   │   ├── components/
│   │   │   ├── common/               # PageHeader, Badge, Modal, ConfirmDialog,
│   │   │   │                         # SearchBar, Pagination, LoadingScreen,
│   │   │   │                         # EmptyState, PendingApprovalBanner, ...
│   │   │   └── layout/               # Header, Sidebar, MainLayout
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, Register, VerifyEmail,
│   │   │   │                         # ForgotPassword, ResetPassword
│   │   │   ├── dashboard/
│   │   │   ├── students/             # List, Detail, Form
│   │   │   ├── faculty/              # List, Detail, Form
│   │   │   ├── courses/              # List, Detail, Form
│   │   │   ├── grades/               # Grades, Transcript, CourseGrades
│   │   │   ├── attendance/           # View, Mark
│   │   │   ├── timetable/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   └── admin/                # PendingRegistrations
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx    # Redirect to login if unauthenticated
│   │   │   └── RoleRoute.jsx         # Redirect if wrong role
│   │   └── services/
│   │       ├── api.js                # Axios instance with interceptors
│   │       └── socket.js             # Socket.IO client (lazy)
│   ├── Dockerfile
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | name, email, password (bcrypt), role, isEmailVerified, isActive, avatar |
| `Student` | userId, studentId (auto `STUyyNNNN`), department, program, semester, batch, CGPA, totalCredits, dateOfBirth, gender, guardian |
| `Faculty` | userId, facultyId (auto `FACyyNNNN`), department, designation, qualification, experience, joinDate |
| `Course` | title, code, department, credits, semester, maxStudents, faculty, status |
| `Enrollment` | student, course, enrollmentDate, status, grade |
| `Attendance` | student, course, date, status (present/absent/late), markedBy |
| `Grade` | student, course, midterm (30%), finalExam (40%), assignments (20%), quizzes (10%), totalMarks, grade (A+…F), gradePoints, isPublished |
| `Timetable` | course, faculty, day, startTime, endTime, room, semester |
| `Notification` | recipient, title, message, type, read, link |
| `PendingRegistration` | userId, role, department, phone, dateOfBirth, gender, program, semester, batch, designation, qualification, experience, status, rejectionReason |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- [Brevo](https://brevo.com) account for transactional email

### 1. Clone

```bash
git clone https://github.com/jaswantsharma7/usms.git
cd usms
```

### 2. Server setup

```bash
cd server
cp .env.example .env   # fill in your values — see table below
npm install
```

### 3. Client setup

```bash
cd ../client
npm install
```

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

### 4. Seed the database (optional)

```bash
cd ../server
node src/seed.js
```

This creates 1 admin, 50 faculty, 200 students, 50 courses, plus timetable, enrollments, grades, and attendance records.

> **Warning:** the seed script wipes all existing data first.

Default credentials after seeding:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@usms.com` | `Admin@123` |
| Faculty | `<firstname>.fN@usms.com` | `Faculty@123` |
| Student | `<firstname>.sN@usms.com` | `Student@123` |

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `MONGO_URI` | ✅ | MongoDB connection string e.g. `mongodb://localhost:27017/usms` |
| `JWT_SECRET` | ✅ | Random 64-byte hex — see generator below |
| `JWT_REFRESH_SECRET` | ✅ | Random 64-byte hex |
| `JWT_EXPIRES_IN` | | Access token TTL, default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | | Refresh token TTL, default `7d` |
| `PORT` | | Default `5000` |
| `NODE_ENV` | | `development` or `production` |
| `CLIENT_URL` | ✅ | Frontend origin e.g. `http://localhost:5173` |
| `BREVO_API_KEY` | ✅ | From [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api) |
| `EMAIL_FROM_ADDRESS` | ✅ | Verified sender address e.g. `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME` | ✅ | Sender display name e.g. `USMS` |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL, default `http://localhost:5000` |
| `VITE_SOCKET_URL` | Socket.IO server URL, default `http://localhost:5000` |

---

## Running the App

```bash
# Terminal 1 — backend (dev mode with nodemon)
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/v1 |
| API Health | http://localhost:5000/api/v1/health |

---

## Docker

The repo ships a `docker-compose.yml` with three services: `mongo`, `server`, `client`.

```bash
# Copy and fill environment values
cp server/.env.example .env

docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend (Nginx) | http://localhost |
| Backend API | http://localhost:5000 |
| MongoDB | localhost:27017 |

To stop:
```bash
docker-compose down
```

To wipe data volumes:
```bash
docker-compose down -v
```

---

## AI Features

The AI layer lives in `server/src/services/ai.service.js` and talks to the Claude Messages API.
All prompts, model settings and error handling sit in that one file; controllers only pass data in.

### Setup

```env
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-5
AI_MAX_TOKENS=800
AI_ENABLED=true
```

Leave `ANTHROPIC_API_KEY` empty to run the app without AI — every AI route returns `503` and the
frontend hides the assistant panels instead of breaking.

### How data is scoped

- A **student** asking a question gets only their own record attached to the prompt — the server looks the
  student up from the JWT, never from the request body
- **Faculty and admin** can request a summary for any student, using the same role middleware as the rest of the API
- The system prompt tells the model to answer only from the supplied record and never invent marks or attendance
- AI routes have a tighter rate limit of 40 requests per 15 minutes, separate from the general limiter
- Nothing is written to the database by the AI itself — the admin reviews a drafted announcement and presses send

### Endpoints

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| GET | `/ai/status` | ✅ | Whether AI is configured, plus the model in use |
| POST | `/ai/ask` | ✅ | Assistant Q&A `{ question, history }` |
| GET | `/ai/me/summary` | student | Performance summary of the caller's own record |
| GET | `/ai/student/:studentId/summary` | admin, faculty | Performance summary for one student |
| POST | `/ai/announcement/draft` | admin | Draft a title + message from a topic line |
| POST | `/ai/announcement/send` | admin | Send the reviewed draft as a real announcement |
| POST | `/ai/course/:courseId/description` | admin, faculty | Generate a course catalogue description |

## API Reference

All endpoints are prefixed `/api/v1`. Protected routes require `Authorization: Bearer <token>` or the `accessToken` httpOnly cookie.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/auth/register` | — | Register new user, sends OTP email |
| POST | `/auth/verify-email` | — | Verify OTP `{ email, otp }` |
| POST | `/auth/login` | — | Login, returns tokens |
| POST | `/auth/logout` | ✅ | Invalidate refresh token |
| POST | `/auth/refresh-token` | — | Exchange refresh token for new access token |
| POST | `/auth/forgot-password` | — | Send password reset email |
| PATCH | `/auth/reset-password/:token` | — | Reset password |
| GET | `/auth/me` | ✅ | Current user + profileLinked status |

### Students

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/students` | admin, faculty | List all students (paginated, filterable) |
| GET | `/students/me` | student | Own student profile |
| GET | `/students/:id` | admin, faculty | Student by ID |
| POST | `/students` | admin | Create student manually |
| PATCH | `/students/:id` | admin | Update student (supports avatar upload) |
| DELETE | `/students/:id` | admin | Delete student |

### Faculty

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/faculty` | admin | List all faculty |
| GET | `/faculty/me` | faculty | Own faculty profile |
| GET | `/faculty/:id` | admin, faculty | Faculty by ID |
| POST | `/faculty` | admin | Create faculty manually |
| PATCH | `/faculty/:id` | admin | Update faculty |
| DELETE | `/faculty/:id` | admin | Delete faculty |

### Courses

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/courses` | all | List courses (paginated, search, dept filter) |
| GET | `/courses/:id` | all | Course detail |
| POST | `/courses` | admin | Create course |
| PATCH | `/courses/:id` | admin | Update course |
| DELETE | `/courses/:id` | admin | Delete course |
| POST | `/courses/:id/assign-faculty` | admin | Assign faculty to course |

### Enrollments

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/enrollments` | student | Enroll in a course |
| GET | `/enrollments/student/:studentId` | admin, faculty, student | Student's enrollments |
| GET | `/enrollments/course/:courseId` | admin, faculty | Course roster |
| DELETE | `/enrollments/:id` | admin, student | Drop enrollment |

### Attendance

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/attendance` | admin, faculty | Mark attendance for a session |
| GET | `/attendance/course/:courseId` | admin, faculty | Course attendance records |
| GET | `/attendance/me/summary` | student | Own attendance summary per course |

### Grades

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/grades` | admin, faculty | Enter/update grade |
| GET | `/grades/course/:courseId` | admin, faculty | All grades for a course |
| GET | `/grades/me` | student | Own grades |
| GET | `/grades/me/transcript` | student | Full transcript with CGPA |
| PATCH | `/grades/:id/publish` | admin, faculty | Publish grade |

### Timetable

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/timetable/me` | all | Personal timetable |
| GET | `/timetable/course/:courseId` | admin, faculty | Course schedule |
| POST | `/timetable` | admin | Create entry |
| PATCH | `/timetable/:id` | admin | Update entry |
| DELETE | `/timetable/:id` | admin | Delete entry |

### Registrations (Admin)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/registrations` | admin | List pending/all registrations |
| GET | `/registrations/count` | admin | Count of pending registrations |
| POST | `/registrations/:id/approve` | admin | Approve + create student/faculty profile |
| PATCH | `/registrations/:id/reject` | admin | Reject with optional reason |

### Notifications

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/notifications` | all | Own notifications (paginated) |
| PATCH | `/notifications/:id/read` | all | Mark as read |
| PATCH | `/notifications/read-all` | all | Mark all as read |

### Dashboard

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/dashboard` | all | Role-scoped stats and charts |

---

## Roles & Permissions

| Action | Admin | Faculty | Student |
|:---|:---:|:---:|:---:|
| Approve/reject registrations | ✅ | — | — |
| Manage students & faculty | ✅ | — | — |
| Manage courses | ✅ | — | — |
| Assign faculty to course | ✅ | — | — |
| Mark attendance | ✅ | ✅ | — |
| Enter grades | ✅ | ✅ | — |
| Publish grades | ✅ | ✅ | — |
| Manage timetable | ✅ | — | — |
| View all students/faculty | ✅ | ✅ | — |
| Enroll in courses | — | — | ✅ |
| View own grades & transcript | ✅ | ✅ | ✅ |
| View own attendance | — | — | ✅ |
| View timetable | ✅ | ✅ | ✅ |
| Receive notifications | ✅ | ✅ | ✅ |

---

## Registration & Approval Flow

```
Student/Faculty
     │
     ▼
  Register (name, email, password, department,
            phone, dateOfBirth, gender,
            + role-specific fields)
     │
     ▼
  Verify email via OTP
     │
     ▼
  PendingRegistration created (status: pending)
     │
     ▼
  Admin reviews on Pending Registrations page
  (sees name, email, dept, gender, DOB, program, etc.)
     │
     ├─── Approve → Student/Faculty profile created
     │              profileLinked = true on auth/me
     │              Full access unlocked
     │
     └─── Reject  → Email notification sent
                    Student sees rejection reason
```

Until approved, students see a **"Courses Unavailable"** / **"Pending Approval"** banner on all protected pages and no API requests are made to those endpoints.

---

## Tech Stack Details

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT sign/verify |
| `bcryptjs` | Password hashing |
| `brevo` (via native HTTPS) | Transactional email (OTP, password reset) |
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
| `tailwindcss` | Utility-first styling |
| `@reduxjs/toolkit` + `react-redux` | State management |
| `react-router-dom` v6 | Client-side routing |
| `axios` | HTTP client with interceptors |
| `react-hook-form` | Form state & validation |
| `react-hot-toast` | Toast notifications |
| `react-icons` | Icon library |
| `socket.io-client` | Real-time events |
| `chart.js` + `react-chartjs-2` | Dashboard charts |

---

## License

MIT

---

## Bugs Fixed & Code Notes

The following issues were identified and corrected during the commenting pass:

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `server/src/utils/email.js` | Used `resend` SDK but package was not in `package.json`; implementation used raw HTTPS anyway | Rewrote to use native `https` module calling the **Brevo** v3 SMTP API, removing the missing SDK dependency entirely |
| 2 | `server/src/services/grade.service.js` | Grade component weights summed to **1.05** (midterm 0.30 + final 0.40 + assignments 0.20 + quizzes **0.15**), causing `totalMarks` to exceed 100 for top-scoring students | Changed quizzes weight to **0.10** so weights sum to exactly 1.00 |
| 3 | `server/src/models/Attendance.js` | No unique compound index on `(student, course, date)` — allowed duplicate attendance entries for the same student on the same day | Added `{ student, course, date }` unique index |
| 4 | `server/src/utils/email.js` | Env variable was documented as `EMAIL_FROM` but code read `EMAIL_FROM_ADDRESS` / `EMAIL_FROM_NAME` | Updated `.env` documentation (this README) to match the code |
| 5 | `server/src/utils/gpaCalculator.js` | `getLetterGrade` thresholds differed from the seed script (e.g. A+ at 95 vs 97), causing inconsistent letter grades depending on which path calculated the grade | Added a comment marking `getLetterGrade` as the single canonical source; seed script should import it instead of re-defining thresholds |
| 6 | `server/src/services/auth.service.js` | `forgotPassword` did not roll back the reset token when the email send failed, leaving a stale (un-usable) token in the DB | Added rollback (`passwordResetToken = undefined`) inside the catch block before rethrowing |
| 7 | `server/src/services/course.service.js` | `updateCourse` allowed the `code` field to be changed, which would break historical enrollment/grade references | Added `delete updateData.code` guard |