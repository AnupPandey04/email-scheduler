# Email Scheduler

A production-style email scheduling application built with React,
Node.js, Express, MySQL, Redis, BullMQ, and Docker.

The application allows authenticated users to compose emails, schedule
them for a future time, view scheduled/sent emails, and cancel emails
before they are processed. Scheduled jobs are handled asynchronously by
a dedicated BullMQ worker.

## Features

-   User registration and login with JWT authentication
-   Password hashing with bcrypt
-   Protected email-management APIs
-   Schedule emails for a future date and time
-   View scheduled and sent emails from the dashboard
-   Cancel emails that have not yet been sent
-   Asynchronous email processing with BullMQ
-   Redis-backed job queue
-   MySQL persistence with Drizzle ORM
-   SMTP email delivery with Nodemailer
-   Ethereal Email support for development/testing
-   Request security with Helmet
-   CORS configuration
-   HTTP request logging with Morgan
-   Rate limiting support
-   Dockerized frontend, backend, worker, MySQL, and Redis
-   Production frontend served with Nginx
-   Database migrations managed with Drizzle Kit

## Tech Stack

### Frontend

-   React
-   TypeScript
-   Vite
-   React Router
-   Axios
-   Tailwind CSS

### Backend

-   Node.js
-   Express
-   TypeScript
-   JWT
-   bcrypt
-   Nodemailer
-   Drizzle ORM

### Infrastructure

-   MySQL 8.4
-   Redis 7
-   BullMQ
-   Docker / Docker Compose
-   Nginx

## Architecture

``` text
                         ┌──────────────────────┐
                         │      React App       │
                         │   Vite + TypeScript  │
                         └──────────┬───────────┘
                                    │ HTTP / REST
                                    ▼
                         ┌──────────────────────┐
                         │    Express API       │
                         │  Authentication      │
                         │  Email Scheduling    │
                         └───────┬───────┬──────┘
                                 │       │
                         SQL     │       │ Jobs
                                 ▼       ▼
                       ┌────────────┐  ┌────────────┐
                       │   MySQL    │  │   Redis    │
                       │  Database  │  │  + BullMQ  │
                       └────────────┘  └─────┬──────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │ Email Worker   │
                                    │  BullMQ Worker │
                                    └───────┬────────┘
                                            │
                                            ▼
                                    ┌────────────────┐
                                    │ SMTP /         │
                                    │ Ethereal Email │
                                    └────────────────┘
```

### Request flow

1.  A user registers or logs in.
2.  The API returns a JWT token.
3.  The frontend stores the token and sends it with authenticated API
    requests.
4.  When an email is scheduled, the backend stores the email record in
    MySQL.
5.  A delayed BullMQ job is created in Redis.
6.  The worker waits for the scheduled job.
7.  When the job becomes available, the worker sends the email through
    SMTP.
8.  The email record is updated with its final status and delivery
    information.
9.  The dashboard displays the current email status.

## Project Structure

``` text
email-scheduler/
├── backend/
│   ├── drizzle/
│   │   ├── meta/
│   │   └── *.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── queues/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── test-smtp.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── README.md
```

## Prerequisites

For local development without Docker:

-   Node.js 20+
-   MySQL 8+
-   Redis 7+
-   An SMTP account such as Ethereal Email

For the Docker setup, Docker Desktop is sufficient.

## Environment Variables

Create the required environment file from the provided example.

``` powershell
Copy-Item .env.example .env
```

The environment configuration contains values for:

``` env
MYSQL_ROOT_PASSWORD=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

REDIS_HOST=
REDIS_PORT=

JWT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Never commit `.env` files or real credentials to GitHub.

The repository includes `.env.example` files containing configuration
placeholders/examples.

## Running with Docker Compose

The project includes Docker Compose configuration for:

-   MySQL
-   Redis
-   Express backend
-   BullMQ worker
-   React frontend served through Nginx

Start all services:

``` powershell
docker compose up -d
```

Check service status:

``` powershell
docker compose ps
```

Expected services:

``` text
email_scheduler_mysql
email_scheduler_redis
email_scheduler_backend
email_scheduler_worker
email_scheduler_frontend
```

View backend logs:

``` powershell
docker compose logs backend --tail=50
```

View worker logs:

``` powershell
docker compose logs worker --tail=50
```

Stop the application:

``` powershell
docker compose down
```

## Application URLs

When running with the included Docker Compose configuration:

-   Frontend: `http://localhost:5173`
-   Backend API: `http://localhost:5000`
-   Health check: `http://localhost:5000/health`
-   MySQL host port: `3307`
-   Redis host port: `6379`

## Database

The project uses Drizzle ORM and Drizzle Kit.

From the backend directory:

``` powershell
cd backend
```

Generate a migration after changing the schema:

``` powershell
npm run db:generate
```

Apply migrations:

``` powershell
npm run db:migrate
```

Build the backend:

``` powershell
npm run build
```

Start the production backend:

``` powershell
npm start
```

## Backend Development

From `backend/`:

``` powershell
npm install
npm run dev
```

Run the worker during development:

``` powershell
npm run worker
```

Test the SMTP configuration:

``` powershell
npx tsx src/test-smtp.ts
```

## Frontend Development

From `frontend/`:

``` powershell
npm install
npm run dev
```

Build the frontend:

``` powershell
npm run build
```

Preview the production build:

``` powershell
npm run preview
```

## API Overview

### Authentication

``` text
POST /api/auth/register
POST /api/auth/login
```

Registration and login return authentication information used by the
frontend for protected requests.

### Email Scheduling

``` text
POST   /api/emails
GET    /api/emails
GET    /api/emails/sent
DELETE /api/emails/:id
```

Authenticated requests use:

``` http
Authorization: Bearer <JWT_TOKEN>
```

### Health Check

``` text
GET /health
```

Example response:

``` json
{
  "success": true,
  "message": "Email Scheduler API is running"
}
```

## Email Scheduling Workflow

A typical scheduling request contains:

``` json
{
  "recipient": "recipient@example.com",
  "subject": "Scheduled Email",
  "body": "This email was scheduled.",
  "scheduledAt": "2026-09-01T12:00:00.000Z"
}
```

The API creates:

-   A persistent email record in MySQL
-   A corresponding BullMQ job in Redis

The worker processes the job at the scheduled time and sends the email
through the configured SMTP server.

## Email Cancellation

An email can be cancelled while it is still pending.

If an email has already been sent, cancellation is rejected.

Example application behavior:

``` text
PENDING   → can be cancelled
SENT      → cannot be cancelled
CANCELLED → no longer processed
FAILED    → delivery failed
```

## SMTP Testing

The project supports Ethereal Email for safe development/testing.

Ethereal provides a preview URL for sent messages rather than delivering
them to a real recipient inbox.

A successful worker execution produces information similar to:

``` text
Email worker started...
Processing email 8, job email-8
Email 8 sent successfully
Worker completed job email-8
Result: {
  messageId: "...@ethereal.email",
  previewUrl: "https://ethereal.email/message/..."
}
```

For production deployment, replace the SMTP configuration with the
credentials of your chosen email provider.

## Docker Services

### MySQL

Stores:

-   Users
-   Scheduled emails
-   Email logs

### Redis

Used by BullMQ for:

-   Delayed jobs
-   Queue state
-   Worker coordination

### Backend

Provides:

-   Authentication APIs
-   Email APIs
-   Scheduling logic
-   Database access

### Worker

Runs independently from the API and processes scheduled email jobs.

This separation prevents email delivery work from blocking normal API
requests.

### Frontend

The React application is built into static assets and served through
Nginx.

## Security

The application includes several security measures:

-   JWT-based authentication
-   Password hashing with bcrypt
-   Protected email endpoints
-   Helmet security headers
-   CORS configuration
-   Rate limiting support
-   Environment-based secrets
-   `.env` files excluded from version control

## Verification

Useful checks after starting the application:

``` powershell
docker compose ps
```

Verify the API:

``` powershell
Invoke-RestMethod http://localhost:5000/health
```

Verify database tables:

``` powershell
docker exec email_scheduler_mysql mysql -u scheduler -pschedulerpassword email_scheduler -e "SHOW TABLES;"
```

The database should contain the application tables and Drizzle migration
table.

## Production Build

Build the frontend:

``` powershell
cd frontend
npm run build
```

Build the backend:

``` powershell
cd ..\backend
npm run build
```

Build Docker images:

``` powershell
cd ..
docker compose build
```

Start the complete stack:

``` powershell
docker compose up -d
```

## Demo

The project demonstrates:

1.  Account registration
2.  User login
3.  JWT-protected dashboard
4.  Email composition
5.  Future email scheduling
6.  Scheduled email listing
7.  Email cancellation
8.  BullMQ delayed-job processing
9.  SMTP email delivery
10. Worker status and email processing
11. Dockerized multi-service deployment

## Repository

GitHub:

https://github.com/AnupPandey04/email-scheduler

## Hosted Application

Add the final deployed application URL here after deployment:

``` text
Hosted URL: <YOUR_DEPLOYED_APPLICATION_URL>
```

## Demo Video

Add the final Loom or Google Drive demonstration URL here:

``` text
Demo Video: <YOUR_DEMO_VIDEO_URL>
```

## Author

Anup Pandey
