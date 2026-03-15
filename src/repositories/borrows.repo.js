const pool = require('../db/pool');
const env = require('../config/env');

function qualify(table) {
  return `${env.dbSchema}.${table}`;
}

async function bookExists(bookId) {
  const sql = `SELECT 1 AS ok FROM ${qualify('books')} WHERE book_id = $1`;
  const result = await pool.query(sql, [bookId]);
  return result.rowCount > 0;
}

async function borrowBook({ userId, bookId, dueDate }) {
  const sql = `
    WITH claimed AS (
      UPDATE ${qualify('books')}
      SET available = false
      WHERE book_id = $1 AND available = true
      RETURNING book_id
    ), inserted AS (
      INSERT INTO ${qualify('borrows')} (user_id, book_id, due_date)
      SELECT $2, claimed.book_id, $3
      FROM claimed
      RETURNING *
    )
    SELECT
      id, 
      user_id AS "userId", 
      book_id AS "bookId", 
      borrowed_at AS "borrowedAt", 
      due_date AS "dueDate", 
      returned_at AS "returnedAt"
    FROM inserted
  `;
  const result = await pool.query(sql, [bookId, userId, dueDate]);
  return result.rows[0] || null;
}

module.exports = { bookExists, borrowBook };