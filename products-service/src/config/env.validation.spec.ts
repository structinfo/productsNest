import 'reflect-metadata';
import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('returns config with converted PORT when env is valid', () => {
    const config = {
      NODE_ENV: 'test',
      PORT: '4001',
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'products',
      DB_USER: 'user',
      DB_PASSWORD: 'secret',
      SWAGGER_ENABLED: 'true',
      DB_SYNCHRONIZE: 'false',
    };

    const result = validateEnv(config);

    expect(result).toEqual({
      ...config,
      PORT: 4001,
    });
  });

  it('uses default PORT when not provided', () => {
    const config = {
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'products',
      DB_USER: 'user',
      DB_PASSWORD: 'secret',
    };

    const result = validateEnv(config);

    expect(result.PORT).toBe(3000);
  });

  it('throws when required database variables are missing', () => {
    const config = {
      NODE_ENV: 'test',
      PORT: 3000,
      DB_PORT: 3306,
      DB_NAME: 'products',
      DB_USER: 'user',
      DB_PASSWORD: 'secret',
    };

    expect(() => validateEnv(config)).toThrow(
      /Environment validation failed:.*DB_HOST should not be empty/,
    );
  });

  it('throws when NODE_ENV is outside allowed values', () => {
    const config = {
      NODE_ENV: 'staging',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'products',
      DB_USER: 'user',
      DB_PASSWORD: 'secret',
    };

    expect(() => validateEnv(config)).toThrow(
      /Environment validation failed:.*NODE_ENV must be one of the following values: development, test, production/,
    );
  });

  it('throws when SWAGGER_ENABLED is not boolean-like', () => {
    const config = {
      NODE_ENV: 'test',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'products',
      DB_USER: 'user',
      DB_PASSWORD: 'secret',
      SWAGGER_ENABLED: 'yes',
    };

    expect(() => validateEnv(config)).toThrow(
      /Environment validation failed:.*SWAGGER_ENABLED must be one of the following values: true, false/,
    );
  });
});
