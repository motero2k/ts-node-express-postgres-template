import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { IUser } from '../models/user.model.js';

import { DuplicateKeyError } from '../utils/customErrors.js';

const BCRYPT_ROUNDS = 10;

const userPublicSelect = {
    id: true,
    name: true,
    email: true,
} as const;

export const createUser = async (data: Partial<IUser>) => {
    try {
        const hashedPassword = await bcrypt.hash(data.password as string, BCRYPT_ROUNDS);
        return await prisma.user.create({
            data: {
                name: data.name as string,
                email: data.email as string,
                password: hashedPassword,
            },
            select: userPublicSelect,
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new DuplicateKeyError('A user with that email already exists', err.meta);
        }
        throw err;
    }
};

export const getUsers = async () => {
    return await prisma.user.findMany({ select: userPublicSelect });
};

export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id }, select: userPublicSelect });
};

export const updateUser = async (id: string, data: Partial<IUser>) => {
    const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return null;

    try {
        const hashedPassword = data.password
            ? await bcrypt.hash(data.password, BCRYPT_ROUNDS)
            : undefined;

        return await prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(hashedPassword !== undefined ? { password: hashedPassword } : {}),
            },
            select: userPublicSelect,
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new DuplicateKeyError('A user with that email already exists', err.meta);
        }
        throw err;
    }
};

export const deleteUser = async (id: string) => {
    const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return null;
    return await prisma.user.delete({ where: { id }, select: userPublicSelect });
};
