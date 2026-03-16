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
    jest.resetAllMocks();
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

  it('rethrows unknown errors on create', async () => {
    const unexpectedError = new Error('Database unavailable');
    mockProductModel.create.mockRejectedValue(unexpectedError);

    await expect(
      service.create({
        name: 'Mouse',
        productToken: 'MOUSE-001',
        price: 12.5,
        stock: 25,
      }),
    ).rejects.toThrow(unexpectedError);
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

    expect(mockProductModel.findAndCountAll).toHaveBeenCalledWith({
      offset: 0,
      limit: 10,
      order: [['id', 'ASC']],
    });

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

  it('uses default pagination values when omitted', async () => {
    mockProductModel.findAndCountAll.mockResolvedValue({
      rows: [],
      count: 0,
    });

    const result = await service.findAll({});

    expect(mockProductModel.findAndCountAll).toHaveBeenCalledWith({
      offset: 0,
      limit: 10,
      order: [['id', 'ASC']],
    });
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('calculates offset and totalPages for non-first pages', async () => {
    mockProductModel.findAndCountAll.mockResolvedValue({
      rows: [],
      count: 5,
    });

    const result = await service.findAll({ page: 2, limit: 3 });

    expect(mockProductModel.findAndCountAll).toHaveBeenCalledWith({
      offset: 3,
      limit: 3,
      order: [['id', 'ASC']],
    });
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(3);
  });

  it('returns product by id', async () => {
    mockProductModel.findByPk.mockResolvedValue({
      id: 2,
      productToken: 'MOUSE-002',
      name: 'Gaming Mouse',
      price: '99.99',
      stock: 4,
      createdAt: new Date('2026-03-13T10:00:00.000Z'),
      updatedAt: new Date('2026-03-13T10:00:00.000Z'),
    });

    const result = await service.findOne(2);

    expect(mockProductModel.findByPk).toHaveBeenCalledWith(2);
    expect(result).toEqual({
      id: 2,
      productToken: 'MOUSE-002',
      name: 'Gaming Mouse',
      price: 99.99,
      stock: 4,
      createdAt: new Date('2026-03-13T10:00:00.000Z'),
      updatedAt: new Date('2026-03-13T10:00:00.000Z'),
    });
  });

  it('throws not found when product does not exist', async () => {
    mockProductModel.findByPk.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates stock and persists product', async () => {
    const product = {
      id: 3,
      productToken: 'KEY-003',
      name: 'Keyboard',
      price: '110.00',
      stock: 8,
      createdAt: new Date('2026-03-13T10:00:00.000Z'),
      updatedAt: new Date('2026-03-13T10:00:00.000Z'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockProductModel.findByPk.mockResolvedValue(product);

    const result = await service.updateStock(3, { stock: 15 });

    expect(mockProductModel.findByPk).toHaveBeenCalledWith(3);
    expect(product.stock).toBe(15);
    expect(product.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 3,
      productToken: 'KEY-003',
      name: 'Keyboard',
      price: 110,
      stock: 15,
      createdAt: new Date('2026-03-13T10:00:00.000Z'),
      updatedAt: new Date('2026-03-13T10:00:00.000Z'),
    });
  });

  it('throws not found when updating stock for unknown product', async () => {
    mockProductModel.findByPk.mockResolvedValue(null);

    await expect(service.updateStock(999, { stock: 1 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes product by id', async () => {
    const product = {
      id: 4,
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    mockProductModel.findByPk.mockResolvedValue(product);

    await service.remove(4);

    expect(mockProductModel.findByPk).toHaveBeenCalledWith(4);
    expect(product.destroy).toHaveBeenCalledTimes(1);
  });

  it('throws not found when removing unknown product', async () => {
    mockProductModel.findByPk.mockResolvedValue(null);

    await expect(service.remove(1000)).rejects.toBeInstanceOf(NotFoundException);
  });
});
