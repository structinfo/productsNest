import { ConfigService } from '@nestjs/config';
import { Dialect } from 'sequelize';

export interface DatabaseConfig {
  dialect: Dialect;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  storage?: string;
}

export function getDatabaseConfig(configService: ConfigService): DatabaseConfig {
  const dialect = configService.getOrThrow<Dialect>('DB_DIALECT');

  if (dialect === 'sqlite') {
    return {
      dialect,
      storage: configService.getOrThrow<string>('DB_STORAGE'),
    };
  }

  return {
    dialect,
    host: configService.getOrThrow<string>('DB_HOST'),
    port: configService.getOrThrow<number>('DB_PORT'),
    username: configService.getOrThrow<string>('DB_USER'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
  };
}
