import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'test', 'production'])
  NODE_ENV?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DB_HOST?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  DB_PORT?: number;

  @IsString()
  @IsNotEmpty()
  DB_NAME?: string;

  @IsString()
  @IsNotEmpty()
  DB_USER?: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  SWAGGER_ENABLED?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  DB_SYNCHRONIZE?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap(error =>
      error.constraints ? Object.values(error.constraints) : [],
    );
    throw new Error(`Environment validation failed: ${messages.join('; ')}`);
  }

  return {
    ...config,
    PORT: validatedConfig.PORT,
  };
}
