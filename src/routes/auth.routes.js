
const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

/**
 *  @route   POST /api/v1/auth/register
 *  @desc   Register a new user
 *  @access  Public
 */
router.post(
    '/register', 
    AuthController.register
);


module.exports = router;



