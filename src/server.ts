import app from './app.js';
import { getLogger } from './utils/logger.js';
import { prisma } from './db/prisma.js';
import { bootEnv } from './config/bootConfig.js';

const logger = getLogger().setTag('server.ts');
const PORT = bootEnv.PORT;

prisma
    .$connect()
    .then(() => {
        app.listen(PORT, () => {
            logger.log(`Server running on http://localhost:${PORT}`);
            logger.log(`Docs available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((err) => {
        logger.error('Failed to connect to PostgreSQL', err);
    });

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
