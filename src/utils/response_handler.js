class StreamBoxResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static created(res, data, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }

    static error(res, error, req) {
        const statusCode = error.statusCode || 500;
        const code = error.code || 'INTERNAL_SERVER_ERROR';
        const message = error.message || 'Something went wrong';

        return res.status(statusCode).json({
            success: false,
            error: {
                code,
                message,
                ...(error.details && { details: error.details })
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

module.exports = StreamBoxResponse;