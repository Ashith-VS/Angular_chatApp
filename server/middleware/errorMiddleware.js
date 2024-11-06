// 404 Not Found Middleware
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404)
    next(error);
}

// General Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if no error status is set
    res.status(statusCode);
    res.json({
        message: err.message,
        // Only include stack trace in development environment
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
}


module.exports = { notFound, errorHandler };