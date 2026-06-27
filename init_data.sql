-- ==========================================
-- SEED DATA FOR INTELLECTUAL PARADISE SERVICES
-- ==========================================

-- 1. Create the 8 Core Verticals (Departments)
INSERT INTO verticals (name) VALUES 
('Industrial Relations'),
('Marketing & Sales'),
('Operations & Logistics'),
('Human Resources'),
('Finance & Accounts'),
('Technology & IT'),
('Legal & Compliance'),
('Research & Development');

-- 2. Create the First GLOBAL ADMIN User
-- PASSWORD: admin123 (Change this immediately after your first login!)
-- Note: In a real system, we'd use the hashed password. 
-- For the first login, I'm using a pre-hashed string for 'admin123'
INSERT INTO users (first_name, last_name, email, password_hash, role) 
VALUES (
    'Super', 
    'Admin', 
    'admin@ips.com', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hashed version of 'admin123'
    'GLOBAL_ADMIN'
);
