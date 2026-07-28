# Task and Delegation Management System
## Complete Workflow Document
> **Last Updated:** 2026-07-28 | Includes: Modules, Bulk Actions, File Downloads, Audit Chronology, Profile Security

---

## System Overview
A web-based Role-Based Task Management Platform for Intellectual Paradise Services (I.P.S.), supporting multiple business departments (verticals), module-level categorization, and full audit trails.

- **Live Frontend:** Deployed on Render (configured via `.env`)
- **Live Backend API:** Deployed on Render
- **Database:** PostgreSQL via Supabase (cloud)

---

## Workflow 1: System Setup (Local Development)

```
Step 1: Start Backend Server
  ↓ cd "e:\TASK MANAGEMENT\backend" → npm run dev
  ↓ Confirm: ✅ IPS Server initialized on Port 5000

Step 2: Start Frontend Server
  ↓ cd "e:\TASK MANAGEMENT\frontend" → npm run dev
  ↓ Open browser: http://localhost:5174

Step 3: Global Admin logs in
  ↓ Use GLOBAL_ADMIN credentials
```

---

## Workflow 2: Creating Departments / Verticals (Global Admin)

```
Global Admin → Dashboard → Departments
  ↓
Click "Add New Department"
  ↓
Enter Department Name (e.g. ITV, AV, MPV...)
  ↓
Save → Department appears in list
  ↓
Repeat for all Departments
```

> **Rule:** Deleting a Department cascades and removes all tasks/users inside it.

---

## Workflow 3: Creating Modules (Global Admin) ⭐ NEW

```
Global Admin → Dashboard → Modules
  ↓
Select active Department from dropdown
  ↓
Enter Module Code (e.g. 1.1, 2.3, 1.1.1) — use hierarchical numbering
  ↓
Enter Module Name (e.g. HUMAN RESOURCE, OMNI CHANNEL)
  ↓
Click "Commit" → Module appears in the list below
  ↓
Repeat for all modules in every department
```

> **Numbering Guide:**
> - Top-level: `1`, `2`, `3`...
> - Sub-level: `1.1`, `1.2`, `2.1`...
> - Deep sub-level: `1.1.1`, `1.2.3`...
>
> Modules can be renamed or deleted at any time. Deleting a module does **not** delete tasks — tasks simply lose their module link.

---

## Workflow 4: Creating Users (Global Admin / Admin)

```
Admin → Dashboard → Users
  ↓
Click "Add User"
  ↓
Fill in: Name, Email, Password, Role, Department
  ↓
Role options:
  ├─ ADMIN        → Full control within a department
  ├─ CO_ADMIN     → Can manage tasks, not users
  └─ EMPLOYEE     → Can only view & update own tasks
  ↓
Save → User can now log in
```

> **Permission Rule:** A Vertical Admin can only create CO_ADMIN and EMPLOYEE roles.
> Only GLOBAL_ADMIN can create ADMIN accounts.

---

## Workflow 5: Creating and Assigning Tasks

```
Admin / Co-Admin → Dashboard → Tasks → "New Task"
  ↓
Fill in:
  ├─ Title
  ├─ Description
  ├─ Priority: LOW / MEDIUM / HIGH
  ├─ Due Date
  ├─ Department (checkboxes — Global Admin can select multiple or "Global")
  └─ Module (dropdown appears automatically after selecting 1 department) ⭐ NEW
  ↓
Click "Commit Objective" → Task saved with Status: CREATED
  ↓
Click "Assign Direct" on the task card
  ↓
Select one or multiple Employees
  ↓
Task Status → ASSIGNED
```

> **Multiple Verticals (Global Admin):** If multiple departments are checked, one task is created per department simultaneously.

---

## Workflow 6: Bulk Actions ⭐ NEW

```
Tasks Page → Check the checkboxes on any task cards
  ↓
A blue banner appears: "X Elements Selected"
  ↓
Option A: "Assign Resources" → Opens assign modal for all selected tasks
Option B: "Wipe Selection"   → Permanently deletes all selected tasks
Option C: "Clear All"        → Deselects everything
```

---

## Workflow 7: Employee Task Execution

```
Employee Logs In → Sees ONLY their assigned tasks
  ↓
Click "Initiate Workflow" → Status: IN_PROGRESS
  ↓
Do the work
  ↓
Upload supporting files via the 📎 paperclip icon (max 10MB each)
  ↓
Click "Finalize Work" → Status: COMPLETED
```

---

## Workflow 8: Task Review (Admin / Co-Admin)

```
Admin sees task where Status = COMPLETED
  ↓
Review the work
  ↓
Option A: "Approve Asset"  → Status: REVIEWED ✅
Option B: "Request Rework" → Status: REWORK 🔄 (enter reason)
  ↓
If REWORK: Employee is notified and must redo → Mark Complete again → Loops back
```

---

## Workflow 9: File Upload & Download ⭐ UPDATED

```
Any task card → Click 📎 (Paperclip icon)
  ↓
"File Upload" modal opens
  ↓
Click Upload button → Choose file (Max: 10MB)
  ↓
File appears in list with name + size
  ↓
Click ⬇️ Download → File downloads directly to your computer (no new tab)
Click 🗑️ Delete  → Permanently removes the file
```

---

## Workflow 10: Audit Chronology (Timeline) ⭐ UPDATED

```
Any task card → Click 🕐 (History icon)
  ↓
"Audit Chronology" modal opens
  ↓
See full timeline of every status change:
  ├─ Color-coded dots (grey/blue/yellow/green/purple/red per status)
  ├─ Who made the change
  ├─ When (date + time)
  └─ Rework remarks (if any)
```

---

## Workflow 11: Profile & Account Security ⭐ UPDATED

```
Any User → Sidebar → Profile
  ↓
Left panel: Your name, email, role, department badge
  ↓
Right panel tabs:
  ├─ Personal Information → Update Name / Email → "Save Changes"
  └─ Change Password:
       ├─ Enter Current Password (required for verification)
       ├─ Enter New Password (min. 6 characters)
       ├─ Confirm New Password
       └─ Click "Save Changes"
```

> **Security Note:** You cannot change your password without first entering your current password. This prevents unauthorized changes.

---

## Task Status Lifecycle

```
CREATED → ASSIGNED → IN_PROGRESS → COMPLETED → REVIEWED
                                       ↑              ↓
                                    REWORK ←──────────┘
```

> Every status change is logged in the audit history with a timestamp and actor — full trail.

---

## Role Permission Matrix

| Action | GLOBAL_ADMIN | ADMIN | CO_ADMIN | EMPLOYEE |
|:---|:---:|:---:|:---:|:---:|
| Manage Departments (Verticals) | ✅ | ❌ | ❌ | ❌ |
| Manage Modules | ✅ | ❌ | ❌ | ❌ |
| Create Admin Users | ✅ | ❌ | ❌ | ❌ |
| Create Co-Admin / Employee | ✅ | ✅ | ❌ | ❌ |
| Bulk Enable/Disable Users | ✅ | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ✅ | ❌ |
| Bulk Assign / Delete Tasks | ✅ | ✅ | ✅ | ❌ |
| View All Tasks (Company-wide) | ✅ | ❌ | ❌ | ❌ |
| View Department Tasks | ❌ | ✅ | ✅ | ❌ |
| View Own Tasks | ❌ | ❌ | ❌ | ✅ |
| Start / Complete Tasks | ❌ | ❌ | ✅ | ✅ |
| Approve / Request Rework | ✅ | ✅ | ❌ | ❌ |
| Upload / Download Files | ✅ | ✅ | ✅ | ✅ |
| Change Own Password | ✅ | ✅ | ✅ | ✅ |
| Export Tasks to Excel | ✅ | ✅ | ✅ | ✅ |

---

## Project File Structure (Updated)

```
TASK MANAGEMENT/
├── 📄 WORKFLOW.md                  ← Developer workflow (this file)
├── 📄 USER_GUIDE.md                ← End-user instruction guide ⭐ NEW
├── 📄 SYSTEM_HANDOVER_MASTER.md   ← Full system documentation
│
├── 📁 backend/
│   └── src/
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── verticalController.ts
│       │   ├── userController.ts
│       │   ├── taskController.ts
│       │   ├── moduleController.ts      ← NEW
│       │   ├── commentController.ts
│       │   ├── attachmentController.ts  ← Updated (download support)
│       │   └── statsController.ts
│       └── routes/
│           ├── authRoutes.ts
│           ├── verticalRoutes.ts
│           ├── userRoutes.ts            ← Updated (change-password)
│           ├── taskRoutes.ts            ← Updated (bulk actions)
│           ├── moduleRoutes.ts          ← NEW
│           ├── attachmentRoutes.ts      ← Updated (download route)
│           └── statsRoutes.ts
│
└── 📁 frontend/src/
    ├── App.tsx
    ├── components/Sidebar.tsx
    └── pages/dashboard/
        ├── DashboardHome.tsx
        ├── TasksPage.tsx            ← Updated (bulk, modules, S.No.)
        ├── UsersPage.tsx            ← Updated (bulk toggle)
        ├── VerticalsPage.tsx
        ├── ModulesPage.tsx          ← NEW
        └── ProfilePage.tsx          ← Updated (security)
```


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
