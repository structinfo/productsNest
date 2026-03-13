import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'SKU-RED-SHIRT-001',
    minLength: 3,
    maxLength: 128,
    description: 'Unique business token for the product',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 128)
  productToken!: string;

  @ApiProperty({
    example: 'Red Shirt',
    minLength: 2,
    maxLength: 255,
    description: 'Display name of the product',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name!: string;

  @ApiProperty({
    example: 29.99,
    description: 'Product price in decimal format with up to 2 decimal places',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({
    example: 100,
    minimum: 0,
    description: 'Current stock quantity',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  stock!: number;
}
