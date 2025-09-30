#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const guestOrderCount = await prisma.order.count({ where: { userId: null } });
    const clientOrderCount = await prisma.order.count({ where: { userId: { not: null } } });

    console.log('📊 Database Data Summary:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📦 Products: ${productCount}`);
    console.log(`🛍️  Total Orders: ${orderCount}`);
    console.log(`🛍️  Guest Orders: ${guestOrderCount}`);
    console.log(`👤 Client Orders: ${clientOrderCount}`);

    if (orderCount > 0) {
      const recentOrders = await prisma.order.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          total: true,
          status: true,
          userId: true,
          createdAt: true
        }
      });

      console.log('\n📋 Recent Orders:');
      recentOrders.forEach(order => {
        console.log(`  ${order.id}: ${order.customerName} - $${order.total} - ${order.status} - ${order.userId ? 'Registered' : 'Guest'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
