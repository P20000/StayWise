const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || '[INTERNAL_ERROR] An unexpected server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`[ROUTE_NOT_FOUND] Endpoint ${req.originalUrl} does not exist.`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
