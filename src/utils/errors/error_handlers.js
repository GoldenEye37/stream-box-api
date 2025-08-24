class BaseErrorHandler extends Error {
  constructor(
    message, 
    statusCode, 
    code,  
    details = null 
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // capture stack trace 
  }
}

class ValidationError extends BaseErrorHandler {
    constructor(message = 'Validation failed', details = []) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}


class AuthenticationError extends BaseErrorHandler {
    constructor(message = 'Authentication failed', details = []) {
        super(message, 401, 'AUTHENTICATION_ERROR', details);
    }
}


class AuthorizationError extends BaseErrorHandler {
    constructor(message = 'Authorization failed', details = []) {
        super(message, 403, 'AUTHORIZATION_ERROR', details);
    }
}

class NotFoundError extends BaseErrorHandler {
    constructor(message = 'Resource not found', details = []) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

class ConflictError extends BaseErrorHandler {
    constructor(message = 'Resource already exists', details = []) {
        super(message, 409, 'CONFLICT_ERROR', details);
    }
}

class InternalServerError extends BaseErrorHandler {
    constructor(message = 'Internal server error', details = []) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    }
}

class DatabaseError extends BaseErrorHandler {
    constructor(message = 'Database error', details = []) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
}

class TokenError extends BaseErrorHandler {
    constructor(message = 'Token error', details = []) {
        super(message, 401, 'TOKEN_ERROR', details);
    }
}

module.exports = {
    BaseErrorHandler,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    DatabaseError,
    TokenError
};
