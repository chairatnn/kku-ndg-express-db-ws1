const express = require("express");
const router = express.Router();
const usersRepo = require("../repositories/users.repo");

/**
 * POST /users
 * สร้างผู้ใช้ใหม่พร้อม Validation และ Password Hashing
 */
router.post("/", async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const errors = [];

    // --- 1. Validation Logic ---
    // Email validation
    if (!email || typeof email !== "string" || email.trim() === "") {
      errors.push({ field: "email", reason: "email is required" });
    } else if (!email.includes("@")) {
      errors.push({ field: "email", reason: "invalid email format" });
    }

    // Name validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push({ field: "name", reason: "name is required" });
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      errors.push({ field: "name", reason: "name must be 2-100 chars" });
    }

    // Password validation
    if (!password || typeof password !== "string") {
      errors.push({ field: "password", reason: "password is required" });
    } else if (password.length < 8 || password.length > 72) {
      errors.push({ field: "password", reason: "password must be 8-72 chars" });
    }

    // ถ้า Validation ไม่ผ่าน ตอบ 400
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors
      });
    }

    // --- 2. Database Business Logic ---
    // เช็ค Email ซ้ำ
    const existingUser = await usersRepo.findUserByEmail(email.trim());
    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    // บันทึกข้อมูล
    const newUser = await usersRepo.createUser({
      email: email.trim(),
      name: name.trim(),
      password: password // รหัสผ่านจะถูก hash ใน repo
    });

    // ตอบกลับ 201 พร้อมข้อมูลผู้ใช้ (ไม่ส่ง password กลับไป)
    res.status(201).json(newUser);

  } catch (error) {
    next(error); // ส่งต่อให้ errorHandler.js
  }
});

module.exports = router;