# Task and Delegation Management System
## Complete Workflow Document

---

## System Overview
A web-based Role-Based Task Management Platform serving organizations with multiple business verticals. Currently deployed at:
- **Frontend:** `http://localhost:5174`
- **Backend API:** `http://localhost:5000/api`
- **Database:** PostgreSQL (`TaskManagement` database)

---

## Workflow 1: System Setup (One-Time)

```
Step 1: Start Backend Server
  ↓ cd "e:\TASK MANAGEMENT\backend" → npm run dev
  ↓ Confirm: ✅ Successfully connected to PostgreSQL Database!

Step 2: Start Frontend Server  
  ↓ cd "e:\TASK MANAGEMENT\frontend" → npm run dev
  ↓ Open browser: http://localhost:5174

Step 3: Global Admin logs in
  ↓ Email: admin@company.com
  ↓ Password: supersecretpassword123
```

---

## Workflow 2: Creating the 8 Verticals (Global Admin)

```
Global Admin Logs In
  ↓
Navigate to: Dashboard → Verticals
  ↓
Click "Add Vertical"
  ↓
Enter Vertical Name (e.g. Sales, HR, Marketing, Operations...)
  ↓
Save → Vertical appears in the list
  ↓
Repeat for all 8 Verticals
```

> **Important Rule:** Verticals can be renamed or deleted at any time. Deleting
> a Vertical cascades and removes all tasks/users inside it.

---

## Workflow 3: Creating Users (Global Admin / Vertical Admin)

```
Admin Logs In
  ↓
Navigate to: Dashboard → Users
  ↓
Click "Add User"
  ↓
Fill in: Name, Email, Password, Role, Vertical
  ↓
Role options:
  ├─ ADMIN        → Full control within a vertical
  ├─ CO_ADMIN     → Can manage tasks, not users
  └─ EMPLOYEE     → Can only view & update own tasks
  ↓
Save → User receives login credentials
```

> **Permission Rule:** A Vertical Admin can only create CO_ADMIN and EMPLOYEE roles
> within their own vertical. Only the GLOBAL_ADMIN can create ADMIN accounts.

---

## Workflow 4: Creating and Assigning Tasks

```
Admin / Co-Admin Logs In
  ↓
Navigate to: Dashboard → Tasks
  ↓
Click "Create Task"
  ↓
Fill in:
  ├─ Title
  ├─ Description
  ├─ Priority: LOW / MEDIUM / HIGH
  └─ Due Date
  ↓
Task is saved → Status: CREATED
  ↓
Click "Assign Task"
  ↓
Select one or multiple Employees (within same vertical)
  ↓
Task Status automatically updates → ASSIGNED
  ↓
Employee sees the task in their dashboard
```

---

## Workflow 5: Employee Task Execution

```
Employee Logs In
  ↓
Dashboard shows ONLY assigned tasks
  ↓
Employee clicks "Start Work" on a task
  ↓
Task Status → IN_PROGRESS (recorded with timestamp)
  ↓
Employee completes the work
  ↓
Employee clicks "Mark Complete"
  ↓
Task Status → COMPLETED (recorded with timestamp)
  ↓
Admin / Co-Admin receives update on dashboard
```

---

## Workflow 6: Task Review (Admin / Co-Admin)

```
Admin sees task status = COMPLETED in dashboard
  ↓
Admin reviews the completed work
  ↓
Option A: Approve → Status = REVIEWED ✅
  ↓
Option B: Send Back → Status = REWORK 🔄
  ↓ (Employee must redo and re-complete)
Task lifecycle ends at REVIEWED
```

---

## Task Status Lifecycle

```
CREATED → ASSIGNED → IN_PROGRESS → COMPLETED → REVIEWED
                                       ↑              ↓
                                    REWORK ←──────────┘
```

> Every status change is recorded in `task_status_history` table with a timestamp 
> and the user who made the change — enabling full audit trails.

---

## Role Permission Matrix

| Action | GLOBAL_ADMIN | ADMIN | CO_ADMIN | EMPLOYEE |
|:---|:---:|:---:|:---:|:---:|
| Create Verticals | ✅ | ❌ | ❌ | ❌ |
| Create Admin Users | ✅ | ❌ | ❌ | ❌ |
| Create Co-Admin/Employee | ✅ | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ✅ | ❌ |
| View All Tasks (Company) | ✅ | ❌ | ❌ | ❌ |
| View Vertical Tasks | ✅ | ✅ | ✅ | ❌ |
| View Own Tasks | ✅ | ✅ | ✅ | ✅ |
| Update Task Status | ❌ | ❌ | ❌ | ✅ |
| Review/Rework Tasks | ✅ | ✅ | ✅ | ❌ |

---

## Project File Structure

```
TASK MANAGEMENT/
├── 📄 PROJECT_SPECIFICATION.md     ← Business rules & requirements
├── 📄 database_architecture.md     ← Database mapping & ERD
├── 📄 API_DOCUMENTATION.md         ← All API endpoints reference
├── 📄 WORKFLOW.md                  ← This document (how to use the system)
├── 📄 init_postgresql.sql          ← Database build script
│
├── 📁 backend/                     ← Node.js + Express API Server
│   └── src/
│       ├── index.ts                ← Main server entry point
│       ├── config/db.ts            ← PostgreSQL connection
│       ├── middleware/
│       │   └── authMiddleware.ts   ← JWT security check
│       ├── controllers/
│       │   ├── authController.ts   ← Login logic
│       │   ├── verticalController.ts
│       │   ├── userController.ts
│       │   └── taskController.ts
│       └── routes/
│           ├── authRoutes.ts
│           ├── verticalRoutes.ts
│           ├── userRoutes.ts
│           └── taskRoutes.ts
│
└── 📁 frontend/                    ← React + Tailwind CSS UI
    └── src/
        ├── App.tsx                 ← Root router
        ├── api.ts                  ← Axios + JWT interceptor
        ├── components/
        │   └── Sidebar.tsx
        └── pages/
            ├── Login.tsx
            ├── Dashboard.tsx
            └── dashboard/
                ├── DashboardHome.tsx
                ├── TasksPage.tsx
                ├── UsersPage.tsx
                └── VerticalsPage.tsx
```
