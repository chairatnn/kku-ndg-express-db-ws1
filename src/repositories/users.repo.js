// const pool = require("../db/pool");
// const bcrypt = require("bcrypt");
// const env = require("../config/env");


// function qualify(table) {
//   return `${env.dbSchema}.${table}`;
// }

// /**
//  * ค้นหา User ด้วย Email แบบละเอียด (ใช้สำหรับ Login และเช็คความซ้ำซ้อน)
//  * ดึง password_hash ออกมาด้วยเพื่อใช้ตรวจสอบรหัสผ่าน
//  */
// async function findUserByEmail(email) {
//   const sql = `
//     SELECT id, email, name, password_hash
//     FROM ${env.dbSchema}.users
//     WHERE email = $1
//     LIMIT 1
//   `;
//   const result = await pool.query(sql, [email]);
//   return result.rows[0] || null;
// }

// /**
//  * บันทึก User ใหม่ลงฐานข้อมูล
//  */
// async function createUser({ email, name, password }) {
//   // 1. Hash รหัสผ่านก่อนบันทึก (Work Factor = 10)
//   const saltRounds = 10;
//   const passwordHash = await bcrypt.hash(password, saltRounds);

//   // 2. บันทึกลงตาราง app.users
//   const query = `
//     INSERT INTO app.users (email, name, password_hash, status)
//     VALUES ($1, $2, $3, $4)
//     RETURNING id, email, name, created_at AS "createdAt"
//   `;
  
//   // กำหนดค่าเริ่มต้นเป็น 'active' และรับ role จาก parameter
//   const values = [email, name, passwordHash, role, 'active'];
//   const result = await pool.query(query, values);
  
//   return result.rows[0];
// }

// async function listAllUsers() {
//   const sql = `SELECT id, name FROM ${qualify("users")} ORDER BY name ASC`;
//   const result = await pool.query(sql);
//   return result.rows;
// }


// module.exports = {
//   findUserByEmail,
//   createUser,
//   listAllUsers,
// };




const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const env = require("../config/env");

function qualify(table) {
  return `${env.dbSchema}.${table}`;
}

/**
 * ค้นหา User ด้วย Email
 */
async function findUserByEmail(email) {
  const sql = `
    SELECT id, email, name, password_hash, role, status
    FROM ${qualify("users")}
    WHERE email = $1
    LIMIT 1
  `;
  const result = await pool.query(sql, [email]);
  return result.rows[0] || null;
}

/**
 * บันทึก User ใหม่
 */
async function createUser({ email, name, password, role = 'Student' }) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const query = `
    INSERT INTO ${qualify("users")} (email, name, password_hash, role, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, name, role, status, created_at AS "createdAt"
  `;
  
  // กำหนดค่าเริ่มต้นเป็น 'active' และรับ role จาก parameter
  const values = [email, name, passwordHash, role, 'active'];
  const result = await pool.query(query, values);
  
  return result.rows[0];
}

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับหน้าจัดการ Users)
 */
async function listUsers() {
  const sql = `
    SELECT id, name, email, role, status, created_at
    FROM ${qualify("users")}
    ORDER BY id DESC
  `;
  const result = await pool.query(sql);
  return result.rows;
}

/**
 * ดึงรายชื่อแบบย่อ (สำหรับ Dropdown ในหน้า Borrow)
 */
async function listAllUsers() {
  const sql = `SELECT id, name FROM ${qualify("users")} WHERE status = 'Active' ORDER BY name ASC`;
  const result = await pool.query(sql);
  return result.rows;
}

/**
 * ลบผู้ใช้งาน
 */
async function deleteUser(id) {
  const sql = `DELETE FROM ${qualify("users")} WHERE id = $1`;
  return await pool.query(sql, [id]);
}

module.exports = {
  findUserByEmail,
  createUser,
  listUsers,    // สำหรับหน้าจัดการ
  listAllUsers, // สำหรับ Dropdown
  deleteUser
};