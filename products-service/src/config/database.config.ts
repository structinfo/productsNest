import { ConfigService } from "@nestjs/config";
import { Dialect } from "sequelize";

export interface DatabaseConfig {
  dialect: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export function getDatabaseConfig(
  configService: ConfigService,
): DatabaseConfig {
  return {
    dialect: "mysql",
    host: configService.getOrThrow<string>("DB_HOST"),
    port: configService.getOrThrow<number>("DB_PORT"),
    username: configService.getOrThrow<string>("DB_USER"),
    password: configService.getOrThrow<string>("DB_PASSWORD"),
    database: configService.getOrThrow<string>("DB_NAME"),
  };
}
