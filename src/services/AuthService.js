import { use } from 'react';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserRepository = require('../repositories/UserRepository');
const JWTHandler = require('../configs/jwt');
const ApplicationErrors = require('../utils/errors/error_handlers');

class AuthService {
    constructor() {
        this.jwtHandler = JWTHandler;
    }

    // Register a new user
    async register(userData) {
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

        // generate tokens 
        const userTokens = this.jwtHandler.generateTokens({
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });


        // return tokens
        return {
            user: this.sanitizeUser(user),
            tokens: {
                ...userTokens,
            },
        };
    }

    sanitizeUser(user){
        const { passwordHash, ...sanitizedUser } = user;
        return sanitizedUser;
    }
}

export default new AuthService();