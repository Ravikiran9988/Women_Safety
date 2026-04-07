/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    ok: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  if (err.name === 'ValidationError') {
    errorResponse.error = 'Validation Error';
    errorResponse.details = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json(errorResponse);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    errorResponse.error = `Duplicate ${field} value`;
    errorResponse.details = `${field} already exists`;
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'CastError') {
    errorResponse.error = 'Invalid ID format';
    errorResponse.details = `${err.path} must be a valid ObjectId`;
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ ...errorResponse, error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ ...errorResponse, error: 'Token expired' });
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found middleware
 */
export const notFound = (req, res, next) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};