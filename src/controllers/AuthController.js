const AuthService = require('../services/AuthService');
const {
    validateUserRegistrationPayload, 
    userRegistrationSchema
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

            return StreamBoxResponse.created(res, result, 'User registered successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController(AuthService);
