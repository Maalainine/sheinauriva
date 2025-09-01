import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: {
        wishlist: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            variants: {
              select: {
                id: true,
                price: true,
                stock: true,
              },
            },
            images: {
              take: 1,
              orderBy: { createdAt: "asc" },
              select: {
                url: true,
                alt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlistItems = user.wishlist.map(product => ({
      id: product.id.toString(),
      name: product.name,
      price: product.basePrice,
      description: product.description,
      image: product.images[0]?.url || null,
      brand: product.brand,
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0) || product.stock || 0,
      hasVariants: product.variants.length > 0,
      variantCount: product.variants.length,
    }));

    return NextResponse.json({ wishlist: wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add to wishlist
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        wishlist: {
          connect: { id: parseInt(productId) },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Remove from wishlist
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        wishlist: {
          disconnect: { id: parseInt(productId) },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}