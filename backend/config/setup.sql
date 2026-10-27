-- ============================================================
-- Medical Report Analyzer — Database Setup
-- ============================================================
-- Run this script in MySQL Workbench or MySQL CLI:
--   mysql -u root -p < setup.sql
-- ============================================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS medical_report_analyzer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE medical_report_analyzer;

-- ============================================================
-- Phase 1: Confirm database creation
-- ============================================================
SELECT 'Database medical_report_analyzer created successfully!' AS status;

-- ============================================================
-- Phase 2 tables will be added here:
-- CREATE TABLE users (...)
-- CREATE TABLE reports (...)
-- CREATE TABLE report_analyses (...)
-- CREATE TABLE chat_messages (...)
-- ============================================================
