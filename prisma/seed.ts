import { PrismaClient, UserRole, OrderStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@justoriginale.com" },
    update: {},
    create: {
      email: "admin@justoriginale.com",
      name: "Site Admin",
      password: adminPassword,
      role: UserRole.ADMIN,
      totalSpent: 0,
      ordersCount: 0,
    },
  });

  // 2. Create client users
  const clientUsers = [
    {
      email: "alice@example.com",
      name: "Alice Smith",
      password: await hash("password", 10),
    },
    {
      email: "bob@example.com",
      name: "Bob Johnson",
      password: await hash("password", 10),
    },
    {
      email: "carol@example.com",
      name: "Carol Williams",
      password: await hash("password", 10),
    },
  ];

  for (const userData of clientUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: UserRole.CLIENT,
        totalSpent: 0,
        ordersCount: 0,
      },
    });
  }

  // 3. Create brands
  const brands = [
    {
      name: "Nike",
      description: "Just Do It",
      website: "https://www.nike.com",
    },
    {
      name: "Adidas",
      description: "Impossible is Nothing",
      website: "https://www.adidas.com",
    },
    {
      name: "Puma",
      description: "Forever Faster",
      website: "https://www.puma.com",
    },
  ];

  for (const brandData of brands) {
    await prisma.brand.upsert({
      where: { name: brandData.name },
      update: {},
      create: brandData,
    });
  }

  // 4. Create categories
  const categories = [
    { name: "Clothing", description: "Fashion and apparel" },
    { name: "Shoes", description: "Footwear for all occasions" },
    { name: "Accessories", description: "Complete your look" },
    { name: "Sports", description: "Athletic gear and equipment" },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
  }

  // 5. Create tags
  const tags = ["Summer", "Winter", "Sale", "New", "Popular", "Eco-Friendly"];
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }

  // 6. Create variant types and options
  const sizeType = await prisma.variantType.upsert({
    where: { name: "Size" },
    update: {},
    create: { name: "Size" },
  });

  const colorType = await prisma.variantType.upsert({
    where: { name: "Color" },
    update: {},
    create: { name: "Color" },
  });

  // Create size options
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  for (const size of sizes) {
    await prisma.variantOption.upsert({
      where: {
        variantTypeId_value: { variantTypeId: sizeType.id, value: size },
      },
      update: {},
      create: { variantTypeId: sizeType.id, value: size },
    });
  }

  // Create color options
  const colors = ["Red", "Blue", "Green", "Black", "White", "Gray"];
  for (const color of colors) {
    await prisma.variantOption.upsert({
      where: {
        variantTypeId_value: { variantTypeId: colorType.id, value: color },
      },
      update: {},
      create: { variantTypeId: colorType.id, value: color },
    });
  }

  // 7. Create products
  const nike = await prisma.brand.findUnique({ where: { name: "Nike" } });
  const clothing = await prisma.category.findUnique({
    where: { name: "Clothing" },
  });
  const shoes = await prisma.category.findUnique({ where: { name: "Shoes" } });
  const accessories = await prisma.category.findUnique({
    where: { name: "Accessories" },
  });

  if (!nike || !clothing || !shoes || !accessories) {
    throw new Error("Required brands or categories not found");
  }

  const products = [
    {
      name: "Classic T-Shirt",
      description: "Comfortable cotton t-shirt perfect for everyday wear",
      categoryId: clothing.id,
      brandId: nike.id,
      basePrice: 29.99,
      featured: true,
      images: "/images/tshirt-1.jpg,/images/tshirt-2.jpg",
    },
    {
      name: "Running Shoes",
      description: "Lightweight running shoes with excellent cushioning",
      categoryId: shoes.id,
      brandId: nike.id,
      basePrice: 129.99,
      featured: true,
      images: "/images/shoes-1.jpg,/images/shoes-2.jpg",
    },
    {
      name: "Sports Cap",
      description: "Adjustable sports cap with UV protection",
      categoryId: accessories.id,
      brandId: nike.id,
      basePrice: 24.99,
      onSale: true,
      images: "/images/cap-1.jpg",
    },
  ];

  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: productData,
      });
    }
  }

  // 8. Create product variants
  const tshirt = await prisma.product.findFirst({
    where: { name: "Classic T-Shirt" },
  });
  const runningShoes = await prisma.product.findFirst({
    where: { name: "Running Shoes" },
  });

  if (tshirt) {
    // Get some variant options
    const sizeM = await prisma.variantOption.findFirst({
      where: { variantTypeId: sizeType.id, value: "M" },
    });
    const sizeL = await prisma.variantOption.findFirst({
      where: { variantTypeId: sizeType.id, value: "L" },
    });
    const colorRed = await prisma.variantOption.findFirst({
      where: { variantTypeId: colorType.id, value: "Red" },
    });
    const colorBlue = await prisma.variantOption.findFirst({
      where: { variantTypeId: colorType.id, value: "Blue" },
    });

    if (sizeM && sizeL && colorRed && colorBlue) {
      // Create product options
      const productOptions = [
        { productId: tshirt.id, optionId: sizeM.id },
        { productId: tshirt.id, optionId: sizeL.id },
        { productId: tshirt.id, optionId: colorRed.id },
        { productId: tshirt.id, optionId: colorBlue.id },
      ];

      for (const option of productOptions) {
        await prisma.productOption.upsert({
          where: {
            productId_optionId: {
              productId: option.productId,
              optionId: option.optionId,
            },
          },
          update: {},
          create: option,
        });
      }

      // Create product variants
      const variants = [
        {
          sku: "TSHIRT-RED-M",
          price: 29.99,
          stock: 50,
          selections: [colorRed.id, sizeM.id],
        },
        {
          sku: "TSHIRT-RED-L",
          price: 29.99,
          stock: 40,
          selections: [colorRed.id, sizeL.id],
        },
        {
          sku: "TSHIRT-BLUE-M",
          price: 29.99,
          stock: 45,
          selections: [colorBlue.id, sizeM.id],
        },
        {
          sku: "TSHIRT-BLUE-L",
          price: 29.99,
          stock: 35,
          selections: [colorBlue.id, sizeL.id],
        },
      ];

      for (const variantData of variants) {
        const variant = await prisma.productVariant.upsert({
          where: { sku: variantData.sku },
          update: {},
          create: {
            productId: tshirt.id,
            sku: variantData.sku,
            price: variantData.price,
            stock: variantData.stock,
          },
        });

        // Create variant selections
        for (const optionId of variantData.selections) {
          await prisma.variantSelection.upsert({
            where: { variantId_optionId: { variantId: variant.id, optionId } },
            update: {},
            create: { variantId: variant.id, optionId },
          });
        }
      }
    }
  }

  // 9. Create test orders for client users
  const clientUser = await prisma.user.findFirst({
    where: { email: "client@example.com" },
  });

  if (clientUser && tshirt && runningShoes) {
    // Create a few test orders
    const testOrders = [
      {
        userId: clientUser.id,
        status: "DELIVERED" as const,
        total: 159.98,
        shippingCost: 10.0,
        customerName: clientUser.name || "John Doe",
        customerEmail: clientUser.email,
        customerPhone: "+1234567890",
        shippingLine1: "123 Main Street",
        shippingLine2: "Apt 4B",
        shippingCity: "New York",
        shippingState: "NY",
        shippingPostal: "10001",
        shippingCountry: "USA",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        userId: clientUser.id,
        status: "SHIPPED" as const,
        total: 29.99,
        shippingCost: 5.0,
        customerName: clientUser.name || "John Doe",
        customerEmail: clientUser.email,
        customerPhone: "+1234567890",
        shippingLine1: "123 Main Street",
        shippingLine2: "Apt 4B",
        shippingCity: "New York",
        shippingState: "NY",
        shippingPostal: "10001",
        shippingCountry: "USA",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        userId: clientUser.id,
        status: "PROCESSING" as const,
        total: 129.99,
        shippingCost: 10.0,
        customerName: clientUser.name || "John Doe",
        customerEmail: clientUser.email,
        customerPhone: "+1234567890",
        shippingLine1: "123 Main Street",
        shippingLine2: "Apt 4B",
        shippingCity: "New York",
        shippingState: "NY",
        shippingPostal: "10001",
        shippingCountry: "USA",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: orderData,
      });

      // Add order items
      if (order.total > 100) {
        // Multi-item order
        await prisma.orderItem.createMany({
          data: [
            {
              orderId: order.id,
              productId: tshirt.id,
              quantity: 2,
              price: 29.99,
              productName: tshirt.name,
              productDetails: "Size: M, Color: Red",
            },
            {
              orderId: order.id,
              productId: runningShoes.id,
              quantity: 1,
              price: 129.99,
              productName: runningShoes.name,
              productDetails: "Size: 10",
            },
          ],
        });
      } else {
        // Single item order
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: tshirt.id,
            quantity: 1,
            price: 29.99,
            productName: tshirt.name,
            productDetails: "Size: L, Color: Blue",
          },
        });
      }
    }

    console.log(
      `📦 Created ${testOrders.length} test orders for client account`,
    );
  }

  // 10. Create guest orders (no userId)
  if (tshirt && runningShoes) {
    const guestOrders = [
      {
        userId: null, // Guest order
        status: "PENDING" as const,
        total: 79.98,
        shippingCost: 8.0,
        customerName: "Jane Smith",
        customerEmail: "jane.smith@example.com",
        customerPhone: "+1987654321",
        shippingLine1: "456 Oak Avenue",
        shippingCity: "Los Angeles",
        shippingState: "CA",
        shippingPostal: "90210",
        shippingCountry: "USA",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: null, // Guest order
        status: "CONFIRMED" as const,
        total: 129.99,
        shippingCost: 10.0,
        customerName: "Mike Johnson",
        customerEmail: "mike.j@gmail.com",
        customerPhone: "+1555000123",
        shippingLine1: "789 Pine Street",
        shippingLine2: "Unit 12",
        shippingCity: "Chicago",
        shippingState: "IL",
        shippingPostal: "60601",
        shippingCountry: "USA",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        userId: null, // Guest order
        status: "DELIVERED" as const,
        total: 59.98,
        shippingCost: 6.0,
        customerName: "Sarah Williams",
        customerEmail: "sarah.w@outlook.com",
        customerPhone: "+1444555666",
        shippingLine1: "321 Elm Drive",
        shippingCity: "Miami",
        shippingState: "FL",
        shippingPostal: "33101",
        shippingCountry: "USA",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
    ];

    for (const orderData of guestOrders) {
      const order = await prisma.order.create({
        data: orderData,
      });

      // Add order items for guest orders
      if (order.total > 100) {
        // Running shoes order
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: runningShoes.id,
            quantity: 1,
            price: 129.99,
            productName: runningShoes.name,
            productDetails: "Size: 9, Color: Black",
          },
        });
      } else {
        // T-shirt orders
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: tshirt.id,
            quantity: order.total > 50 ? 2 : 1,
            price: 29.99,
            productName: tshirt.name,
            productDetails: `Size: ${order.total > 50 ? "M & L" : "M"}, Color: Blue`,
          },
        });
      }
    }

    console.log(`🛍️  Created ${guestOrders.length} guest orders`);
  }

  // 11. Create more registered user orders for variety
  const otherClients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      email: { not: "client@example.com" },
    },
  });

  if (otherClients.length > 0 && tshirt) {
    for (const client of otherClients.slice(0, 2)) {
      const order = await prisma.order.create({
        data: {
          userId: client.id,
          status: Math.random() > 0.5 ? "PROCESSING" : "SHIPPED",
          total: 34.99,
          shippingCost: 5.0,
          customerName: client.name || "Client User",
          customerEmail: client.email,
          customerPhone: "+1999888777",
          shippingLine1: "123 Client Street",
          shippingCity: "Portland",
          shippingState: "OR",
          shippingPostal: "97201",
          shippingCountry: "USA",
          createdAt: new Date(
            Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000,
          ),
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: tshirt.id,
          quantity: 1,
          price: 29.99,
          productName: tshirt.name,
          productDetails: "Size: S, Color: Red",
        },
      });
    }

    console.log(
      `👥 Created orders for ${otherClients.slice(0, 2).length} other registered clients`,
    );
  }

  // 12. Create settings (optional)
  try {
    await prisma.settings.upsert({
      where: { id: "main" },
      update: {},
      create: {
        id: "main",
        siteTitle: "JustOriginale",
        contactEmail: "contact@justoriginale.com",
        themeUrl: "/themes/default.css",
      },
    });
  } catch (error) {
    console.log("⚠️  Settings table might not exist, skipping...");
  }

  console.log("✅ Database seed completed successfully!");
  console.log(
    `👤 Admin user created: admin@justoriginale.com (password: admin123)`,
  );
  console.log(`👥 ${clientUsers.length} client users created`);
  console.log(`🏷️  ${brands.length} brands created`);
  console.log(`📦 ${categories.length} categories created`);
  console.log(`🔖 ${tags.length} tags created`);
  console.log(`👕 ${products.length} products created with variants`);
  console.log(`📦 Test orders created for client accounts`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
