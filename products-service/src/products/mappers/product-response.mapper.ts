import { ProductResponseDto } from '../dto/product-response.dto';
import { Product } from '../models/product.model';

export function toProductResponseDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    productToken: product.productToken,
    name: product.name,
    price: Number(product.price),
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
