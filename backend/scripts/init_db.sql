-- ============================================================
-- Smart Day Planner – PostgreSQL database initialization
-- Run once as a superuser (e.g. postgres):
--   psql -U postgres -f scripts/init_db.sql
-- ============================================================

-- 1. Create the dedicated database user
CREATE USER planner_user WITH PASSWORD 'yourpassword';

-- 2. Create the database owned by that user
CREATE DATABASE smart_day_planner OWNER planner_user;

-- 3. Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE smart_day_planner TO planner_user;

-- ============================================================
-- After running this script, connect to the new database and
-- grant schema-level privileges (required for PostgreSQL 15+):
--
--   \c smart_day_planner
--   GRANT ALL ON SCHEMA public TO planner_user;
-- ============================================================
