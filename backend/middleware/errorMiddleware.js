/**
 * Centralized Error Handling & 404 Middleware
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    errors: ['Route does not exist']
  });
}

function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // Multer specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 5MB maximum limit.',
        errors: ['File too large']
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      errors: [err.message]
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    errors: [err.message || 'Internal Server Error']
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};

