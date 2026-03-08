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

async function createBook({ title, author }) {
  const sql = `INSERT INTO ${qualify('books')} (title, author)
               VALUES ($1, $2)
               RETURNING book_id, title, author, created_at`;
  const result = await pool.query(sql, [title, author]);
  return result.rows[0];
}

module.exports = { listBooks, createBook };