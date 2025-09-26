import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validate admin access (match route.ts logic)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Optionally check for admin role string match (case-insensitive)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    });
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }
    // Robust transaction logic (copied from route.ts)
    const result = await prisma.$transaction(async (tx) => {
      // Check if product exists
      const existingProduct = await tx.product.findUnique({
        where: { id: Number(id) },
        include: { orderItems: true },
      });
      if (!existingProduct) {
        throw new Error("Product not found");
      }
      // Check if product has been ordered
      if (existingProduct.orderItems.length > 0) {
        throw new Error(
          "Cannot delete product that has been ordered. Consider deactivating it instead.",
        );
      }
      // Delete related records first (due to foreign key constraints)
      await tx.variantSelection.deleteMany({
        where: { variant: { productId: Number(id) } },
      });
      await tx.productVariant.deleteMany({ where: { productId: Number(id) } });
      await tx.productOption.deleteMany({ where: { productId: Number(id) } });
      // Disconnect tags (many-to-many relationship)
      await tx.product.update({
        where: { id: Number(id) },
        data: {
          tags: { set: [] },
          wishlistedBy: { set: [] },
        },
      });
      // Finally delete the product
      const deletedProduct = await tx.product.delete({
        where: { id: Number(id) },
      });
      return deletedProduct;
    });
    return NextResponse.json({
      message: "Product deleted successfully",
      deletedProduct: result,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
