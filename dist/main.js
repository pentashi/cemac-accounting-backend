"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('HTTP');
    app.use((req, res, next) => {
        const startTime = Date.now();
        const { method, originalUrl } = req;
        res.on('finish', () => {
            logger.log(`${method} ${originalUrl} ${res.statusCode} ${Date.now() - startTime}ms`);
        });
        next();
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CEMAC Accounting API')
        .setDescription('API documentation for the CEMAC-compliant accounting backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map