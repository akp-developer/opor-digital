import { body } from 'express-validator';

export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),
    
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),
    
    body('role')
        .isIn(['admin', 'staff', 'user'])
        .withMessage('Role must be either admin, staff, or user'),
    
    body('tenantCode')
        .trim()
        .notEmpty()
        .withMessage('Tenant code is required')
];

export const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    body('tenantCode')
        .trim()
        .notEmpty()
        .withMessage('Tenant code is required')
];