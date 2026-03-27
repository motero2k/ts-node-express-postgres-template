import express from 'express';
import helmet from 'helmet';
import { userRoutes } from './routes/user.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
// @ts-expect-error Upstream d.ts uses CommonJS export= while ESM build exports default.
import oasTelemetry from '@oas-tools/oas-telemetry';

const app = express();

app.use(helmet());

// Swagger setup
const swaggerPath = path.resolve(process.cwd(), 'src/api-docs/swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

app.use(
    oasTelemetry({
        general: {
            spec: JSON.stringify(swaggerDocument),
        },
    }),
);

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(healthRoutes);
app.use('/api/v1/users', userRoutes);
app.use(errorHandler);

export default app;
