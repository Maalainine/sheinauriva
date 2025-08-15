import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testProductUpdate() {
  try {
    console.log('Starting product update test...');
    
    // Create a test category
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test category for update testing'
      }
    });
    console.log('Created test category:', testCategory);

    // Create a test product with minimal required fields
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product for Update',
        description: 'This is a test product for update testing',
        category: {
          connect: { id: testCategory.id }
        },
        basePrice: 9.99,
        status: true,
        featured: false,
        onSale: false,
        images: {
          create: [
            { 
              url: 'https://example.com/test-image.jpg',
              alt: 'Test product image',
              width: 800,
              height: 600
            }
          ]
        },
        variants: {
          create: [
            {
              sku: 'TEST-SKU-001',
              price: 9.99,
              stock: 100
            }
          ]
        }
      },
      include: {
        category: true,
        images: true,
        variants: true
      }
    });

    console.log('Created test product:', JSON.stringify(testProduct, null, 2));

    // Prepare update data
    const updateData = {
      name: 'Updated Test Product',
      description: 'This product has been updated',
      categoryId: testProduct.categoryId,
      status: true,
      featured: true,
      onSale: true,
      basePrice: '19.99',
      images: [
        'https://example.com/updated-image-1.jpg',
        'https://example.com/updated-image-2.jpg'
      ],
      variants: [
        {
          sku: 'UPDATED-SKU-001',
          price: '19.99',
          stock: 50
        }
      ]
    };

    console.log('Sending update request...');
    const response = await fetch(`http://localhost:3000/api/admin/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
    }

    const updatedProduct = await response.json();
    console.log('Successfully updated product:', JSON.stringify(updatedProduct, null, 2));

    // Clean up
    console.log('Cleaning up test data...');
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    await prisma.category.delete({
      where: { id: testCategory.id }
    });

    console.log('✅ Test completed successfully!');
    return { success: true, product: updatedProduct };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Test failed:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testProductUpdate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Unhandled error:', error);
      process.exit(1);
    });
}

export { testProductUpdate };
