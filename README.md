# Outbox — Email Campaign Management Dashboard

A full-stack email campaign management application developed as part of an SDE Intern assignment. The project provides a dashboard for creating email campaigns, managing recipients, and storing campaign data in PostgreSQL.

## Overview

Outbox is designed to simplify email campaign management through a web-based dashboard and a REST API. The current implementation focuses on campaign creation, database persistence, and recipient management.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript
- REST API

### Database
- PostgreSQL
- Neon PostgreSQL hosting
- `pg` PostgreSQL client

### Additional Dependencies
- Nodemailer
- BullMQ
- ioredis

Nodemailer, BullMQ, and ioredis have been installed for planned email delivery and background job processing; these features are not yet implemented.

## Implemented Features

- **Campaign creation:** Create campaigns with a name, email subject, and message body.
- **Campaign listing:** Retrieve and display saved campaigns.
- **PostgreSQL persistence:** Store campaign details in the database.
- **Recipient management:** Add email addresses to an existing campaign.
- **Email validation:** Validate recipient email address formats.
- **Duplicate prevention:** Avoid inserting duplicate email addresses within the same campaign.
- **Recipient listing:** Retrieve recipients for a campaign and display their current statuses.
- **Responsive dashboard:** Use a Tailwind CSS interface to manage campaigns and recipients.

## Project Structure

```text
outbox-email-scheduler/
├── backend/
│   ├── src/
│   │   ├── campaigns.ts
│   │   ├── db.ts
│   │   ├── init-db.ts
│   │   ├── server.ts
│   │   └── test-db.ts
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A PostgreSQL database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Anjali-Chauhan-Rajput/outbox-email-scheduler.git
cd outbox-email-scheduler
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```dotenv
PORT=3000
DATABASE_URL=your_postgresql_connection_string
```

Replace the placeholder with your own PostgreSQL connection string. Keep this file private and never commit credentials.

###
