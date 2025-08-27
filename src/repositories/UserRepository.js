const { first } = require('lodash');
const {prisma} = require('../configs/database');
const BaseRepository = require('./BaseRepository');


class UserRepository extends BaseRepository {
    constructor() {
        super(prisma.user);
    }

    async createUserWithPreferences(userData, preferences = [] ) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    ...userData,
                    preferredGenres: preferences.length > 0 ? preferences : null,
                },
            });
            return user;
        });
    }

    async findByEmail(email) {
        return this.model.findUnique({
            where: { email }
        });
    }

    async findByOAuth(provider, oauthId) {
        return this.model.findUnique({
            where: {
                oauthProvider_oauthId: {
                    oauthProvider: provider,
                    oauthId: oauthId
                }
            },
        });
    }

    async findForAuthentication(email) {
        return this.model.findUnique({
            where: { email },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                emailVerified: true,
                passwordHash: true
            }
        });
    }

    async getUserProfile(userId) {
        return this.model.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                age: true,
                preferredGenres: true,
                createdAt: true,
                status: true,
                emailVerified: true,
                paymentMethods: {
                    where: { isDefault: true },
                    select: {
                        id: true,
                        type: true, 
                        lastFour: true,
                    },
                }
            }, 
            _count: {
                select: {
                    rentals: {
                        where: { status: 'ACTIVE' },
                    }
                }
            }
        });
    }

    async updateLastLogin(user_id) {
        return this.model.update({
            where: { id: user_id },
            data: { lastLogin: new Date() }
        });
    }

    async removeTokens(userId) {
        return this.model.update({
            where: { id: userId },
            data: {
                accessToken: null,
                refreshToken: null
            }
        });
    }
}

module.exports = new UserRepository();
