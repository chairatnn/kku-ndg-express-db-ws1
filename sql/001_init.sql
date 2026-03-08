CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.books (
  book_id     serial PRIMARY KEY,
  title       text NOT NULL,
  author      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app.books (title, author)
VALUES
  ('Node.js Zero to Hero', 'Course Team'),
  ('Database System Concepts', 'Silberschatz et al.')
ON CONFLICT DO NOTHING;