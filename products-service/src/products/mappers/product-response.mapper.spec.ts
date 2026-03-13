import { Product } from '../models/product.model';
import { toProductResponseDto } from './product-response.mapper';

describe('toProductResponseDto', () => {
  it('maps product model fields into response dto', () => {
    const createdAt = new Date('2026-03-13T10:00:00.000Z');
    const updatedAt = new Date('2026-03-13T11:00:00.000Z');
    const product = {
      id: 1,
      productToken: 'SKU-1000',
      name: 'Laptop Stand',
      price: '59.99',
      stock: 10,
      createdAt,
      updatedAt,
    } as Product;

    const dto = toProductResponseDto(product);

    expect(dto).toEqual({
      id: 1,
      productToken: 'SKU-1000',
      name: 'Laptop Stand',
      price: 59.99,
      stock: 10,
      createdAt,
      updatedAt,
    });
  });
});
