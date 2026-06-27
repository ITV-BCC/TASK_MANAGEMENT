# 🚀 TaskFlow: Enterprise Task & Delegation Master System
## Complete System Documentation & Handover Guide

Welcome to the **TaskFlow** Command Center. This document provides a comprehensive overview of the enterprise-grade management system designed for Bharat Career Connect.

---

## 🏗️ System Architecture
The application is built on a high-performance **MERN-like** stack optimized for vertical-based organizational management.

- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + Recharts (BI Analytics)
- **Backend:** Node.js + Express.js + Multer (Asset Management)
- **Database:** PostgreSQL (Relational Integrity with GIN/B-Tree Indexing)
- **Theme:** Dual-Theme (Sleek Dark Mode / Executive Light Mode)

---

## 💎 Core Enterprise Features

### 1. Unified Operations Dashboard
- **Real-Time Analytics:** Visual trends of task completion and production velocity.
- **Global Stats:** High-level overview of Totals, In-Progress, and Rework states.
- **Departmental Logic:** Global Admins see the whole company; Verticals see only their own sectors.

### 2. Task & Objective Lifecycle
- **Step-by-Step Workflow:** Created → Assigned → In Progress → Completed → Reviewed/Rework.
- **Audit Chronology:** Every single status change is recorded in an audit trail for management reviews.
- **Real-Time Comms:** Integrated chat channel for every individual task for seamless alignment.

### 3. Identity & Access Management (IAM)
- **Role-Based Access (RBAC):**
  - **Global Admin:** Full system control, department creation, system-wide search.
  - **Admin:** Manage specific vertical users and tasks.
  - **Co-Admin:** Assistance in task assignment.
  - **Employee:** Focused view of personal assigned objectives.
- **Security Reset:** Admins can override passkeys for any system member.

### 4. High-Performance Data Handling
- **Server-Side Pagination:** The UI only loads 10 records at a time, ensuring fast performance even with **1M+ rows**.
- **Live Fuzzy Search:** Instant keyword searching across Titles, Descriptions, and Personnel IDs.
- **Strategic Indexing:** PostgreSQL GIN indexes handle heavy search loads during peak operations.

---

## 🔒 Security & Scaling Protocols

### 📂 Asset Management (File Uploads)
- **10MB Limit:** Hard-coded limits on both Frontend and Backend to prevent server bloat.
- **Secure Storage:** Files are stored with unique hash-identifiers to prevent naming collisions.
- **Access Control:** Personnel can only see attachments for tasks they are authorized to access.

### 🌓 Performance Theming
- **Forced CSS Overrides:** Custom CSS engine ensures Light/Dark themes apply flawlessly across all browser types and mobile devices.
- **Transition Buffer:** Smooth animation curves between states to maintain a premium feel.

---

## 🚀 Deployment Instructions

### 1. Database Initialization
Run the following SQL files in order:
1. `init_postgresql.sql` (Schema Creation)
2. `optimize_db.sql` (Speed & Indexing)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env (DATABASE_URL, JWT_SECRET)
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Key Project Files for Maintenance
- `backend/src/controllers/taskController.ts`: Core business logic for tasks.
- `frontend/src/pages/dashboard/TasksPage.tsx`: Main Task Command Center UI.
- `backend/src/routes/attachmentRoutes.ts`: Security rules for file uploads.
- `frontend/src/index.css`: Global "Global Force" theme engine variables.

---

## 🛠️ Next Steps & Roadmap
1. **Real-Time Notifications:** Integrate Socket.io for instant alerts on task assignments.
2. **Mobile App:** Convert the current responsive PWA into a dedicated Android/iOS build.
3. **Automated Reporting:** Schedule weekly Excel reports to be sent via email to Global Admins.

**Project Status:** 🟢 STABLE / ENTERPRISE-READY
**Author:** Antigravity (Advanced Agentic Coding Team)
