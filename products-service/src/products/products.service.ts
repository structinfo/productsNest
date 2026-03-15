import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { toProductResponseDto } from './mappers/product-response.mapper';
import { Product } from './models/product.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  private async findProductOrThrow(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      const product = await this.productModel.create({
        ...createProductDto,
        price: createProductDto.price.toFixed(2),
      });
      return toProductResponseDto(product);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('A product with this token already exists');
      }
      throw error;
    }
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const page = paginationQueryDto.page ?? 1;
    const limit = paginationQueryDto.limit ?? 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.productModel.findAndCountAll({
      offset,
      limit,
      order: [['id', 'ASC']],
    });

    return {
      items: rows.map(product => toProductResponseDto(product)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.findProductOrThrow(id);
    return toProductResponseDto(product);
  }

  async updateStock(
    id: number,
    updateProductStockDto: UpdateProductStockDto,
  ): Promise<ProductResponseDto> {
    const product = await this.findProductOrThrow(id);
    product.stock = updateProductStockDto.stock;
    await product.save();
    return toProductResponseDto(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findProductOrThrow(id);
    await product.destroy();
  }
}
