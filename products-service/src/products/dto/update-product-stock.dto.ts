import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateProductStockDto {
  @ApiProperty({
    example: 42,
    minimum: 0,
    description: 'New stock quantity for the product',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;
}
