import { afterAll, beforeAll } from 'vitest';

process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/template';

beforeAll(async () => {
    // Intentionally empty for now.
});

afterAll(async () => {
    // Intentionally empty for now.
});
