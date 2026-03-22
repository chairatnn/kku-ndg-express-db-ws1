const pool = require('../db/pool');
const env = require('../config/env');

function qualify(table) {
  return `${env.dbSchema}.${table}`;
}

async function listBooks(limit = 20, search = null, userId = null) {
  const params = [];
  
  // เพิ่ม br.due_date เข้าไปใน SELECT เพื่อให้ Frontend นำไปแสดงผล
  let sql = `
    SELECT 
      b.book_id AS id, 
      b.title, 
      b.author, 
      b.available AS is_available, 
      br.id AS borrow_id,      
      br.user_id AS borrower_id,
      br.due_date              -- <--- เพิ่มคอลัมน์นี้จากตาราง borrows
    FROM ${qualify('books')} b
    LEFT JOIN ${qualify('borrows')} br 
      ON b.book_id = br.book_id AND br.returned_at IS NULL
  `;

  const whereClauses = [];

  // แก้ไขจุดนี้: หากมีการส่ง userId มา ให้ใส่ลงใน params เพื่อใช้เช็คสิทธิ์ can_return
  // แต่ใน SQL นี้เราเน้นดึงข้อมูลพื้นฐานก่อน
  if (search) {
    params.push(`%${search}%`);
    sql += ` WHERE (b.title ILIKE $${params.length} OR b.author ILIKE $${params.length})`;
  }

  // จัดการลำดับ params สำหรับ LIMIT
  const limitParamIndex = params.length + 1;
  params.push(limit);
  sql += ` ORDER BY b.book_id DESC LIMIT $${limitParamIndex}`;

  const result = await pool.query(sql, params);
  
  // ส่งข้อมูลกลับไปพร้อมเช็คสิทธิ์ can_return
  return result.rows.map(book => ({
    ...book,
    // ตรวจสอบว่า userId ที่ส่งมาตรงกับ borrower_id หรือไม่
    can_return: userId && book.borrower_id && Number(userId) === Number(book.borrower_id)
  }));
}

async function getBookById(id) {
  const sql = `SELECT book_id AS id, title, author, available AS is_available, created_at
               FROM ${qualify('books')}
               WHERE book_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

async function createBook({ title, author }) {
  const sql = `INSERT INTO ${qualify('books')} (title, author, available)
               VALUES ($1, $2, true)
               RETURNING book_id AS id, title, author, available AS is_available, created_at`;
  const result = await pool.query(sql, [title, author]);
  return result.rows[0];
}

module.exports = { listBooks, getBookById, createBook };