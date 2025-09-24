import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get user's wishlist with product details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        wishlist: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            images: true,
            status: true,
            onSale: true,
            category: {
              select: {
                name: true,
              },
            },
            brand: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const wishlistProducts = user?.wishlist || [];

    return NextResponse.json(wishlistProducts);
  } catch (error) {
    console.error("Wishlist API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { productId } = await request.json();

    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const productIdInt = parseInt(productId);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productIdInt },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    // Add product to user's wishlist
    await prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: {
          connect: { id: productIdInt },
        },
      },
    });

    return NextResponse.json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist API error:", error);

    // Handle unique constraint violation (product already in wishlist)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { message: "Product already in wishlist" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 },
      );
    }

    const productIdInt = parseInt(productId);

    // Remove product from user's wishlist
    await prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: {
          disconnect: { id: productIdInt },
        },
      },
    });

    return NextResponse.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
