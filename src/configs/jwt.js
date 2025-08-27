const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTHandler{
    constructor () {
        this.accessTokenSecret = process.env.JWT_SECRET
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET
        this.accessTokenExpiry = process.env.JWT_EXPIRES_IN;
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN;
        this.issuer = process.env.JWT_ISSUER;
        this.audience = process.env.JWT_AUDIENCE;

        // TODO: ADD Validate secrets method here 
    }
    
    validateSecrets () {
        if (!this.accessTokenSecret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        if (!this.refreshTokenSecret) {
            throw new Error('JWT_REFRESH_SECRET environment variable is required');
        }
        if (this.accessTokenSecret.length < 32) {
            throw new Error('JWT_SECRET must be at least 32 characters long');
        }
        if (this.refreshTokenSecret.length < 32) {
            throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
        }
    }

    // Generate access token 
    generateAccessToken (payload) {
        const tokenPayload = {
            ...payload, 
            type: 'access', 
            iat: Math.floor(Date.now() / 1000), // issued at 
            jti: crypto.randomUUID() // JWT ID
        }

        return jwt.sign(tokenPayload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
            issuer: this.issuer,
            audience: this.audience, 
            subject: payload.userId?.toString(), // subject is the user ID
            algorithm: 'HS256'
        });
    }

    // Generate refresh token 
    generateRefreshToken (payload) {
        const tokenPayload = {
            ...payload,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000), // issued at
            jti: crypto.randomUUID() // JWT ID
        }

        return jwt.sign(tokenPayload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry,
            issuer: this.issuer,
            audience: this.audience,
            subject: payload.userId?.toString(), // subject is the user ID
            algorithm: 'HS256'
        });
    }

    // Generate Both Access Token and Refresh Token
    generateTokens (payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return { 
            accessToken, 
            refreshToken, 
            accessTokenExpiry: this.accessTokenExpiry, 
            refreshTokenExpiry: this.refreshTokenExpiry
        };
    }


    // Validate Access Token
    validateAccessToken (token) {
        try {
            const decoded = jwt.verify(token, this.accessTokenSecret, {
                issuer: this.issuer,
                audience: this.audience, 
                algorithms: ['HS256']
            });

            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }

            return { 
                valid: true, 
                decoded, 
                expired: false
            };
        } catch (error) {
            return { 
                valid: false, 
                decoded: null,
                expired: error.name === 'TokenExpiredError', 
                error: error.message
            };
        }
    }

    // validate Refresh Token 
    validateRefreshToken (token) {
        try {
            const decoded = jwt.verify(token, this.refreshTokenSecret, {
                issuer: this.issuer,
                audience: this.audience, 
                algorithms: ['HS256']
            });

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            return { 
                valid: true, 
                decoded, 
                expired: false
            };
        } catch (error) {
            return { 
                valid: false, 
                decoded: null,
                expired: error.name === 'TokenExpiredError', 
                error: error.message
            };
        }
    }

    extractTokenFromHeader(authHeader) {
        try {
            if (!authHeader) {
                return null;
            }

            const [authType, token] = authHeader.split(' ');

            if (authType !== 'Bearer' || !token) {
                return null;
            }

            return token;

        } catch (error) {
            return null;
        }
    }
}

module.exports = new JWTHandler();