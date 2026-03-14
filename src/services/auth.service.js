const bcrypt = require('bcrypt');
const { signAccessToken } = require('../auth/jwt');
const userRepo = require('../repositories/users.repo');

async function login({ email, password }) {
  // if (typeof email !== 'string' || typeof password !== 'string') {
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    const err = new Error('email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await userRepo.findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken({
    sub: String(user.id),
    role: 'user',
    email: user.email,
  });

  return { accessToken };
}

module.exports = {
  login,
};