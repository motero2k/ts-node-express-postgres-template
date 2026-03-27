import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

type MockUser = {
    id: string;
    name: string;
    email: string;
    password: string;
};

const testState = vi.hoisted(() => ({
    users: [] as MockUser[],
}));

vi.mock('../src/repositories/user.repository.js', () => {
    const toPublicUser = (user: MockUser) => ({
        id: user.id,
        name: user.name,
        email: user.email,
    });

    return {
        createUser: async (data: Partial<MockUser>) => {
            const user: MockUser = {
                id: crypto.randomUUID(),
                name: data.name as string,
                email: data.email as string,
                password: data.password as string,
            };
            testState.users.push(user);
            return toPublicUser(user);
        },
        getUsers: async () => testState.users.map(toPublicUser),
        getUserById: async (id: string) => {
            const user = testState.users.find((u) => u.id === id);
            return user ? toPublicUser(user) : null;
        },
        updateUser: async (id: string, data: Partial<MockUser>) => {
            const index = testState.users.findIndex((u) => u.id === id);
            if (index === -1) return null;

            testState.users[index] = {
                ...testState.users[index],
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(data.password !== undefined ? { password: data.password } : {}),
            };
            return toPublicUser(testState.users[index]);
        },
        deleteUser: async (id: string) => {
            const index = testState.users.findIndex((u) => u.id === id);
            if (index === -1) return null;

            const [deleted] = testState.users.splice(index, 1);
            return toPublicUser(deleted);
        },
    };
});

beforeEach(() => {
    testState.users = [];
});

// Helper for random email
function randomEmail() {
    return `user${Math.floor(Math.random() * 100000)}@example.com`;
}

describe('Users API', () => {
    it('[+] [User] It should create a user with valid data', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send({ name: 'Test User', email: randomEmail(), password: '123456' });
        expect(res.status).toBe(201);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.email).toMatch(/@example.com$/);
        expect(res.body.success).toBe(true);
    });

    it('[+] [User] It should list users', async () => {
        const email = randomEmail();
        await request(app)
            .post('/api/v1/users')
            .send({ name: 'List User', email, password: '123456' });
        const res = await request(app).get('/api/v1/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((u: { email: string }) => u.email === email)).toBe(true);
        expect(res.body.success).toBe(true);
    });

    it('[+] [User] It should get user by id', async () => {
        const email = randomEmail();
        const createRes = await request(app)
            .post('/api/v1/users')
            .send({ name: 'GetById', email, password: '123456' });
        const id = createRes.body.data.id;
        const res = await request(app).get(`/api/v1/users/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(email);
        expect(res.body.success).toBe(true);
    });

    it('[+] [User] It should update user by id', async () => {
        const email = randomEmail();
        const createRes = await request(app)
            .post('/api/v1/users')
            .send({ name: 'UpdateUser', email, password: '123456' });
        const id = createRes.body.data.id;
        const res = await request(app)
            .put(`/api/v1/users/${id}`)
            .send({ name: 'Updated Name', email, password: '654321' });
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Updated Name');
        expect(res.body.success).toBe(true);
    });

    it('[+] [User] It should delete user by id', async () => {
        const email = randomEmail();
        const createRes = await request(app)
            .post('/api/v1/users')
            .send({ name: 'DeleteUser', email, password: '123456' });
        const id = createRes.body.data.id;
        const res = await request(app).delete(`/api/v1/users/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toBe(null);
        expect(res.body.success).toBe(true);
    });
});

describe('User API [-]', () => {
    it('[-] [User] It should not create user with missing fields', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send({ email: randomEmail(), password: '123456' }); // missing name
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not create user with invalid email', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send({ name: 'InvalidEmail', email: 'not-an-email', password: '123456' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not create user with short password', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send({ name: 'ShortPass', email: randomEmail(), password: '123' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not get user with invalid id', async () => {
        const res = await request(app).get('/api/v1/users/invalidid');
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not get user with non-existent id', async () => {
        const fakeId = '11111111-1111-4111-8111-111111111111';
        const res = await request(app).get(`/api/v1/users/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not update user with invalid id', async () => {
        const res = await request(app)
            .put('/api/v1/users/invalidid')
            .send({ name: 'Name', email: randomEmail(), password: '123456' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not update user with non-existent id', async () => {
        const fakeId = '11111111-1111-4111-8111-111111111111';
        const res = await request(app)
            .put(`/api/v1/users/${fakeId}`)
            .send({ name: 'Name', email: randomEmail(), password: '123456' });
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not delete user with invalid id', async () => {
        const res = await request(app).delete('/api/v1/users/invalidid');
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not delete user with non-existent id', async () => {
        const fakeId = '11111111-1111-4111-8111-111111111111';
        const res = await request(app).delete(`/api/v1/users/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    it('[-] [User] It should not create user with too long name', async () => {
        const res = await request(app)
            .post('/api/v1/users')
            .send({ name: 'A'.repeat(51), email: randomEmail(), password: '123456' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});
