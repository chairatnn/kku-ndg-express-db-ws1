const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT 1 AS ok');
  res.json({ status: 'ok', db: result.rows[0].ok });
});

module.exports = router;