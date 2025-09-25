#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      select: { id: true, name: true, basePrice: true, status: true }
    });

    console.log(`Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ID: ${product.id}, Name: ${product.name}, Price: ${product.basePrice}, Active: ${product.status}`);
    });

    const totalProducts = await prisma.product.count();
    console.log(`\nTotal products in database: ${totalProducts}`);

  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
