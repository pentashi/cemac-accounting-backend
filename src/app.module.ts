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
        const defaultDbPort = 5432;
        const nodeEnv = config.get<string>('NODE_ENV');
        const dbSynchronizeEnv = config.get<string>('DB_SYNCHRONIZE')?.trim();
        const syncOverride = dbSynchronizeEnv?.toLowerCase();
        const databaseUrl = config.get<string>('DATABASE_URL')?.trim();

        const synchronize = syncOverride
          ? ['true', '1', 'yes', 'on'].includes(syncOverride)
          : nodeEnv !== 'production';

        const dbHost = config.get<string>('DB_HOST');
        const dbPortCandidate = parseInt(
          config.get<string>('DB_PORT') ?? String(defaultDbPort),
          10,
        );
        if (Number.isNaN(dbPortCandidate)) {
          throw new Error('DB_PORT must be a valid number.');
        }
        const dbPort = dbPortCandidate;
        const dbUser = config.get<string>('DB_USER');
        const dbPassword = config.get<string>('DB_PASSWORD');
        const dbName = config.get<string>('DB_NAME');

        if (databaseUrl) {
          const parsedUrl = new URL(databaseUrl);
          const parsedPort = parsedUrl.port
            ? parseInt(parsedUrl.port, 10)
            : defaultDbPort;
          const parsedDatabaseName = decodeURIComponent(
            parsedUrl.pathname.replace(/^\//, ''),
          );
          const database = parsedDatabaseName || dbName;

          if (!database) {
            throw new Error(
              'Database name is required. Either include it in DATABASE_URL or set DB_NAME environment variable.',
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
