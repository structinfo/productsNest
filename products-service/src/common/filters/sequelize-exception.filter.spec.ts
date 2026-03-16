import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';
import { SequelizeExceptionFilter } from './sequelize-exception.filter';

describe('SequelizeExceptionFilter', () => {
  const buildHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  };

  it('returns conflict response for unique constraint errors', () => {
    const filter = new SequelizeExceptionFilter();
    const { host, status, json } = buildHost();
    const exception = new UniqueConstraintError({
      message: 'duplicate key',
      errors: [{ message: 'productToken must be unique' }] as never[],
      fields: {},
    });

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Unique constraint violation',
      details: ['productToken must be unique'],
    });
  });

  it('returns bad request response for validation errors with details', () => {
    const filter = new SequelizeExceptionFilter();
    const { host, status, json } = buildHost();
    const exception = Object.assign(Object.create(ValidationError.prototype), {
      errors: [{ message: 'price must be positive' }],
    }) as ValidationError;

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Database validation failed',
      details: ['price must be positive'],
    });
  });

  it('returns generic bad request response for other sequelize constraint errors', () => {
    const filter = new SequelizeExceptionFilter();
    const { host, status, json } = buildHost();
    const exception = Object.assign(
      Object.create(ForeignKeyConstraintError.prototype),
      { message: 'fk violation' },
    ) as ForeignKeyConstraintError;

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Database constraint violation',
    });
  });
});
