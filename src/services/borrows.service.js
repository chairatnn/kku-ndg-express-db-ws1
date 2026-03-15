const borrowsRepo = require('../repositories/borrows.repo');

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function conflict(message) {
  const err = new Error(message);
  err.status = 409;
  return err;
}

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

async function borrowBook({ userId, bookId, dueDate }) {
  if (!Number.isFinite(bookId)) throw badRequest('bookId is required');
  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw badRequest('dueDate must be YYYY-MM-DD');
  }

  const exists = await borrowsRepo.bookExists(bookId);
  if (!exists) throw notFound('Book not found');

  const borrow = await borrowsRepo.borrowBook({ userId, bookId, dueDate });
  if (!borrow) throw conflict('Book is not available');
  return borrow;
}

module.exports = { borrowBook };