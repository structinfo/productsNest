import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT?: number;

  @IsIn(['mysql', 'sqlite'])
  DB_DIALECT!: 'mysql' | 'sqlite';

  @ValidateIf((env) => env.DB_DIALECT === 'mysql')
  @IsString()
  @IsNotEmpty()
  DB_HOST?: string;

  @ValidateIf((env) => env.DB_DIALECT === 'mysql')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  DB_PORT?: number;

  @ValidateIf((env) => env.DB_DIALECT === 'mysql')
  @IsString()
  @IsNotEmpty()
  DB_NAME?: string;

  @ValidateIf((env) => env.DB_DIALECT === 'mysql')
  @IsString()
  @IsNotEmpty()
  DB_USER?: string;

  @ValidateIf((env) => env.DB_DIALECT === 'mysql')
  @IsString()
  @IsNotEmpty()
  DB_PASSWORD?: string;

  @ValidateIf((env) => env.DB_DIALECT === 'sqlite')
  @IsString()
  @IsNotEmpty()
  DB_STORAGE?: string;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : [],
    );
    throw new Error(`Environment validation failed: ${messages.join('; ')}`);
  }

  return config;
}
