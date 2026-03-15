import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Unique business token for the product',
    example: 'SKU-RED-SHIRT-001',
  })
  productToken!: string;

  @ApiProperty({
    description: 'Product display name',
    example: 'Red Shirt',
  })
  name!: string;

  @ApiProperty({
    example: 29.99,
    description: 'Product price as a decimal number',
  })
  price!: number;

  @ApiProperty({
    example: 100,
    description: 'Available stock quantity',
  })
  stock!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-13T11:25:00.000Z',
    description: 'Creation date (ISO 8601 date-time string)',
  })
  createdAt!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-13T11:25:00.000Z',
    description: 'Last update date (ISO 8601 date-time string)',
  })
  updatedAt!: Date;
}
