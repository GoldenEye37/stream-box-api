const AppErrors = require('src/utils/errors/error_handlers');

const errorHandler = (error, req, res, next) => {
    let err = {...error};
    err.message = error.message;

    // LOG ONLY IN DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    // PRISMA ERRORS
    if (error.code === 'P2002') {
        err = new AppErrors.ConflictError('Unique constraint failed', [
            { path: error.meta.target, message: 'Already exists' }
        ]);
    }

    if (error.code === 'P2025') {
        err = new AppErrors.NotFoundError('Resource not found', 404, 'NOT_FOUND_ERROR');
    }

    // JWT Errors
    if (error.name === 'JsonWebTokenError') {
        err = new AppErrors.AuthenticationError('Invalid token', 401, 'INVALID_TOKEN');
    }

    if (error.name === 'TokenExpiredError') {
        err = new AppErrors.AuthenticationError('Token expired', 401, 'TOKEN_EXPIRED');
    }

    // Validation Errors from Joi 
    if (error.name === 'ValidationError' && error.details) {
        const details = error.details.map(detail => detail.message);
        err = new AppErrors.ValidationError('Validation failed', details);
    }

    // 500 Internal Server Error
    if (!err.isOperational) {
        err.statusCode = 500;
        err.code = 'INTERNAL_SERVER_ERROR';
        err.message = 'Something went wrong';
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'Something went wrong',
            ...(err.details && { details: err.details })
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
};


module.exports = errorHandler;
