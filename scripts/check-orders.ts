#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    // Check recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          select: {
            productName: true,
            quantity: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            totalSpent: true,
            ordersCount: true
          }
        }
      }
    });

    console.log(`Found ${recentOrders.length} recent orders:`);

    recentOrders.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log(`ID: ${order.id}`);
      console.log(`Customer: ${order.customerName} (${order.customerEmail})`);
      console.log(`Total: ${order.total} MAD`);
      console.log(`Status: ${order.status}`);
      console.log(`Created: ${order.createdAt.toISOString()}`);
      console.log(`User ID: ${order.userId || 'Guest order'}`);

      if (order.user) {
        console.log(`User stats: ${order.user.ordersCount} orders, ${order.user.totalSpent} MAD spent`);
      }

      console.log('Items:');
      order.orderItems.forEach(item => {
        console.log(`  - ${item.quantity}x ${item.productName} @ ${item.price} MAD`);
      });
    });

    // Check total counts
    const totalOrders = await prisma.order.count();
    const guestOrders = await prisma.order.count({ where: { userId: null } });
    const userOrders = await prisma.order.count({ where: { userId: { not: null } } });

    console.log(`\n=== Summary ===`);
    console.log(`Total orders: ${totalOrders}`);
    console.log(`Guest orders: ${guestOrders}`);
    console.log(`User orders: ${userOrders}`);

  } catch (error) {
    console.error('Error checking orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
