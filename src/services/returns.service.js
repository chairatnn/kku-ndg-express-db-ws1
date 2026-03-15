const returnsRepo = require('../repositories/returns.repo');

async function returnBook({ borrowId, userId }) {
  // 1. ตรวจสอบว่ามีรายการยืมนี้จริงหรือไม่ (404)
  const borrow = await returnsRepo.getBorrowById(borrowId);
  if (!borrow) {
    const error = new Error('Borrow record not found');
    error.status = 404;
    throw error;
  }

  // 2. ตรวจสอบว่าเป็นเจ้าของจริงหรือไม่ (403)
  // หมายเหตุ: userId ที่ได้จาก Repo อาจเป็น string หรือ number ขึ้นอยู่กับการตั้งค่า 
  // จึงควรใช้ != หรือแปลงเป็น Number ก่อนเทียบ
  if (Number(borrow.userId) !== Number(userId)) {
    const error = new Error('You do not have permission to return this book');
    error.status = 403;
    throw error;
  }

  // 3. ตรวจสอบว่าคืนไปหรือยัง (409)
  if (borrow.returnedAt) {
    const error = new Error('This book has already been returned');
    error.status = 409;
    throw error;
  }

  // 4. ทำการคืนหนังสือในฐานข้อมูล
  return await returnsRepo.returnBorrow({ borrowId, userId });
}

module.exports = { returnBook };