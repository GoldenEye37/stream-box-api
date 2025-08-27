const bcrypt = require('bcryptjs');

const UserRepository = require('../repositories/UserRepository');
const UserSessionRepository = require('../repositories/UserSessionRepository');
const TokenBlacklistRepository = require('../repositories/TokenBlackListRepository');

const JWTHandler = require('../configs/jwt');
const ApplicationErrors = require('../utils/errors/error_handlers');

class AuthService {
    constructor() {
        this.jwtHandler = JWTHandler;
    }

    // Register a new user
    async register(userData) {
        console.log('Registering user with data:', userData);
        
        const {
            email, 
            password, 
            firstName, 
            lastName, 
            phoneNumber, 
            age, 
            preferredGenres,
        } = userData;

        // check if user exists 
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            throw new ApplicationErrors.ConflictError('User already exists');
        }

        // hash password for db saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user 
        const user = await UserRepository.createUserWithPreferences({
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            age: parseInt(age),
        }, preferredGenres);


        // return tokens
        return {
            user: this.sanitizeUser(user)
        };
    }


    async login(login_payload, deviceInfo = {}) {
        const {
            email, 
            password
        } = login_payload

        // check if user exists 
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new ApplicationErrors.UnauthorizedError('Invalid email or password');
        }

        // validate password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new ApplicationErrors.UnauthorizedError('Invalid email or password');
        }

        // generate tokens
        const userTokens = this.jwtHandler.generateTokens({
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        // update last login
        await UserRepository.updateLastLogin(user.id);

        // generate userSession
        const session = await UserSessionRepository.createSession(
            user.id, 
            userTokens.refreshToken, 
            deviceInfo, 
            deviceInfo.ipAddress || null
        );

        // return user and tokens
        return {
            user: this.sanitizeUser(user),
            tokens: {
                ...userTokens,
            },
            session: {
                id: session.id,
                deviceInfo: session.deviceInfo
            }
        };
    }

    async logout(accessToken, refreshToken, userId) {
        try {
            // Blacklist Access Token 
            if (accessToken) {
                await TokenBlacklistRepository.blacklistToken(accessToken, userId);
            }

            // Revoke the refresh token
            if (refreshToken) {
                const session = await UserSessionService.findSessionByRefreshToken(refreshToken);
                if (session) {
                    await UserSessionService.revokeSession(session.id, userId);
                }
            }

            return {
                message: 'User logged out successfully', 
                loggedOutAt: new Date()
            };
        } catch (error) {
            throw new ApplicationErrors.InternalServerError('Failed to logout user', [error.message]);
        }
    }

    async refresh_user_token(refresh_token) {
        // Verify and refresh the token
        const {valid, decoded, expired, error} = this.jwtHandler.validateRefreshToken(refresh_token);

        if (!valid) {
            const error_message = error || 'Invalid refresh token';
            throw new ApplicationErrors.UnauthorizedError(error_message);
        }

        const userData = decoded;

        // Generate new tokens
        const accessToken = this.jwtHandler.generateAccessToken({
            ...userData
        });

        // return new access token
        return {
            accessToken
        };
    }

    sanitizeUser(user){
        const { passwordHash, ...sanitizedUser } = user;
        return sanitizedUser;
    }
}

module.exports = new AuthService();