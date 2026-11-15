# Employee Onboarding Management System

Web application to manage employee onboarding records with login, document upload, qualifications and work experience.

## Tech Stack

- Frontend: React, React Bootstrap, React Router, Axios
- Backend: Node.js, Express, Multer, JWT, bcrypt
- Database: Microsoft SQL Server with Prisma ORM

## Features

- Sign up, login and logout (JWT)
- Admin approves new users before they can login
- Add, view, edit and delete employees (delete only for admin)
- Add / remove multiple qualifications and work experiences
- Upload profile photo, resume and experience certificates (max 5MB each)
- Search by name or email, filter by department, sorting and pagination
- Admin can approve users, change role and remove users

## Setup

### 1. SQL Server

- Install SQL Server Express and SQL Server Management Studio (optional)
- Open **SQL Server Configuration Manager** -> SQL Server Network Configuration -> Protocols for SQLEXPRESS
- Enable **TCP/IP**, open its Properties -> IP Addresses -> IPAll -> set **TCP Port** to `1433` and clear TCP Dynamic Ports
- Restart the SQL Server (SQLEXPRESS) service

If SQL Server stops right after starting on Windows 11 (NVMe SSD), run this in Command Prompt as administrator and restart the PC:

```
REG ADD "HKLM\SYSTEM\CurrentControlSet\Services\stornvme\Parameters\Device" /v "ForcedPhysicalSectorSizeInBytes" /t REG_MULTI_SZ /d "* 4095" /f
```

### 2. Backend

```
cd backend
npm install
```

Copy `.env.example` to `.env` and change the values (ACCESS_TOKEN_SECRET, admin email and password).

Create the database tables and the first admin:

```
npx prisma migrate deploy
npm run create-admin
```

Start the server:

```
npm run dev
```

Server runs on http://localhost:5001

### 3. Frontend

```
cd frontend
npm install
```

Copy `.env.example` to `.env`, then:

```
npm run dev
```

Open http://localhost:5173 and login with the admin email and password from backend `.env`.

## API

| Method | Route | Access |
|---|---|---|
| POST | /api/users/register | public |
| POST | /api/users/login | public |
| GET | /api/users/current | logged in |
| GET | /api/users | admin |
| PUT | /api/users/:id/approve | admin |
| PUT | /api/users/:id/role | admin |
| DELETE | /api/users/:id | admin |
| GET | /api/employees | logged in |
| GET | /api/employees/check-email?email=&id= | logged in |
| GET | /api/employees/:id | logged in |
| POST | /api/employees | logged in |
| PUT | /api/employees/:id | logged in |
| DELETE | /api/employees/:id | admin |
| GET | /api/files/:id | logged in |
