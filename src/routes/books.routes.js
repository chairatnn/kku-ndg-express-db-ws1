const express = require('express');
const booksRepo = require('../repositories/books.repo');

const router = express.Router();

router.get('/', async (req, res) => {
  const limit = Number(req.query.limit || 20);
  const books = await booksRepo.listBooks(limit);
  res.json({ data: books });
});

router.post('/', async (req, res) => {
  const { title, author } = req.body || {};
  if (!title || !author) {
    return res.status(400).json({ message: 'title and author are required' });
  }
  const created = await booksRepo.createBook({ title, author });
  res.status(201).json({ data: created });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await booksRepo.getBookById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ data: book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;