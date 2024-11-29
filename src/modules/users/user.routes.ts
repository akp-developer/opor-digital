// src/modules/users/user.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import UserController from './user.controller';
import { AuthMiddleware } from '../auth/auth.middleware';
import { userValidation } from './user.validation';
import { validateRequest } from '../../core/middleware/validation.middleware';

const router = Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`User Route: ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length) {
    console.log('Body:', req.body);
  }
  next();
});

// Protect all routes
router.use(AuthMiddleware.protect);

// Admin only routes
router.use(AuthMiddleware.roles('admin'));

// User management routes
router.route('/')
  .get(UserController.getUsers.bind(UserController))
  .post(
    userValidation.createUser,
    validateRequest,
    UserController.createUser.bind(UserController)
  );

router.route('/:id')
  .get(UserController.getUser.bind(UserController))
  .put(
    userValidation.updateUser,
    validateRequest,
    UserController.updateUser.bind(UserController)
  )
  .delete(UserController.deleteUser.bind(UserController));

// Update user status
router.patch('/:id/status',
  [
    ...userValidation.updateUser.filter(v => 
      v.toString().includes('id')),
    body('status')
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('สถานะไม่ถูกต้อง')
  ],
  validateRequest,
  UserController.updateStatus.bind(UserController)
);

// Update password
router.put('/:id/password',
  userValidation.updatePassword,
  validateRequest,
  UserController.updatePassword.bind(UserController)
);

export default router;