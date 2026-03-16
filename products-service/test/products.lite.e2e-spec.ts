import {
  ConflictException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  const mockProductsService = {
    create: jest.fn(),
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

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('/products supports full CRUD flow', async () => {
    const createdProduct = {
      id: 1,
      productToken: 'SKU-1000',
      name: 'Laptop Stand',
      price: 59.99,
      stock: 10,
    };
    const updatedProduct = {
      ...createdProduct,
      stock: 25,
    };

    mockProductsService.create
      .mockResolvedValueOnce(createdProduct)
      .mockRejectedValueOnce(
        new ConflictException('A product with this token already exists'),
      );
    mockProductsService.findOne
      .mockResolvedValueOnce(createdProduct)
      .mockRejectedValueOnce(new NotFoundException('Product with id 1 not found'));
    mockProductsService.findAll.mockResolvedValueOnce({
      items: [createdProduct],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    mockProductsService.updateStock.mockResolvedValueOnce(updatedProduct);
    mockProductsService.remove.mockResolvedValueOnce(undefined);

    const createResponse = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Laptop Stand',
        productToken: 'SKU-1000',
        price: 59.99,
        stock: 10,
      })
      .expect(201);

    expect(createResponse.body.id).toBe(1);
    expect(createResponse.body.productToken).toBe('SKU-1000');
    expect(createResponse.body.name).toBe('Laptop Stand');
    expect(createResponse.body.price).toBe(59.99);
    expect(createResponse.body.stock).toBe(10);

    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Laptop Stand Duplicate',
        productToken: 'SKU-1000',
        price: 10.99,
        stock: 1,
      })
      .expect(409);

    const getOneResponse = await request(app.getHttpServer())
      .get('/products/1')
      .expect(200);
    expect(getOneResponse.body.id).toBe(1);
    expect(getOneResponse.body.productToken).toBe('SKU-1000');

    const listResponse = await request(app.getHttpServer())
      .get('/products?page=1&limit=10')
      .expect(200);
    expect(Array.isArray(listResponse.body.items)).toBe(true);
    expect(listResponse.body.total).toBe(1);
    expect(mockProductsService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );

    const updateResponse = await request(app.getHttpServer())
      .patch('/products/1/stock')
      .send({ stock: 25 })
      .expect(200);
    expect(updateResponse.body.stock).toBe(25);
    expect(mockProductsService.updateStock).toHaveBeenCalledWith(1, { stock: 25 });

    await request(app.getHttpServer()).delete('/products/1').expect(204);
    expect(mockProductsService.remove).toHaveBeenCalledWith(1);

    await request(app.getHttpServer()).get('/products/1').expect(404);
  });
});
