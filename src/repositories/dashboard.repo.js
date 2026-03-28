const pool = require('../db/pool');
const env = require('../config/env');

function qualify(table) {
  return `${env.dbSchema}.${table}`;
}

async function getDashboardData() {
  // 1. ดึงตัวเลขสถิติ (Stats)
  const statsSql = `
    SELECT 
      (SELECT COUNT(*) FROM ${qualify('books')}) AS "totalBooks",
      (SELECT COUNT(*) FROM ${qualify('books')} WHERE available = true) AS "availableBooks",
      (SELECT COUNT(*) FROM ${qualify('borrows')} WHERE returned_at IS NULL) AS "currentBorrows",
      (SELECT COUNT(*) FROM ${qualify('users')}) AS "totalUsers",
      (SELECT COUNT(*) FROM ${qualify('borrows')} WHERE returned_at IS NULL AND due_date < CURRENT_DATE) AS "overdueCount"
  `;

  // 2. ดึงรายการยืมล่าสุด 5 รายการ
  const recentSql = `
    SELECT 
      br.id, 
      u.name AS user_name, 
      b.title AS book_title, 
      TO_CHAR(br.due_date, 'YYYY-MM-DD') AS due_date,
      CASE 
        WHEN br.returned_at IS NULL THEN 'Returned' 
        WHEN br.due_date < CURRENT_DATE THEN 'Overdue'
        ELSE 'Borrowing' 
      END AS status
    FROM ${qualify('borrows')} br
    JOIN ${qualify('users')} u ON br.user_id = u.id
    JOIN ${qualify('books')} b ON br.book_id = b.book_id
    ORDER BY br.borrowed_at DESC
    LIMIT 5
  `;

  const [statsResult, recentResult] = await Promise.all([
    pool.query(statsSql),
    pool.query(recentSql)
  ]);

  return {
    stats: statsResult.rows[0],
    recentBorrows: recentResult.rows
  };
}

module.exports = { getDashboardData };