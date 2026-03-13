import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStock: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls service create', async () => {
    mockProductsService.create.mockResolvedValue({ id: 1 });

    const result = await controller.create({
      name: 'Keyboard',
      productToken: 'KEY-001',
      price: 100,
      stock: 5,
    });

    expect(mockProductsService.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 1 });
  });

  it('calls service find all', async () => {
    mockProductsService.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const result = await controller.findAll({ page: 1, limit: 10 });
    expect(mockProductsService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.total).toBe(0);
  });
});
