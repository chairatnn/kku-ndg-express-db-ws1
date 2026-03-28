const pool = require("../db/pool");
const env = require("../config/env");

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
      b.isbn,                  -- <--- เพิ่ม ISBN
      b.category,              -- <--- เพิ่ม Category
      b.available AS is_available, 
      br.id AS borrow_id,      
      br.user_id AS borrower_id,
      br.due_date              -- <--- เพิ่มคอลัมน์นี้จากตาราง borrows
    FROM ${qualify("books")} b
    LEFT JOIN ${qualify("borrows")} br 
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
  return result.rows.map((book) => ({
    ...book,
    // ตรวจสอบว่า userId ที่ส่งมาตรงกับ borrower_id หรือไม่
    can_return:
      userId && book.borrower_id && Number(userId) === Number(book.borrower_id),
  }));
}

async function getBookById(id) {
  const sql = `
    SELECT 
      book_id AS id, 
      title, 
      author, 
      isbn, 
      category, 
      description, 
      available AS is_available, 
      created_at
    FROM ${qualify("books")}
    WHERE book_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

async function createBook({ title, author, isbn, category, description }) {
  // เพิ่ม isbn, category, description ลงในคำสั่ง SQL
  const sql = `
    INSERT INTO ${qualify("books")} (title, author, isbn, category, description, available)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING 
      book_id AS id, 
      title, 
      author, 
      isbn, 
      category, 
      description, 
      available AS is_available, 
      created_at`;

  const values = [title, author, isbn, category, description];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// ใน Express (Repository)
// แก้ไขฟังก์ชัน updateBook ในไฟล์ src/repositories/books.repo.js

async function updateBook(id, { title, author, category, isbn }) {
  try {
    // 🛠️ แก้ไข 1: ใช้ qualify("books") เพื่อระบุ Schema ให้ถูกต้อง
    // 🛠️ แก้ไข 2: เปลี่ยนจาก WHERE id เป็น WHERE book_id ให้ตรงกับ Primary Key ของคุณ
    const sql = `
      UPDATE ${qualify("books")} 
      SET 
        title = $1, 
        author = $2, 
        category = $3, 
        isbn = $4
      WHERE book_id = $5
      RETURNING 
        book_id AS id, 
        title, 
        author, 
        isbn, 
        category, 
        available AS is_available;
    `;

    const values = [title, author, category, isbn, id];
    const result = await pool.query(sql, values);

    // คืนค่าแถวแรกที่ถูกอัปเดต
    return result.rows[0];
  } catch (error) {
    // เพิ่ม Log ตรงนี้จะช่วยให้คุณเห็น Error จริงใน Terminal ของ Express ครับ
    console.error("❌ SQL Error in updateBook:", error.message);
    throw error; // ส่ง Error ต่อไปให้ router.put จัดการพ่น 500
  }
}

async function findBookById(id) {
  const sql = `
    SELECT 
      book_id AS id, 
      title, 
      author, 
      isbn, 
      category, 
      description,
      available AS is_available
    FROM ${qualify("books")}
    WHERE book_id = $1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

async function deleteBook(id) {
  const sql = `DELETE FROM ${qualify("books")} WHERE book_id = $1 RETURNING book_id AS id;`;
  const result = await pool.query(sql, [id]);
  return result.rows[0]; // คืนค่า ID ที่ถูกลบออกไป
}

async function listAvailableBooks() {
  const sql = `SELECT book_id, title FROM ${qualify("books")} WHERE available = true ORDER BY title ASC`;
  const result = await pool.query(sql);
  return result.rows;
}

module.exports = {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  findBookById,
};
