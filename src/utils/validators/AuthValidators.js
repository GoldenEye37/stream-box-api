const Joi = require('joi');
const { functions } = require('lodash');

/**
 * *************************************************************************************
 *                                         JOI Schemas
 * *************************************************************************************
 */
/**
 * Example user registration JSON:
 * {
 *   "email": "john.doe@example.com",
 *   "password": "StrongP@ssw0rd!",
 *   "passwordConfirmation": "StrongP@ssw0rd!",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "phoneNumber": "+12345678901",
 *   "age": 25,
 *   "preferredGenres": ["Action", "Comedy"]
 * }
 */
const userRegistrationSchema = Joi.object({
    email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),

    passwordConfirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password confirmation must match password',
      'any.required': 'Password confirmation is required'
    }),
    
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'any.required': 'First name is required'
    }),
    
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'any.required': 'Last name is required'
    }),
    
  phoneNumber: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required'
    }),
    
  age: Joi.number()
    .integer()
    .min(13)
    .max(120)
    .required()
    .messages({
      'number.min': 'You must be at least 13 years old',
      'number.max': 'Age cannot exceed 120',
      'any.required': 'Age is required'
    }),
    
  preferredGenres: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'Please select at least one preferred genre',
      'array.max': 'You can select up to 10 preferred genres',
      'any.required': 'Preferred genres are required'
    })

});


const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    })
});

/**
 * *************************************************************************************
 *                                         Validators
 * *************************************************************************************
 */

function validateUserRegistrationPayload(userData) {
    const { error, value } = userRegistrationSchema.validate(userData,{
        abortEarly: false, // Get all errors, not just the first
        stripUnknown: true, // Remove unknown keys
    });
    
    if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return {
      isValid: false,
      errors: errorMessages,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

function validateUserLoginPayload(loginData) {
    const { error, value } = userLoginSchema.validate(loginData, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        const errorMessages = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return {
            isValid: false,
            errors: errorMessages,
            data: null
        };
    }

    return {
        isValid: true,
        errors: [],
        data: value
    };
}

module.exports = {
    validateUserRegistrationPayload, 
    validateUserLoginPayload,
    userRegistrationSchema,
    userLoginSchema
};