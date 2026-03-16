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
    jest.resetAllMocks();
  });

  it('calls service create', async () => {
    const createDto = {
      name: 'Keyboard',
      productToken: 'KEY-001',
      price: 100,
      stock: 5,
    };
    mockProductsService.create.mockResolvedValue({ id: 1 });

    const result = await controller.create(createDto);

    expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
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
    expect(mockProductsService.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(result.total).toBe(0);
  });

  it('calls service find one', async () => {
    mockProductsService.findOne.mockResolvedValue({ id: 42 });

    const result = await controller.findOne(42);

    expect(mockProductsService.findOne).toHaveBeenCalledWith(42);
    expect(result).toEqual({ id: 42 });
  });

  it('calls service update stock', async () => {
    const updateStockDto = { stock: 77 };
    mockProductsService.updateStock.mockResolvedValue({ id: 7, stock: 77 });

    const result = await controller.updateStock(7, updateStockDto);

    expect(mockProductsService.updateStock).toHaveBeenCalledWith(7, {
      stock: 77,
    });
    expect(result).toEqual({ id: 7, stock: 77 });
  });

  it('calls service remove', async () => {
    mockProductsService.remove.mockResolvedValue(undefined);

    await controller.remove(11);

    expect(mockProductsService.remove).toHaveBeenCalledWith(11);
  });
});
