function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(400).json({ message: 'Record already exists' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(status).json({ message });
}

module.exports = { errorHandler };
