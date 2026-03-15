const express = require('express');
const authRequired = require('../middlewares/authRequired');
const borrowsService = require('../services/borrows.service');

const router = express.Router();

router.post('/', authRequired, async (req, res, next) => {
  try {
    const bookId = Number(req.body?.bookId);
    const dueDate = req.body?.dueDate;

    const borrow = await borrowsService.borrowBook({
      userId: Number(req.user.sub),
      bookId,
      dueDate,
    });

    res.status(201).json({ data: borrow });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
});

module.exports = router;