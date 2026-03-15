import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginatedProductsResponseDto } from './dto/paginated-products-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductStockDto } from './dto/update-product-stock.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Product creation idempotency in handled by uniqueness of productToken. Subsequent calls to the creation endpoint with the same productToken end with 409 HTTP error code. It is important to properly handle this error on the requestor side.',
  })
  @ApiCreatedResponse({
    type: ProductResponseDto,
    description: 'Product created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid request payload' })
  @ApiConflictResponse({ description: 'Product token already exists' })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of products' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100)',
  })
  @ApiOkResponse({
    type: PaginatedProductsResponseDto,
    description: 'Paginated products list',
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.productsService.findAll(paginationQueryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiOkResponse({ type: ProductResponseDto, description: 'Product found' })
  @ApiBadRequestResponse({ description: 'Invalid product ID' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiOkResponse({ type: ProductResponseDto, description: 'Stock updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid product ID or payload' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductStockDto: UpdateProductStockDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateStock(id, updateProductStockDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiNoContentResponse({ description: 'Product deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid product ID' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productsService.remove(id);
  }
}
