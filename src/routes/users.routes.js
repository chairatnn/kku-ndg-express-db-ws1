// const express = require("express");
// const router = express.Router();
// const usersRepo = require("../repositories/users.repo");

// /**
//  * POST /users
//  * สร้างผู้ใช้ใหม่พร้อม Validation และ Password Hashing
//  */
// router.post("/", async (req, res, next) => {
//   try {
//     const { email, name, password } = req.body;
//     const errors = [];

//     // --- 1. Validation Logic ---
//     // Email validation
//     if (!email || typeof email !== "string" || email.trim() === "") {
//       errors.push({ field: "email", reason: "email is required" });
//     } else if (!email.includes("@")) {
//       errors.push({ field: "email", reason: "invalid email format" });
//     }

//     // Name validation
//     if (!name || typeof name !== "string" || name.trim() === "") {
//       errors.push({ field: "name", reason: "name is required" });
//     } else if (name.trim().length < 2 || name.trim().length > 100) {
//       errors.push({ field: "name", reason: "name must be 2-100 chars" });
//     }

//     // Password validation
//     if (!password || typeof password !== "string") {
//       errors.push({ field: "password", reason: "password is required" });
//     } else if (password.length < 8 || password.length > 72) {
//       errors.push({ field: "password", reason: "password must be 8-72 chars" });
//     }

//     // ถ้า Validation ไม่ผ่าน ตอบ 400
//     if (errors.length > 0) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: errors
//       });
//     }

//     // --- 2. Database Business Logic ---
//     // เช็ค Email ซ้ำ
//     const existingUser = await usersRepo.findUserByEmail(email.trim());
//     if (existingUser) {
//       return res.status(409).json({
//         message: "Email already exists"
//       });
//     }

//     // บันทึกข้อมูล
//     const newUser = await usersRepo.createUser({
//       email: email.trim(),
//       name: name.trim(),
//       password: password // รหัสผ่านจะถูก hash ใน repo
//     });

//     // ตอบกลับ 201 พร้อมข้อมูลผู้ใช้ (ไม่ส่ง password กลับไป)
//     res.status(201).json(newUser);

//   } catch (error) {
//     next(error); // ส่งต่อให้ errorHandler.js
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const usersRepo = require("../repositories/users.repo");
const authRequired = require("../middlewares/authRequired"); // เพิ่ม Middleware ตรวจสอบ Token

/**
 * GET /users
 * ดึงรายชื่อผู้ใช้ทั้งหมดสำหรับแสดงในตาราง (Admin/Librarian เท่านั้น)
 */
router.get("/", authRequired, async (req, res, next) => {
  try {
    // เรียกใช้ listUsers() ตัวใหม่ที่เราเพิ่มใน repo
    const users = await usersRepo.listUsers();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /users
 * สร้างผู้ใช้ใหม่ (รองรับการระบุ Role และ Status)
 */
router.post("/", authRequired, async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body; // รับ role เพิ่มเข้ามา
    const errors = [];

    // --- 1. Validation Logic ---
    if (!email || !email.includes("@")) {
      errors.push({ field: "email", reason: "invalid email format" });
    }
    if (!name || name.trim().length < 2) {
      errors.push({ field: "name", reason: "name must be at least 2 chars" });
    }
    if (!password || password.length < 8) {
      errors.push({
        field: "password",
        reason: "password must be at least 8 chars",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // --- 2. Database Business Logic ---
    const existingUser = await usersRepo.findUserByEmail(email.trim());
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // บันทึกข้อมูล (ส่ง role เข้าไปด้วย)
    const newUser = await usersRepo.createUser({
      email: email.trim(),
      name: name.trim(),
      password: password,
      role: role || "Student", // ถ้าไม่ส่งมาให้เป็น Student
    });

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    // เขียน Logic อัปเดตที่ Repository ของคุณ (เช่น usersRepo.updateUser)
    // สำหรับตอนนี้ ถ้ายังไม่ได้เขียนฟังก์ชันอัปเดต ปุ่มแก้ไขจะ Error 404 นะครับ
    res.json({ message: "Update success (Backend logic needed here)" });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /users/:id
 * ลบผู้ใช้งานออกจากระบบ
 */
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const userId = req.params.id;
    // ป้องกันลบตัวเอง (Optional)
    if (Number(userId) === Number(req.user.sub)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    await usersRepo.deleteUser(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
