const AuthService = require('../services/AuthService');
const JwtHandler = require('../configs/jwt');
const {
    validateUserRegistrationPayload, 
    userRegistrationSchema,
    validateUserLoginPayload,
} = require('../utils/validators/AuthValidators');
const ApplicationErrors = require('../utils/errors/error_handlers');
const StreamBoxResponse = require('../utils/response_handler');


class AuthController {
    
    async register(req, res, next) {
        try {
            const userData = req.body;

            if(!userData) {
                throw new ApplicationErrors.ValidationError('No data provided for registration');
            }

            const validation = validateUserRegistrationPayload(userData);

            if (!validation.isValid) {
                throw new ApplicationErrors.ValidationError('Invalid registration data', validation.errors);
            }

            const result = await AuthService.register(validation.data);

            return StreamBoxResponse.created(
                res, result, 'User registered successfully'
            );
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const loginData = req.body;

            if (!loginData) {
                throw new ApplicationErrors.ValidationError('No data provided for login');
            }

            // validate login data
            const validation = validateUserLoginPayload(loginData);
            if (!validation.isValid) {
                throw new ApplicationErrors.ValidationError('Invalid login data', validation.errors);
            }

            const result = await AuthService.login(loginData);

            return StreamBoxResponse.success(
                res, result, 'User logged in successfully'
            );
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { userId, jti } = req.user;
            const authHeader = req.headers.authorization;
            const accessToken = jwtConfig.extractTokenFromHeader(authHeader);

            // Get refresh token from body or extract from session
            const { refreshToken } = req.body;

            const result = await AuthService.logout(
                accessToken,
                refreshToken,
                userId
            );

            return StreamBoxResponse.success(
                res, result, 'Logged out successfully'
            );
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            // extract refresh token from headers 
            // auth header 
            const authHeader = req.headers.authorization;
            const refreshToken = JwtHandler.extractTokenFromHeader(authHeader);

            if (!refreshToken) {
                throw new ApplicationErrors.ValidationError('Invalid refresh token passed!');
            }

            const result = await AuthService.refresh_user_token(refreshToken);

            return StreamBoxResponse.success(
                res, result, 'Token refreshed successfully'
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController(AuthService);
