# 📋 User Guide — I.P.S. Task Management System
> **For:** All Users (Employees, Co-Admins, Admins, Global Admin)
> **Last Updated:** 2026-07-28

---

## 🔐 1. How to Log In

1. Open the system link in your browser
2. Enter your **Email Address** and **Password**
3. Click **Sign In**
4. You will be taken to your personal Dashboard

> 💡 **Forgot your password?** Contact your Department Admin or Global Admin to reset it.

---

## 🏠 2. Your Dashboard (Home Screen)

After login, you will see the **Dashboard** with a summary of:

| Card | What it shows |
|---|---|
| **Total Tasks** | All tasks in the system (your scope) |
| **In Progress** | Tasks currently being worked on |
| **Completed** | Tasks that are done and approved |
| **Pending Review** | Tasks waiting for Admin approval |

The **left sidebar** has all navigation links. On mobile, tap the ☰ menu icon at the top.

---

## ✅ 3. Tasks Page — The Main Workspace

Navigate to **Sidebar → Tasks**

### 3.1 Reading a Task Card

Each task card shows:
- **Priority badge** (HIGH / MEDIUM / LOW)
- **Status badge** (e.g. IN PROGRESS, COMPLETED)
- **Task title and description**
- **Department name** (e.g. ITV, AV)
- **Module badge** (e.g. `1.3 · HUMAN RESOURCE`) — if assigned to a module
- **Due date**
- **Assigned team members** (avatars)
- **S.No.** (serial number based on current page)

### 3.2 Filtering and Searching Tasks

Use the controls at the top of the Tasks page:
- **Search box** — type any keyword to filter tasks by title or description
- **Status filter** — filter by Created / Assigned / In Progress / Completed / Reviewed / Rework
- **Priority filter** — filter by High / Medium / Low
- **Sort** — sort by Newest / Oldest / Due Date / Priority
- **Page arrows** — navigate between pages (10 tasks per page)

### 3.3 Exporting Tasks to Excel

Click the **Export** button (spreadsheet icon) at the top right.
A `.xlsx` file will download with all task details.

---

## 👷 4. For Employees — How to Work on a Task

> You will only see tasks that have been assigned to **you**.

**Step 1 — Start the task:**
- Find your task card with status **ASSIGNED** or **REWORK**
- Click the yellow **"Initiate Workflow"** button
- Status changes to **IN PROGRESS**

**Step 2 — Do your work**

**Step 3 — Upload files (if needed):**
- Click the 📎 **Paperclip icon** on the task card
- Click **Upload** and choose your file (maximum 10 MB per file)
- The file appears in the list
- You or anyone with access can click ⬇️ to download it

**Step 4 — Mark task as done:**
- Click the green **"Finalize Work"** button
- Status changes to **COMPLETED**
- Your Admin will review it

**Step 5 — If sent back for Rework:**
- You will see a red **REWORK** status and a remark explaining what to fix
- Click **"Initiate Workflow"** again → do the changes → click **"Finalize Work"** again

---

## 👩‍💼 5. For Admins & Co-Admins — Managing Tasks

### 5.1 Creating a New Task

1. Click the **"New Task"** button (top right of Tasks page)
2. Fill in the form:
   - **Title** — short, clear task name
   - **Description** — detailed instructions
   - **Priority** — High / Medium / Low
   - **Due Date** — deadline
   - **Department** — select which department(s) this task is for
   - **Module** *(optional)* — appears after you select a department; pick the specific module category
3. Click **"Commit Objective"** to save

### 5.2 Assigning a Task to an Employee

1. Find the task card with status **CREATED**
2. Click **"Assign Direct"**
3. A panel opens showing all employees in your department
4. Click on the employee name(s) to assign (click again to remove)
5. Close the panel — status automatically changes to **ASSIGNED**

### 5.3 Reviewing a Completed Task

1. Find the task card with status **COMPLETED**
2. Review the work (check comments and uploaded files)
3. Choose:
   - ✅ **"Approve Asset"** → Status becomes **REVIEWED** (task is done)
   - 🔄 **"Request Rework"** → Type a reason and submit → Employee gets it back

### 5.4 Bulk Actions (Selecting Multiple Tasks)

1. Check the **checkboxes** (left side of each task card)
2. A blue banner appears at the top showing how many are selected
3. Choose:
   - **"Assign Resources"** → Assign all selected tasks to an employee in one step
   - **"Wipe Selection"** → Delete all selected tasks permanently
   - **"Clear All"** → Deselect everything

### 5.5 Leaving / Reading Comments

- Click the 💬 **Chat icon** on any task card
- Type your message and press **Send**
- All team members assigned to the task can read and reply
- Use this for questions, clarifications, or updates

---

## 🏢 6. For Global Admin — Additional Features

### 6.1 Managing Departments

**Sidebar → Departments**

- Click **"Add New Department"** and enter the name
- Click the ✏️ edit icon on any department to rename it
- Click the 🗑️ delete icon to remove a department (⚠️ this removes all users and tasks inside it)

### 6.2 Managing Modules *(Sub-categories)*

**Sidebar → Modules**

Modules are sub-categories within a Department (e.g. **`1.3 · HUMAN RESOURCE`** inside the **AV** department).

**To add a module:**
1. Select the Department from the dropdown at the top
2. Type the **Code** in hierarchical format:
   - `1` for top-level
   - `1.1`, `1.2` for sub-level
   - `1.1.1` for deep sub-level
3. Type the **Module Name** (e.g. `HUMAN RESOURCE`)
4. Click **"Commit"**

**To edit or delete:** use the ✏️ or 🗑️ icons on each module row.

> ✅ When you create a task and select exactly one department, a **Module dropdown** will automatically appear in the task form.

### 6.3 Managing Users

**Sidebar → Users**

- **Add User** — click "Add User", fill in name, email, password, role, department
- **Edit User** — click ✏️ on any user to update their details
- **Reset Password** — edit a user and set a new password
- **Disable / Enable User** — click the toggle to deactivate or reactivate a user account
- **Bulk Toggle Access** — use checkboxes to select multiple users and enable/disable them all at once

---

## 🕐 7. Audit Chronology (Full History of a Task)

Click the 🕐 **History icon** on any task card.

A timeline appears showing every status change:
- **Who** changed it
- **When** (date and time)
- **From** what status **→ To** what status
- **Reason** (if it was a Rework request)

Color-coded dots help you read the timeline at a glance:
- ⚫ Grey = Created
- 🔵 Blue = Assigned
- 🟡 Yellow = In Progress
- 🟢 Green = Completed
- 🟣 Purple = Reviewed
- 🔴 Red = Rework

---

## 👤 8. Your Profile & Changing Password

**Sidebar → Profile**

### Personal Information
- Update your **First Name**, **Last Name**, or **Email**
- Click **"Save Changes"**

### Changing Your Password
1. Go to the **"Change Password"** section
2. Enter your **Current Password** (required for security)
3. Enter your **New Password** (must be at least 6 characters)
4. Confirm the new password
5. Click **"Save Changes"**

> 🔒 **You must know your current password to set a new one.** If you forgot it, contact your Admin.

---

## 📁 9. File Upload & Download

Accessible from any task card via the 📎 **Paperclip icon**:

| Action | How |
|---|---|
| **Upload a file** | Click Upload → Select file (Max: 10 MB) |
| **Download a file** | Click the ⬇️ Download button → saves to your computer |
| **Delete a file** | Click the 🗑️ Delete button → permanent removal |

> Supported file types: any format (documents, images, PDFs, spreadsheets, etc.)

---

## ❓ 10. Quick Troubleshooting

| Problem | Solution |
|---|---|
| Can't log in | Check email/password. Contact Admin if locked out. |
| I don't see my tasks | Make sure Admin has assigned tasks to you specifically |
| File download opens new tab instead of downloading | Use the ⬇️ Download button (not any other link) |
| Password change failed | Make sure current password is typed correctly |
| Task stuck in ASSIGNED | Click "Initiate Workflow" to move it to IN PROGRESS first |
| Can't create a task | You may be an Employee role — only Admin/Co-Admin can create tasks |

---

## 📞 11. Role Summary (Quick Reference)

| Your Role | Main Purpose |
|---|---|
| **EMPLOYEE** | Do tasks assigned to you, upload files, mark complete |
| **CO_ADMIN** | Everything an Employee can do + create/assign tasks, review work |
| **ADMIN** | Everything Co-Admin can do + manage users in your department |
| **GLOBAL_ADMIN** | Full system control — departments, modules, all users, all tasks |

---

*For technical issues or system errors, contact the system administrator.*
