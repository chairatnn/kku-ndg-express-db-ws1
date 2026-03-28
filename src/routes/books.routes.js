const express = require("express");
const router = express.Router();
const authRequired = require("../middlewares/authRequired");
const booksRepo = require("../repositories/books.repo");

router.get("/", async (req, res) => {
  const limit = Number(req.query.limit || 20);
  const search = req.query.search || null;
  const userId = req.query.userId ? Number(req.query.userId) : null;
  const books = await booksRepo.listBooks(limit, search, userId);
  res.json({ data: books });
});

router.post("/", async (req, res) => {
  // 1. รับค่า isbn และ category เพิ่มจาก req.body
  const { title, author, isbn, category, description } = req.body || {};

  // 2. ตรวจสอบเงื่อนไข (Validation)
  if (!title || !isbn) {
    return res.status(400).json({
      message: "Title and ISBN are required",
    });
  }

  try {
    // 3. ส่ง Object ข้อมูลทั้งหมดไปที่ Repo
    const created = await booksRepo.createBook({
      title,
      author,
      isbn,
      category,
      description,
    });

    res.status(201).json({ data: created });
  } catch (error) {
    // กรณี ISBN ซ้ำ หรือ Database Error
    res.status(500).json({ message: error.message });
  }
});

// เพิ่ม route สำหรับการดึงข้อมูลรายตัว โดยส่ง id ไปที่ repository
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const book = await booksRepo.getBookById(id);
//     if (!book) {
//       return res.status(404).json({ message: "Book not found" });
//     }
//     res.json({ data: book });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const bookId = req.params.id;
    // เรียกฟังก์ชันใน repo เพื่อหาหนังสือตาม ID
    const book = await booksRepo.findBookById(bookId);

    if (!book) {
      return res.status(404).json({ message: "ไม่พบข้อมูลหนังสือ" });
    }

    res.json({ data: book });
  } catch (error) {
    next(error);
  }
});

// ใน Express (Backend)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, category, isbn } = req.body;

  try {
    // เรียกใช้ repository เพื่ออัปเดตข้อมูลในฐานข้อมูล
    const updatedBook = await booksRepo.updateBook(id, {
      title,
      author,
      category,
      isbn,
    });

    if (updatedBook) {
      res.json({ success: true, data: updatedBook });
    } else {
      res.status(404).json({ message: "ไม่พบหนังสือที่ต้องการแก้ไข" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await booksRepo.deleteBook(id);
    if (deleted) {
      res.json({ message: "ลบหนังสือเรียบร้อยแล้ว", data: deleted });
    } else {
      res.status(404).json({ message: "ไม่พบหนังสือที่ต้องการลบ" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
