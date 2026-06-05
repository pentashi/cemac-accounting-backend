import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const logger = new Logger('HTTP');

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      logger.log(
        `${method} ${originalUrl} ${res.statusCode} ${Date.now() - startTime}ms`,
      );
    });

    next();
  });

  const config = new DocumentBuilder()
    .setTitle('CEMAC Accounting API')
    .setDescription(
      'API documentation for the CEMAC-compliant accounting backend',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
