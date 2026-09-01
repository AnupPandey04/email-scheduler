# Email Scheduler

A production-oriented email scheduling system that allows users to register, authenticate, schedule emails, cancel pending emails, and track email delivery status.

The application uses BullMQ and Redis for reliable background job processing, MySQL for persistent storage, and Ethereal SMTP for email delivery.

## Features
- User registration and login
- JWT-based authentication
- Schedule emails for future delivery
- Background email processing using BullMQ
- Redis-backed job queue
- Automatic retry with exponential backoff
- Idempotent email processing
- Email status tracking
- Processing, sent, failed, and cancelled states
- Email audit logs
- Cancel scheduled emails
- Responsive React dashboard
- Production deployment support
- Health-check endpoint
- Helmet security headers
- Morgan request logging
- API rate limiting
- Ethereal SMTP integration

## Architecture

```text
React Frontend (Render)
        |
        v
Express Backend (Render)
        |
        +----> Aiven MySQL
        |
        v
Hosted Redis
        |
        v
BullMQ Worker
        |
        v
Ethereal SMTP
```

## Tech Stack

### Frontend
React, TypeScript, Vite, Tailwind CSS, Axios

### Backend
Node.js, Express, TypeScript, JWT, bcryptjs, Helmet, Morgan, Express Rate Limit

### Database
MySQL, Aiven Cloud, Drizzle ORM

### Background Processing
Redis, BullMQ, ioredis

### Email
Nodemailer, Ethereal SMTP

### Deployment
Render, Aiven Cloud

## Project Structure

```text
email-scheduler/
├── backend/
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
│   │   └── server.ts
│   ├── Dockerfile.worker
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Email Processing Flow

```text
1. User schedules email
2. Backend validates request
3. Email record is created in MySQL
4. BullMQ delayed job is created
5. Redis stores the job
6. Job becomes available at the scheduled time
7. BullMQ worker processes the job
8. Status becomes PROCESSING
9. Nodemailer sends through Ethereal
10. Status becomes SENT
11. Audit log records the result
```

## Retry Mechanism

Email jobs use BullMQ retry functionality:

```text
attempts: 3
backoff: exponential
initial delay: 5 seconds
```

Failed jobs are retried automatically. After the final failed attempt, the email is marked `FAILED`, with the error stored in MySQL and recorded in the audit log.

## Idempotency

The worker checks the database before sending:

```text
if email.status === "SENT"
    skip processing
```

This prevents an already-sent email from being sent again if the same job is processed more than once.

## Email Statuses

| Status | Description |
|---|---|
| SCHEDULED | Email is waiting for its scheduled time |
| PROCESSING | Worker is currently processing the email |
| SENT | Email was successfully sent |
| FAILED | All retry attempts failed |
| CANCELLED | User cancelled the scheduled email |

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Emails

```text
POST   /api/emails
GET    /api/emails/all
GET    /api/emails/scheduled
GET    /api/emails/sent
GET    /api/emails/:id
DELETE /api/emails/:id
```

All email endpoints require JWT authentication.

### Health Check

```text
GET /health
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_SSL=true

REDIS_URL=

JWT_SECRET=

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

For local Redis development, `REDIS_HOST` and `REDIS_PORT` may be used instead.

Never commit `.env` or expose database passwords, Redis URLs, JWT secrets, SMTP passwords, or API keys.

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Worker

In another terminal:

```bash
cd backend
npm run worker
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173`.

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Worker

```bash
cd backend
npm run build
npm run worker:prod
```

### Frontend

```bash
cd frontend
npm run build
```

## Deployment

The frontend and backend are deployed on Render. Aiven MySQL provides persistent storage, Redis provides BullMQ queue management, and Ethereal provides test SMTP delivery.

### Worker Deployment Note

The BullMQ worker has been successfully tested against the deployed Redis instance.

The Render free environment may restrict outbound SMTP connections. Because Ethereal SMTP requires an outbound SMTP connection, the worker can be run locally while connected to the deployed Redis instance.

This allows the deployed backend to enqueue jobs into the deployed Redis queue while the local worker consumes those jobs and sends emails through Ethereal.

```text
Hosted Frontend
      |
      v
Hosted Backend
      |
      v
Aiven MySQL
      |
      v
Hosted Redis
      |
      v
Local BullMQ Worker
      |
      v
Ethereal SMTP
```

## Testing

The complete workflow has been tested using:

```text
React Frontend
      |
      v
Render Backend
      |
      v
Aiven MySQL
      |
      v
Redis
      |
      v
BullMQ
      |
      v
Worker
      |
      v
Nodemailer
      |
      v
Ethereal SMTP
```

Successful worker output:

```text
BullMQ worker is ready
BullMQ picked up job email-X
Processing email X, job email-X
Email X sent successfully
Worker completed job email-X
```

Ethereal provides a preview URL for inspecting test emails.

## Reliability

- Redis-backed asynchronous job processing
- Delayed BullMQ jobs
- Automatic retries
- Exponential backoff
- Idempotency protection
- Persistent email status
- Audit logs
- Database-first email creation
- Job IDs associated with email records

## Security

- JWT authentication
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration
- API rate limiting
- Input validation
- Environment-based secrets
- Authenticated email operations

## Future Improvements

- Deploy the worker on infrastructure that permits outbound SMTP
- Add email templates
- Add recurring schedules
- Add pagination and filtering
- Add real-time job status updates
- Add delivery analytics
- Use a production email provider such as Resend, SendGrid, or Amazon SES
- Add automated tests and CI/CD

## License

This project is developed for educational and assignment purposes.
