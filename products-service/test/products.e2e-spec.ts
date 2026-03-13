import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  const mockProductsService = {
    create: jest.fn().mockResolvedValue({
      id: 1,
      productToken: 'SKU-1000',
      name: 'Laptop Stand',
      price: 59.99,
      stock: 10,
    }),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStock: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (POST) rejects invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'A',
        productToken: '',
        price: -1,
        stock: -10,
      })
      .expect(400);
  });

  it('/products (POST) creates a product', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Laptop Stand',
        productToken: 'SKU-1000',
        price: 59.99,
        stock: 10,
      })
      .expect(201);

    expect(response.body.id).toBe(1);
  });
});
