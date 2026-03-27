import { ValidationError } from '../utils/customErrors.js';
import { type Request, type Response, type NextFunction } from 'express';

export function validateId(req: Request, res: Response, next: NextFunction) {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidV4Regex.test(req.params.id)) {
        return next(new ValidationError('Invalid user id', { id: req.params.id }));
    }
    next();
}
