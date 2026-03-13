import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'SKU-RED-SHIRT-001' })
  productToken!: string;

  @ApiProperty({ example: 'Red Shirt' })
  name!: string;

  @ApiProperty({
    example: 29.99,
    description: 'Product price as a decimal number',
  })
  price!: number;

  @ApiProperty({ example: 100 })
  stock!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-13T11:25:00.000Z',
    description: 'ISO 8601 date-time string',
  })
  createdAt!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-13T11:25:00.000Z',
    description: 'ISO 8601 date-time string',
  })
  updatedAt!: Date;
}
