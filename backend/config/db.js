const mysql = require('mysql2')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return DATE/TIMESTAMP as plain strings so time zones cannot shift report dates.
  dateStrings: true,
})

const promisePool = pool.promise()

const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection()
    console.log(
      '[DB] Connected successfully to database:',
      process.env.DB_NAME
    )
    connection.release()
  } catch (error) {
    console.error('[DB] Connection failed (check DB_USER and DB_PASSWORD in backend/.env):', error.message)
    process.exit(1)
  }
}

module.exports = {
  pool: promisePool,
  testConnection
}