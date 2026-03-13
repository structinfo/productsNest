import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { Product } from './models/product.model';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductModel = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a product', async () => {
    mockProductModel.create.mockResolvedValue({
      id: 1,
      productToken: 'MOUSE-001',
      name: 'Mouse',
      price: '12.50',
      stock: 25,
      createdAt: new Date('2026-03-13T10:00:00.000Z'),
      updatedAt: new Date('2026-03-13T10:00:00.000Z'),
    });

    const result = await service.create({
      name: 'Mouse',
      productToken: 'MOUSE-001',
      price: 12.5,
      stock: 25,
    });

    expect(mockProductModel.create).toHaveBeenCalledWith({
      name: 'Mouse',
      productToken: 'MOUSE-001',
      price: '12.50',
      stock: 25,
    });
    expect(result).toEqual({
      id: 1,
      productToken: 'MOUSE-001',
      name: 'Mouse',
      price: 12.5,
      stock: 25,
      createdAt: new Date('2026-03-13T10:00:00.000Z'),
      updatedAt: new Date('2026-03-13T10:00:00.000Z'),
    });
  });

  it('throws conflict when product token already exists', async () => {
    const uniqueError = new UniqueConstraintError({
      errors: [],
      fields: {},
    });
    mockProductModel.create.mockRejectedValue(uniqueError);

    await expect(
      service.create({
        name: 'Mouse',
        productToken: 'MOUSE-001',
        price: 12.5,
        stock: 25,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns paginated products', async () => {
    mockProductModel.findAndCountAll.mockResolvedValue({
      rows: [
        {
          id: 1,
          productToken: 'MOUSE-001',
          name: 'Mouse',
          price: '12.50',
          stock: 25,
          createdAt: new Date('2026-03-13T10:00:00.000Z'),
          updatedAt: new Date('2026-03-13T10:00:00.000Z'),
        },
      ],
      count: 1,
    });

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result).toEqual({
      items: [
        {
          id: 1,
          productToken: 'MOUSE-001',
          name: 'Mouse',
          price: 12.5,
          stock: 25,
          createdAt: new Date('2026-03-13T10:00:00.000Z'),
          updatedAt: new Date('2026-03-13T10:00:00.000Z'),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('throws not found when product does not exist', async () => {
    mockProductModel.findByPk.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
