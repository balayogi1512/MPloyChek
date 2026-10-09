# MPloyChek - Enterprise Verification & User Management System

A full-stack single-page application (SPA) built with modern **Angular (Standalone & Signals)** and **Node.js (TypeScript & Express)**.

Designed for employee background checks, credential audits, and role-based workforce compliance.

---

## 🌟 Key Features

1. **Role-Based Authentication**
   - Separate access roles: **`General User`** and **`Admin`**.
   - Flexible credential matching: sign in using User ID (`user` / `admin`), Full Name (`Alex Morgan`), Username, or Work Email.
   - 1-click test credential chips on the login screen for quick demonstration.

2. **Verification Records Dashboard**
   - Access-tier filtering: General Users only see standard checks; Admins see all candidate dossiers (including confidential executive checks).
   - Real-time search by candidate name, check type, position, or ID.
   - Status filters: `All`, `Verified`, `Pending Review`, and `Flagged`.

3. **Simulated API Latency & Asynchronous Processing**
   - Configurable network latency simulation via URL parameter (`?delay=ms`).
   - Live millisecond elapsed counter and shimmering skeleton loaders demonstrating async lifecycle and non-blocking architecture.

4. **Candidate Verification Dossier & Audit Trail**
   - In-depth candidate inspector modal with preset status switchers (`Verified`, `Pending Review`, `Flagged`).
   - Dynamic Risk Index slider (0 - 100) and verifier findings textarea.
   - **Tamper-Evident Audit Trail**: Automatically attributes verification sign-offs to the active user, recording timestamped transitions and previous/new status in an audit timeline.

5. **Admin User Management**
   - Route-guarded (`adminGuard` & `authGuard`) administration module (`/admin`).
   - Full CRUD capability: Add new team members, edit roles/departments, and delete users.
   - Safety dialogs: Custom Delete Confirmation Modal with safety locks preventing self-deletion of the active admin account.

---

## 🛠️ Technology Stack

- **Frontend:** Angular 21 (Standalone Components, Signals, Reactive Forms, Router Guards, Vanilla CSS tokens)
- **Backend:** Node.js, TypeScript, Express, ES Modules
- **Storage:** File-based persistent JSON database (`users.json` & `records.json`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [Git](https://git-scm.com/)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/MPloyChek.git
cd MPloyChek
```

---

### Step 2: Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:3000`.

---

### Step 3: Start Frontend Application
In a new terminal window:
```bash
cd frontend
npm install
npm start
```
Frontend will be accessible at `http://localhost:4200`.

---

## 🔑 Demo Credentials

| Role | User ID / Login | Password | Permitted Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` *(or `System Administrator`)* | `admin123` | Full access: all records, audit trail, and User Management (`/admin`) |
| **General User** | `user` *(or `Alex Morgan`)* | `password123` | General access records & verification dossier |
| **General User** | `jordan.lee` *(or `Jordan Lee`)* | `password123` | General access records & verification dossier |

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate user credentials & role |
| `GET` | `/api/records?role={role}&delay={ms}` | Fetch candidate records with role filtering & simulated latency |
| `PUT` | `/api/records/:id` | Update candidate verification status, risk score, and append audit log |
| `GET` | `/api/users?delay={ms}` | List registered user accounts (Admin only) |
| `POST` | `/api/users` | Create a new user account |
| `PUT` | `/api/users/:id` | Update an existing user account |
| `DELETE` | `/api/users/:id` | Remove a user account |
