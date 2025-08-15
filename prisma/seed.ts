import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create one admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sheinauriva.com' },
    update: {},
    create: {
      email: 'admin@sheinauriva.com',
      name: 'Site Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
      analytics: {
        create: {
          totalSpent: 0,
          ordersCount: 0,
        },
      },
      shippingAddresses: {
        create: [
          {
            address1: '123 Admin St',
            city: 'Admin City',
            state: 'Admin State',
            postalCode: '00000',
            country: 'Adminland',
            isDefault: true,
          },
        ],
      },
    },
  });

  // 1b. Create several client users
  const clientUsers = [
    {
      email: 'alice@sheinauriva.com',
      name: 'Alice Example',
      password: await hash('alicepass', 10),
      address: {
        address1: '1 Wonderland Ave',
        city: 'Wonder City',
        state: 'Dream State',
        postalCode: '10101',
        country: 'Fictionland',
      }
    },
    {
      email: 'bob@sheinauriva.com',
      name: 'Bob Builder',
      password: await hash('bobpass', 10),
      address: {
        address1: '2 Construction Rd',
        city: 'Buildtown',
        state: 'Workstate',
        postalCode: '20202',
        country: 'Fixitland',
      }
    },
    {
      email: 'carol@sheinauriva.com',
      name: 'Carol Shopper',
      password: await hash('carolpass', 10),
      address: {
        address1: '3 Shopping Blvd',
        city: 'Mall City',
        state: 'Spendstate',
        postalCode: '30303',
        country: 'Buyland',
      }
    }
  ];
  for (const user of clientUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: user.password,
        role: UserRole.CLIENT,
        analytics: {
          create: {
            totalSpent: 0,
            ordersCount: 0,
          },
        },
        shippingAddresses: {
          create: [
            {
              ...user.address,
              isDefault: true,
            },
          ],
        },
      },
    });
  }

  // 2. Create brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Nike',
        description: 'Just Do It',
        website: 'https://www.nike.com',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'The North Face',
        description: 'Never Stop Exploring',
        website: 'https://www.thenorthface.com',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/The_North_Face_logo.svg/1200px-The_North_Face_logo.svg.png',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Puma',
        description: 'Forever Faster',
        website: 'https://www.puma.com',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Puma_AG_Logo.svg/1200px-Puma_AG_Logo.svg.png',
      },
    }),
  ]);

  const [nike, northFace, puma] = brands;

  // 2. Create tags
  const tagNames = ['Summer', 'Winter', 'Sale', 'New', 'Popular', 'Eco'];
  for (const name of tagNames) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  const [summer, winter, sale, newTag, popular, eco] = await prisma.tag.findMany({ where: { name: { in: tagNames } } });
  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: { name: 'Clothing' },
  });
  const shoes = await prisma.category.upsert({
    where: { name: 'Shoes' },
    update: {},
    create: { name: 'Shoes' },
  });
  const accessories = await prisma.category.upsert({
    where: { name: 'Accessories' },
    update: {},
    create: { name: 'Accessories' },
  });

  // Connect tags to categories
  await prisma.category.update({
    where: { id: clothing.id },
    data: { tags: { connect: [{ id: summer.id }, { id: sale.id }, { id: newTag.id }] } },
  });
  await prisma.category.update({
    where: { id: shoes.id },
    data: { tags: { connect: [{ id: winter.id }, { id: popular.id }] } },
  });
  await prisma.category.update({
    where: { id: accessories.id },
    data: { tags: { connect: [{ id: eco.id }, { id: sale.id }] } },
  });

  // 4. Create products with variants, images, and tags
  // First, create the t-shirt product
  const tshirt = await prisma.product.upsert({
    where: { id: (await prisma.product.findFirst({ where: { name: 'Summer T-Shirt' } }))?.id || '' },
    update: {},
    create: {
      name: 'Summer T-Shirt',
      description: 'Lightweight and perfect for summer.',
      price: 1999, // Price in cents
      stock: 0, // Stock is managed by variants
      categoryId: clothing.id,
      brandId: nike.id,
    },
  });

  // Create variant types for t-shirt
  const colorType = await prisma.productVariantType.create({
    data: {
      name: 'Color',
      isRequired: true,
      order: 1,
      productId: tshirt.id,
    },
  });

  const sizeType = await prisma.productVariantType.create({
    data: {
      name: 'Size',
      isRequired: true,
      order: 2,
      productId: tshirt.id,
    },
  });

  // Create t-shirt variants
  const tshirtVariants = [
    { sku: 'TSHIRT-RED-S', price: 1999, stock: 25, isDefault: true, color: 'Red', size: 'S' },
    { sku: 'TSHIRT-RED-M', price: 1999, stock: 30, isDefault: false, color: 'Red', size: 'M' },
    { sku: 'TSHIRT-BLUE-M', price: 1999, stock: 20, isDefault: false, color: 'Blue', size: 'M' },
    { sku: 'TSHIRT-BLUE-L', price: 2199, stock: 15, isDefault: false, color: 'Blue', size: 'L' },
  ];

  for (const variant of tshirtVariants) {
    const createdVariant = await prisma.productVariant.create({
      data: {
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        isDefault: variant.isDefault,
        productId: tshirt.id,
      },
    });

    // Create variant values
    await prisma.variantValue.createMany({
      data: [
        {
          value: variant.color,
          displayName: variant.color === 'Red' ? 'Cherry Red' : 'Navy Blue',
          variantTypeId: colorType.id,
          productVariantId: createdVariant.id,
          order: variant.color === 'Red' ? 1 : 2,
        },
        {
          value: variant.size,
          variantTypeId: sizeType.id,
          productVariantId: createdVariant.id,
          order: variant.size === 'S' ? 1 : variant.size === 'M' ? 2 : 3,
        },
      ],
    });
  }

  // Create Winter Boots
  const boots = await prisma.product.upsert({
    where: { id: (await prisma.product.findFirst({ where: { name: 'Winter Boots' } }))?.id || '' },
    update: {},
    create: {
      name: 'Winter Boots',
      description: 'Stay warm and stylish.',
      price: 7999, // Price in cents
      stock: 0, // Stock is managed by variants
      categoryId: shoes.id,
      brandId: northFace.id,
    },
  });

  // Create size variant type for boots
  const bootSizeType = await prisma.productVariantType.create({
    data: {
      name: 'Size',
      isRequired: true,
      order: 1,
      description: 'US Shoe Size',
      productId: boots.id,
    },
  });

  // Create boot variants
  const bootVariants = [
    { sku: 'BOOTS-8', price: 7999, stock: 15, isDefault: true, size: '8' },
    { sku: 'BOOTS-9', price: 7999, stock: 20, isDefault: false, size: '9' },
    { sku: 'BOOTS-10', price: 8499, stock: 15, isDefault: false, size: '10' },
  ];

  for (const variant of bootVariants) {
    const createdVariant = await prisma.productVariant.create({
      data: {
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        isDefault: variant.isDefault,
        productId: boots.id,
      },
    });

    await prisma.variantValue.create({
      data: {
        value: variant.size,
        variantTypeId: bootSizeType.id,
        productVariantId: createdVariant.id,
        order: parseInt(variant.size) - 7, // 8 -> 1, 9 -> 2, 10 -> 3
      },
    });
  }

  // Create Eco Tote Bag (simple product with one variant)
  const tote = await prisma.product.upsert({
    where: { id: (await prisma.product.findFirst({ where: { name: 'Eco Tote Bag' } }))?.id || '' },
    update: {},
    create: {
      name: 'Eco Tote Bag',
      description: 'Reusable and eco-friendly.',
      price: 1299, // Price in cents
      stock: 0, // Stock is managed by variants
      categoryId: accessories.id,
      brandId: puma.id,
    },
  });

  // Create default variant for tote
  await prisma.productVariant.create({
    data: {
      sku: 'TOTE-001',
      price: 1299, // Storing price in cents to avoid floating point issues
      stock: 200,
      isDefault: true,
      productId: tote.id,
    },
  });

  // Connect tags and images to products
  if (tshirt) {
    const tshirtImage = await prisma.productImage.upsert({
      where: { id: (await prisma.productImage.findFirst({ where: { productId: tshirt.id } }))?.id || '' },
      update: {},
      create: {
        productId: tshirt.id,
        url: '/images/tshirt.jpg',
        alt: 'Summer T-Shirt',
        width: 800,
        height: 800,
        type: 'main',
        mimeType: 'image/jpeg',
        size: 120000,
      },
    });
    await prisma.product.update({
      where: { id: tshirt.id },
      data: {
        tags: { connect: [{ id: summer.id }, { id: sale.id }] },
        primaryImage: { connect: { id: tshirtImage.id } },
      },
    });
  } else {
    console.warn('T-Shirt product not found, skipping image/tag seeding for it.');
  }
  if (boots) {
    await prisma.product.update({
      where: { id: boots.id },
      data: {
        tags: { connect: [{ id: winter.id }, { id: popular.id }] },
        images: ['/images/boots.jpg']
      },
    });
  } else {
    console.warn('Boots product not found, skipping image/tag seeding for it.');
  }
  if (tote) {
    await prisma.product.update({
      where: { id: tote.id },
      data: {
        tags: { connect: [{ id: eco.id }, { id: sale.id }] },
        images: ['/images/tote.jpg']
      },
    });
  } else {
    console.warn('Tote product not found, skipping image/tag seeding for it.');
  }

  // 5. Create sample orders with the new schema
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@sheinauriva.com' } });
  const alice = await prisma.user.findUnique({ where: { email: 'alice@sheinauriva.com' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@sheinauriva.com' } });
  const carol = await prisma.user.findUnique({ where: { email: 'carol@sheinauriva.com' } });
  
  // Ensure we have the required users
  if (!adminUser || !alice || !bob || !carol) {
    console.warn('One or more users not found. Please ensure users are created first.');
    return;
  }

  // Get some product variants for the orders
  const tshirtVariant = await prisma.productVariant.findFirst({ 
    where: { sku: 'TSHIRT-RED-M' } 
  });
  const bootsVariant = await prisma.productVariant.findFirst({ 
    where: { sku: 'BOOTS-9' } 
  });
  const toteVariant = await prisma.productVariant.findFirst({ 
    where: { sku: 'TOTE-001' } 
  });

  // Sample orders with different statuses
  const orders = [
    // Pending order for admin
    {
      userId: adminUser.id,
      status: 'PENDING_CONFIRMATION',
      total: 119.97,
      customerName: 'Site Admin',
      customerEmail: 'admin@sheinauriva.com',
      customerPhone: '+212600112233',
      shippingAddress: '123 Admin St',
      shippingCity: 'Casablanca',
      shippingCost: 30.00,
      notes: 'Please deliver after 5 PM',
      items: [
        { productId: tshirt.id, variantId: tshirtVariant?.id, quantity: 2, price: 19.99 },
        { productId: tote.id, variantId: toteVariant?.id, quantity: 1, price: 12.99 }
      ]
    },
    // Confirmed order for Alice
    {
      userId: alice.id,
      status: 'CONFIRMED',
      total: 89.98,
      customerName: 'Alice Example',
      customerEmail: 'alice@sheinauriva.com',
      customerPhone: '+212611223344',
      shippingAddress: '1 Wonderland Ave',
      shippingCity: 'Rabat',
      shippingCost: 25.00,
      notes: 'Ring the bell twice',
      items: [
        { productId: boots.id, variantId: bootsVariant?.id, quantity: 1, price: 79.99 }
      ]
    },
    // Shipped order for Bob
    {
      userId: bob.id,
      status: 'SHIPPED',
      total: 154.97,
      customerName: 'Bob Builder',
      customerEmail: 'bob@sheinauriva.com',
      customerPhone: '+212622334455',
      shippingAddress: '2 Construction Rd',
      shippingCity: 'Marrakech',
      shippingCost: 35.00,
      notes: 'Leave at the front desk',
      items: [
        { productId: tshirt.id, variantId: tshirtVariant?.id, quantity: 3, price: 19.99 },
        { productId: tote.id, variantId: toteVariant?.id, quantity: 2, price: 12.99 }
      ]
    },
    // Delivered order for Carol
    {
      userId: carol.id,
      status: 'DELIVERED',
      total: 219.95,
      customerName: 'Carol Shopper',
      customerEmail: 'carol@sheinauriva.com',
      customerPhone: '+212633445566',
      shippingAddress: '3 Shopping Blvd',
      shippingCity: 'Tangier',
      shippingCost: 40.00,
      notes: 'Gift wrapping please',
      items: [
        { productId: boots.id, variantId: bootsVariant?.id, quantity: 2, price: 79.99 },
        { productId: tshirt.id, variantId: tshirtVariant?.id, quantity: 1, price: 19.99 }
      ]
    }
  ];

  // Create the orders
  for (const orderData of orders) {
    await prisma.order.create({
      data: {
        userId: orderData.userId,
        status: orderData.status,
        total: orderData.total,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingCost: orderData.shippingCost,
        notes: orderData.notes,
        orderItems: {
          create: orderData.items.map(item => ({
            product: { connect: { id: item.productId } },
            ...(item.variantId && { 
              variant: { connect: { id: item.variantId } },
              variantDetails: {
                variantId: item.variantId,
                variantName: `Variant: ${item.variantId}`
              }
            }),
            quantity: item.quantity,
            price: item.price
          }))
        },
        // Set created at to different dates for testing
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
