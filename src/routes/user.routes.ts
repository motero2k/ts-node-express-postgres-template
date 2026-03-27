import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { validateCreateUser } from '../middlewares/user.validator.js';
import { validateId } from '../middlewares/id.validator.js';

export const userRoutes = Router();

userRoutes.get('/', userController.getUsers);
userRoutes.get('/:id', validateId, userController.getUserById);
userRoutes.post('/', validateCreateUser, userController.createUser);
userRoutes.put('/:id', validateId, validateCreateUser, userController.updateUser);
userRoutes.delete('/:id', validateId, userController.deleteUser);
