import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async checkStock(productId: string, requestedQuantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found.`);
    }

    if (product.stock < requestedQuantity) {
      throw new BadRequestException(`Insufficient inventory for ${product.name}. Only ${product.stock} units available.`);
    }

    return { available: true, currentStock: product.stock };
  }

  async deductStockAtomic(tx: any, productId: string, variantId: string | null, quantity: number) {
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    if (variantId) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: { decrement: quantity } },
      });
    }
  }

  async replenishStock(productId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  }
}
