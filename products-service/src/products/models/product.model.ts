import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'products',
  timestamps: true,
  underscored: true,
})
export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  @ApiProperty({ example: 1 })
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @ApiProperty({ example: 'SKU-RED-SHIRT-001' })
  @Unique
  @Column({
    type: DataType.STRING(128),
    allowNull: false,
  })
  declare productToken: string;

  @ApiProperty({ example: 'Red Shirt' })
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({ example: 29.99 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: string;

  @ApiProperty({ example: 100 })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare stock: number;

  @ApiProperty({ example: '2026-03-13T11:25:00.000Z' })
  declare createdAt: CreationOptional<Date>;
  @ApiProperty({ example: '2026-03-13T11:25:00.000Z' })
  declare updatedAt: CreationOptional<Date>;
}
