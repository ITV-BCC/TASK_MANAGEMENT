-- ==========================================
-- PERFORMANCE OPTIMIZATION (HIGH DATA LOADS)
-- ==========================================

-- 1. Index for Task Searching (Filters by vertical, search, and status)
CREATE INDEX IF NOT EXISTS idx_tasks_vertical_id ON tasks(vertical_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- 2. Index for User Searching (Email and Names)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_vertical_id ON users(vertical_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Trigger Indexes for Audit Trail
-- FIXED: Using correct table name 'task_status_history'
CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON task_status_history(task_id);

-- Note: We will add comments and attachments indexes once those tables are confirmed
-- CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
-- CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);

-- 4. Enable PG_TRGM for Fast Text Searching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 5. Full Text Search Index for better ILIKE performance on titles
CREATE INDEX IF NOT EXISTS idx_tasks_title_trgm ON tasks USING gin (title gin_trgm_ops);
