# API Documentation
**Base URL:** `http://localhost:5000/api`

### Authorization
All protected routes require a JWT token passed in the header:
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication (`/api/auth`)

### `POST /auth/setup-admin`
*Used strictly to create the very first Global Admin when the database is completely empty.*
* **Body:** `{"first_name": "Name", "email": "admin@email.com", "password": "password"}`

### `POST /auth/login`
*Logs in any user and returns a structured token.*
* **Body:** `{"email": "admin@email.com", "password": "password"}`
* **Returns:** `{ "success": true, "token": "...", "user": {id, role, vertical_id} }`

---

## 2. Verticals (`/api/verticals`)
*(Requires: GLOBAL_ADMIN role)*

### `POST /verticals`
*Creates one of the 8 organizations/divisions.*
* **Body:** `{"name": "Marketing"}`

### `GET /verticals`
*Returns list of all verticals.*

---

## 3. Users / Employees (`/api/users`)
*(Requires: ADMIN or GLOBAL_ADMIN role)*

### `POST /users`
*Creates a Co-Admin or Employee and assigns them to a vertical.*
* **Body:** `{"vertical_id": "uuid", "first_name": "Bob", "email": "bob@t.com", "password": "pw", "role": "EMPLOYEE"}`

### `GET /users`
*Gets all users in the admin's specific vertical (or all users if Global Admin).*

---

## 4. Tasks (`/api/tasks`)

### `POST /tasks`
*Creates a brand new task. (Reserved for Admins/Co-Admins)*
* **Body:** `{"vertical_id": "uuid", "title": "Buy servers", "description": "10 new servers", "priority": "HIGH", "due_date": "2026-12-31"}`

### `POST /tasks/assign`
*Assigns an existing task to one or more employees.*
* **Body:** `{"task_id": "uuid", "employee_ids": ["uuid_1", "uuid_2"]}`

### `PUT /tasks/:id/status`
*Updates a task's status and records it in history. (e.g. IN_PROGRESS, COMPLETED, REVIEWED)*
* **Body:** `{"new_status": "IN_PROGRESS"}`

### `GET /tasks`
*Returns tasks based on role. (Employees see assigned tasks, Admins see vertical tasks).*
