const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: requireEnv('DATABASE_URL'),
  dbSchema: process.env.DB_SCHEMA || 'public',
};