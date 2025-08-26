
const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

/*
    Auth Routes TODO: 

    Sign-in 
    Forget Password 
    Refresh Token
    Log-out
    update profile 
    change password 
    forgot password 
    verify-email
    resend verification email 
    Sign In OR Sign-up with Google, Apple
*/

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Stream Box Auth Service' });
});

/**
 *  @route   POST /api/v1/auth/register
 *  @desc   Register a new user
 *  @access  Public
 */
router.post(
    '/register', 
    AuthController.register
);

/**
 *  @route   POST /api/v1/auth/login
 *  @desc   Login an existing user
 *  @access  Public
 */
router.post(
    '/login',
    AuthController.login
);

module.exports = router;



