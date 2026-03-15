import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class PaginatedProductsResponseDto {
  @ApiProperty({
    type: () => [ProductResponseDto],
    description: 'List of products for the current page',
  })
  items!: ProductResponseDto[];

  @ApiProperty({
    example: 125,
    description: 'Total number of products',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: 'Maximum products per page',
  })
  limit!: number;

  @ApiProperty({
    example: 13,
    description: 'Total number of available pages',
  })
  totalPages!: number;
}
