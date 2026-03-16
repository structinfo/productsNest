import { ConfigService } from '@nestjs/config';

export interface SecurityRuntimeConfig {
  swaggerEnabled: boolean;
}

function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

export function getSecurityRuntimeConfig(
  configService: ConfigService,
): SecurityRuntimeConfig {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const swaggerEnabled = parseBoolean(
    configService.get<string>('SWAGGER_ENABLED'),
    !isProduction,
  );

  return {
    swaggerEnabled,
  };
}
