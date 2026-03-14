const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const env = require("../config/env");

/**
 * ค้นหา User ด้วย Email แบบละเอียด (ใช้สำหรับ Login และเช็คความซ้ำซ้อน)
 * ดึง password_hash ออกมาด้วยเพื่อใช้ตรวจสอบรหัสผ่าน
 */
async function findUserByEmail(email) {
  const sql = `
    SELECT id, email, name, password_hash
    FROM ${env.dbSchema}.users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await pool.query(sql, [email]);
  return result.rows[0] || null;
}

/**
 * บันทึก User ใหม่ลงฐานข้อมูล
 */
async function createUser({ email, name, password }) {
  // 1. Hash รหัสผ่านก่อนบันทึก (Work Factor = 10)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 2. บันทึกลงตาราง app.users
  const query = `
    INSERT INTO app.users (email, name, password_hash, status)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, name, created_at AS "createdAt"
  `;
  
  const values = [email, name, passwordHash, 'active'];
  const result = await pool.query(query, values);
  
  return result.rows[0];
}

module.exports = {
  findUserByEmail,
  createUser,
};