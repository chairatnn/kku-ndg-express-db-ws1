const express = require('express');
const authRequired = require('../middlewares/authRequired');
const returnsService = require('../services/returns.service');

const router = express.Router();

router.post('/:borrowId', authRequired, async (req, res, next) => {
  try {
    const borrowId = Number(req.params.borrowId);
    const userId = req.user.sub;

    // ตรวจสอบความถูกต้องของ borrowId (400)
    if (isNaN(borrowId)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid borrow ID format' 
      });
    }

    const result = await returnsService.returnBook({ borrowId, userId });

    res.status(200).json({ 
      status: 'success',
      data: result 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;