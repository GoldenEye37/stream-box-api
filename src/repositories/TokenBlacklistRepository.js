const JWTHandler = require('../configs/jwt');
const ApplicationErrors = require('../utils/errors/error_handlers');

class TokenBlacklistRepository{
    constructor () {
        this.jwtHandler = JWTHandler;
        super(prisma.tokenBlacklist);
    }

    async blacklistToken(token, userId, reason = 'logout') {
        try{
            const decoded = this.jwtHandler.decodeToken(token);

            // check if token is accessToken
            if (decoded.type !== 'access') {
                throw new ApplicationErrors.TokenError('Invalid token type, pass access token for blacklisting');
            }

            if (!decoded) {
                throw new ApplicationErrors.TokenError('Invalid token');
            }

            const {jti, token_expiration_date} = decoded.payload;
            const expiryDate = new Date(token_expiration_date * 1000); // convert to ms

            if (expiryDate > new Date()) {
                await this.model.create({
                    data: {
                        jti,
                        userId,
                        token: token.substring(0, 50),
                        reason,
                        expiresAt: expiryDate
                    }
                });
            }

            return true;
        } catch (error) {
            throw new ApplicationErrors.InternalServerError('Error blacklisting token', [error.message]);
        }
    }

    async isTokenBlacklisted(token) {
        try {
            const decoded = this.jwtHandler.decodeToken(token);

            if (!decoded) {
                throw new ApplicationErrors.TokenError('Invalid token');
            }

            const { jti } = decoded.payload;

            const blacklistedToken = await this.model.findUnique({
                where: { jti }
            });

            return !!blacklistedToken;
        } catch (error) {
            throw new ApplicationErrors.InternalServerError('Error checking token blacklist', [error.message]);
        }
    }

    async cleanupExpiredTokens() {
        try {
            const now = new Date();
            await this.model.deleteMany({
                where: {
                    expiresAt: {
                        lt: now
                    }
                }
            });
        } catch (error) {
            throw new ApplicationErrors.InternalServerError('Error cleaning up expired tokens', [error.message]);
        }
    }
}

module.exports = new TokenBlacklistRepository();