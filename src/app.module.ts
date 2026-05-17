import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FactureModule } from './invoice/facture.module';
import { PartnerModule } from './partner/partner.module';

import { EcritureModule } from './accounting/ecriture.module';

import { ReportingModule } from './reporting/reporting.module';

import { UserModule } from './user/user.module';

import { AuditModule } from './audit/audit.module';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV');
        const dbSynchronizeEnv = config.get<string>('DB_SYNCHRONIZE')?.trim();
        const syncOverride = dbSynchronizeEnv?.toLowerCase();
        const databaseUrl = config.get<string>('DATABASE_URL')?.trim();

        const synchronize = syncOverride
          ? ['true', '1', 'yes', 'on'].includes(syncOverride)
          : nodeEnv !== 'production';

        const dbHost = config.get<string>('DB_HOST');
        const dbPort = parseInt(config.get<string>('DB_PORT') ?? '5432', 10);
        const dbUser = config.get<string>('DB_USER');
        const dbPassword = config.get<string>('DB_PASSWORD');
        const dbName = config.get<string>('DB_NAME');

        if (databaseUrl) {
          const parsedUrl = new URL(databaseUrl);
          const parsedPort = parsedUrl.port
            ? parseInt(parsedUrl.port, 10)
            : 5432;
          const parsedDatabaseName = decodeURIComponent(
            parsedUrl.pathname.replace(/^\//, ''),
          );
          const database = parsedDatabaseName || dbName;

          if (!database) {
            throw new Error(
              'DATABASE_URL must include a database name or DB_NAME must be set.',
            );
          }
          return {
            type: 'postgres',
            host: parsedUrl.hostname,
            port: parsedPort,
            username: decodeURIComponent(parsedUrl.username),
            password: decodeURIComponent(parsedUrl.password),
            database,
            autoLoadEntities: true,
            synchronize,
            ssl:
              config.get<string>('DB_SSL')?.toLowerCase() === 'false'
                ? false
                : nodeEnv === 'production'
                  ? { rejectUnauthorized: false }
                  : false,
          };
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPassword,
          database: dbName,
          autoLoadEntities: true,
          synchronize,
        };
      },
    }),
    AuthModule,
    FactureModule,
    PartnerModule,
    EcritureModule,
    ReportingModule,
    UserModule,
    AuditModule,
    NotificationModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
