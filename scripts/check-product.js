const { PrismaClient } = require('@prisma/client');

async function checkProduct() {
  const prisma = new PrismaClient();
  try {
    const productId = '9e9f3728-c1dc-4c9e-a73b-d5790b15d6b4';
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });
    
    console.log('Product:', product);
    console.log('Variants:', product?.variants || 'No variants');
  } catch (error) {
    console.error('Error checking product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
