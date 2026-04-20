"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
function corsOrigins() {
    const raw = process.env.CORS_ORIGIN?.trim();
    if (raw) {
        return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: corsOrigins(),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('AgroTrade API')
        .setDescription('MVP API for crop preorder management')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const prismaService = app.get(prisma_service_1.PrismaService);
    prismaService.enableShutdownHooks(app);
    await app.listen(process.env.PORT ?? 3000, '127.0.0.1');
}
void bootstrap();
//# sourceMappingURL=main.js.map