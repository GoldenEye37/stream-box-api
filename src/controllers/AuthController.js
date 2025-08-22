const AuthService = require('../services/AuthService');

class AuthController {
    
    constructor(AuthService) {
        this.AuthService = AuthService;
    }

    async register(req, res) {
        try {
            const userData = req.body;
            const validation = validateUserRegistrationPayload(userData);

            if (!validation.isValid) {
                return res.status(400).json({ errors: validation.errors });
            }

            const result = await this.AuthService.register(validation.data);

            return res.status(201).json(result);
        } catch (error) {
            return res.status(500 ).json({ error: error.message });
        }
    }
}
