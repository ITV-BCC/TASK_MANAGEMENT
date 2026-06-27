# Task and Delegation Management System
## Master Project Specification Document

### 1. Project Overview
The Task and Delegation Management System is a web-based platform designed to help companies assign, track, and complete tasks efficiently. The system focuses on simplicity, scalability, and clarity in task delegation and employee performance monitoring. 

**Key Architecture Update:** To support a robust organizational structure, data and workflows are strictly isolated across **8 distinct Business Verticals (Departments)**.

### 2. Core Objectives
*   **Centralized task management** for Admins and Co-Admins.
*   **Individual task tracking** for Employees.
*   **Clear status updates** through the task lifecycle: *Created → Assigned → In Progress → Completed → Reviewed (or Rework).*
*   **Strict Role-Based Access Control (RBAC)** across specific verticals.

### 3. User Roles and Permissions

| Role | Abilities | Data Access Scope |
| :--- | :--- | :--- |
| **Global Admin** | Full company control. Create Verticals, manage all users, oversee all tasks. | **ALL** (Global Access) |
| **Vertical Admin** | Manage tasks and users, review performance. Cannot manage other Verticals. | Specific Vertical Only |
| **Co-Admin** | Create, assign, and manage tasks. Cannot create/edit Admin users. | Specific Vertical Only |
| **Employee** | View assigned tasks, start work, mark as completed. | Specific Vertical Only |

### 4. Modules and Workflow

#### Phase 1: Core System
1. **User Management (Admin Only):** 
   - Create new users and set roles.
   - Assign users to one of the 8 Verticals.
   - Deactivate/edit users (Authentication currently managed via email/password).
2. **Task Creation (Admin, Co-Admin):** 
   - Define: Title, Description, Priority (Low, Medium, High), and Due Date.
   - Saves with initial status: `CREATED`.
3. **Task Assignment (Admin, Co-Admin):** 
   - Select created tasks and assign to one or multiple Employees within the Vertical.
   - Status updates automatically to: `ASSIGNED`.
4. **Task Status Update (Employee):** 
   - Employees see only tasks assigned to them.
   - Start work -> Status: `IN_PROGRESS`.
   - Finish work -> Status: `COMPLETED`.
   - *Every status change is recorded with an exact timestamp.*
5. **Task Monitoring & Review (Admin, Co-Admin):** 
   - Monitor progress inside the vertical.
   - Mark completed tasks as `REVIEWED` or send them back for `REWORK`.

#### Phase 2: Analytics & Enhancements
1. **Notifications:** Real-time or email alerts for new assignments, overdue tasks, and rework.
2. **Reports & Analytics:** Dashboard generation showing total tasks per employee, completion rates, and cross-vertical performance.

### 5. Technical Stack Architecture
*   **Database:** PostgreSQL (Selected for its superior ability to handle analytical window functions in Phase 2, strong data integrity via constraints/ENUMs, and safe concurrent reading/writing).
*   **Backend API:** *[To be determined]*
*   **Frontend web App:** *[To be determined]*

### 6. Accompanying Documentation
This master specification references the following active project files:
*   `database_architecture.md` - Detailed breakdown of tables and relation mapping.
*   `init_postgresql.sql` - Ready-to-deploy schema build scripts.
