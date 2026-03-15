const pool = require('../db/pool');
const env = require('../config/env');

function qualify(table) {
  return `${env.dbSchema}.${table}`;
}

/**
 * ดึงข้อมูลการยืมเพื่อนำไปตรวจสอบเงื่อนไข (404, 403, 409) ใน Service
 */
async function getBorrowById(borrowId) {
  const sql = `
    SELECT 
      id, 
      user_id AS "userId", 
      book_id AS "bookId", 
      returned_at AS "returnedAt"
    FROM ${qualify('borrows')}
    WHERE id = $1
    LIMIT 1
  `;
  const result = await pool.query(sql, [borrowId]);
  return result.rows[0] || null;
}

/**
 * ทำการคืนหนังสือ:
 * 1. Update ตาราง borrows ตั้งค่า returned_at
 * 2. Update ตาราง books ตั้งค่า available = true
 */
async function returnBorrow({ borrowId, userId }) {
  const sql = `
    WITH updated_borrow AS (
      UPDATE ${qualify('borrows')}
      SET returned_at = NOW()
      WHERE id = $1 
        AND user_id = $2 
        AND returned_at IS NULL
      RETURNING id, user_id, book_id, borrowed_at, due_date, returned_at
    ), 
    updated_book AS (
      UPDATE ${qualify('books')}
      SET available = true
      WHERE book_id = (SELECT book_id FROM updated_borrow) -- แก้เป็น book_id ตาม schema จริง
    )
    SELECT 
      id, 
      user_id AS "userId", 
      book_id AS "bookId", 
      borrowed_at AS "borrowedAt", 
      due_date AS "dueDate", 
      returned_at AS "returnedAt"
    FROM updated_borrow;
  `;
  
  const result = await pool.query(sql, [borrowId, userId]);
  return result.rows[0] || null;
}

module.exports = { getBorrowById, returnBorrow };