// Creates the database and all tables (safe to run many times).
// Run from the backend folder:  node config/initDb.js
// Uses the same DB_* values as the server, from backend/.env.
require('dotenv').config()
const mysql = require('mysql2/promise')

const DB_NAME = process.env.DB_NAME || 'medical_report_analyzer'

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS health_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(50),
    height_cm DOUBLE,
    weight_kg DOUBLE,
    blood_group VARCHAR(10),
    contact_number VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS health_conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS family_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    relation VARCHAR(100),
    condition_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS medical_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_name VARCHAR(255),
    report_type VARCHAR(255),
    report_date DATE,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    mime_type VARCHAR(100),
    extracted_text LONGTEXT,
    ai_summary LONGTEXT,
    processing_error VARCHAR(500),
    file_hash CHAR(64),
    processing_status VARCHAR(50) DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS lab_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    test_name VARCHAR(255),
    test_value DOUBLE,
    unit VARCHAR(50),
    reference_min DOUBLE,
    reference_max DOUBLE,
    status VARCHAR(50),
    INDEX idx_results_report (report_id),
    FOREIGN KEY (report_id) REFERENCES medical_reports(report_id) ON DELETE CASCADE
  )`,
]

async function run() {
  let conn
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
    })
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4`)
    await conn.query(`USE \`${DB_NAME}\``)
    for (const sql of TABLES) await conn.query(sql)

    // Upgrade older databases: add columns that were introduced later.
    const addColumnIfMissing = async (table, column, definition) => {
      const [cols] = await conn.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [DB_NAME, table, column]
      )
      if (cols.length === 0) await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    }
    await addColumnIfMissing('medical_reports', 'ai_summary', 'LONGTEXT')
    await addColumnIfMissing('medical_reports', 'processing_error', 'VARCHAR(500)')
    await addColumnIfMissing('medical_reports', 'file_hash', 'CHAR(64)')
    await addColumnIfMissing('health_profiles', 'contact_number', 'VARCHAR(30)')
    // FLOAT stored 10.2 as 10.199999...; DOUBLE keeps the value exactly as extracted.
    await conn.query('ALTER TABLE lab_results MODIFY test_value DOUBLE, MODIFY reference_min DOUBLE, MODIFY reference_max DOUBLE')

    console.log('[DB] Database and tables are ready')
  } catch (error) {
    console.error('[DB] Error initializing database:', error.message)
    process.exitCode = 1
  } finally {
    if (conn) await conn.end()
  }
}

run()
