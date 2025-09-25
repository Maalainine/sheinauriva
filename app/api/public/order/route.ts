import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

interface OrderItem {
  productId: string | number;
  quantity: number;
  price: number;
  variantId?: string | number;
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

    // Safely check for authenticated user (optional, won't break guest orders)
    let userId: number | null = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user && session.user.role === "CLIENT" && session.user.id) {
        userId = parseInt(session.user.id);
        console.log("Order being created by authenticated user:", userId);
      }
    } catch (sessionError) {
      console.log("Session check failed (continuing as guest):", sessionError);
      // Continue as guest order - don't break the flow
    }

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

      // Create the order and update user stats in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the order
        const order = await tx.order.create({
          data: {
            userId: userId, // Will be null for guest orders, which is fine
            customerName: orderData.customer.name,
            customerEmail:
              orderData.customer.email ||
              `guest_${Date.now()}@justoriginale.com`,
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
                productName:
                  productMap.get(item.productId) || "Unknown Product",
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            orderItems: true,
          },
        });

        // If this is an authenticated user, update their stats
        if (userId) {
          await tx.user.update({
            where: { id: userId },
            data: {
              totalSpent: {
                increment: orderData.total,
              },
              ordersCount: {
                increment: 1,
              },
            },
          });
          console.log(
            `Updated user ${userId} stats: +${orderData.total} spent, +1 order`,
          );
        }

        return order;
      });

      return NextResponse.json({
        success: true,
        orderId: result.id,
        orderNumber: `ORD-${String(result.id).padStart(6, "0")}`,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      console.error(
        "Order data that failed:",
        JSON.stringify(orderData, null, 2),
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create order",
          details: error instanceof Error ? error.message : "Unknown error",
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              orderData: orderData,
              stack: error instanceof Error ? error.stack : undefined,
            },
          }),
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
