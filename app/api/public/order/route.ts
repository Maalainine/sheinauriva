import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  variantId?: string;
}

interface OrderData {
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
}

export async function POST(request: Request) {
  try {
    const orderData: OrderData = await request.json();

    // Validate required fields
    if (
      !orderData.customer ||
      !orderData.items ||
      orderData.items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid order data" },
        { status: 400 },
      );
    }

    // Process order items to ensure correct types
    const processedItems = orderData.items.map((item) => {
      // Convert productId to number if it's a string
      const productId =
        typeof item.productId === "string"
          ? parseInt(item.productId, 10)
          : item.productId;

      if (isNaN(productId)) {
        throw new Error(`Invalid productId: ${item.productId}`);
      }

      // Convert variantId to number if it exists and is a string
      let variantId: number | undefined;
      if (item.variantId !== undefined) {
        variantId =
          typeof item.variantId === "string"
            ? parseInt(item.variantId, 10)
            : item.variantId;

        if (isNaN(variantId)) {
          throw new Error(`Invalid variantId: ${item.variantId}`);
        }
      }

      return {
        productId,
        variantId,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()), // Ensure price is a float
      };
    });

    // Create the order in the database
    try {
      // First, fetch product names for all items in the cart
      const productIds = [
        ...new Set(processedItems.map((item) => item.productId)),
      ];

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      });

      // Create a map of productId to product name
      const productMap = new Map(products.map((p) => [p.id, p.name]));

      // Create the order
      const order = await prisma.order.create({
        data: {
          customerName: orderData.customer.name,
          customerEmail:
            orderData.customer.email || `guest_${Date.now()}@justoriginale.com`,
          customerPhone: orderData.customer.phone || null,
          shippingLine1: orderData.customer.address,
          shippingCity: orderData.customer.city,
          shippingCountry: orderData.customer.country,
          shippingPostal: orderData.customer.zipCode,
          notes: orderData.customer.notes || null,
          shippingCost: orderData.shipping,
          total: orderData.total,
          status: "PENDING",
          orderItems: {
            create: processedItems.map((item) => ({
              productId: item.productId,
              productVariantId: item.variantId || null,
              productName: productMap.get(item.productId) || "Unknown Product",
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: `ORD-${String(order.id).padStart(6, "0")}`,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create order",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request format" },
      { status: 400 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
