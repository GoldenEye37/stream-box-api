const { prisma } = require("../configs/database");
const BaseRepository = require("./BaseRepository");
const ApplicationErrors = require("../utils/errors/error_handlers");


class UserSessionRepository extends BaseRepository {
    constructor() {
        super(prisma.userSession);
    }

    async createSession(userId, refreshToken, deviceInfo = {}, ipAddress) {
        // validate device info, refreshToken, ip address 
        if (!userId || !refreshToken) {
            throw new Error('User ID and refresh token are required to create a session');
        }

        const session = prisma.$transaction(async (tx) => {
            const newSession = await tx.userSession.create({
                userId: userId,
                refreshToken: refreshToken,
                deviceInfo: deviceInfo || null,
                ipAddress: ipAddress || null
            });
            return newSession;
        });

        return session;
    }

    async updateSessionActivity(sessionId) {
        await this.model.update({
            where: { id: sessionId },
            data: { lastActivityAt: new Date() }
        });
    }

    async revokeSession(sessionId, userId){
        try {
            const session = await this.model.findUnique({
                where: { id: sessionId, userId: userId }
            });

            if (!session) {
                throw new ApplicationErrors.NotFoundError('Session not found');
            }

            await this.model.update({
                where: { id: sessionId },
                data: { 
                    isActive: false,
                    revokedAt: new Date()
                }
            });

            return session;
        } catch (error) {
            return new ApplicationErrors.DatabaseError(error.name, [error.message]);
        }
    }

    async findSessionByRefreshToken(refreshToken) {
        try {
            const session = await this.model.findUnique({
                where: { refreshToken: refreshToken }
            });

            if (!session) {
                throw new ApplicationErrors.NotFoundError('Session not found');
            }

            return session;
        } catch (error) {
            return new ApplicationErrors.DatabaseError(error.name, [error.message]);
        }
    }
}