import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/standardResponse.js';
import { NotFoundError } from '../utils/customErrors.js';

function sanitizeUserData<T>(payload: T): T {
    if (Array.isArray(payload)) {
        return payload.map((item) => sanitizeUserData(item)) as T;
    }
    if (payload && typeof payload === 'object') {
        const rest = { ...(payload as Record<string, unknown>) };
        delete rest.password;
        return rest as T;
    }
    return payload;
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.createUser(req.body);
        return sendSuccess(res, {
            data: sanitizeUserData(user),
            httpStatus: 201,
            message: 'User created',
        });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getUsers();
        return sendSuccess(res, { data: sanitizeUserData(users) });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: sanitizeUserData(user) });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: sanitizeUserData(user), message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: null, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};
