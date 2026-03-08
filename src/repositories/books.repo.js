const pool = require('../db/pool');
const env = require('../config/env');

function qualify(table) {
  return `${env.dbSchema}.${table}`;
}

async function listBooks(limit = 20) {
  const sql = `SELECT book_id, title, author, created_at
               FROM ${qualify('books')}
               ORDER BY book_id DESC
               LIMIT $1`;
  const result = await pool.query(sql, [limit]);
  return result.rows;
}

// เพิ่มฟังก์ชัน getBookById
async function getBookById(id) {
  const sql = `SELECT book_id, title, author, category_id, created_at
               FROM ${qualify('books')}
               WHERE book_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0]; // ส่งคืน Object แถวแรก หรือ undefined ถ้าไม่พบ
}

async function createBook({ title, author }) {
  const sql = `INSERT INTO ${qualify('books')} (title, author)
               VALUES ($1, $2)
               RETURNING book_id, title, author, created_at`;
  const result = await pool.query(sql, [title, author]);
  return result.rows[0];
}

module.exports = { listBooks, getBookById, createBook };