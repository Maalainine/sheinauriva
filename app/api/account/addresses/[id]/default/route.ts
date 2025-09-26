import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(session.user.id);
    const addressId = parseInt(id);

    if (isNaN(addressId)) {
      return NextResponse.json(
        { message: "Invalid address ID" },
        { status: 400 },
      );
    }

    // Check if address belongs to the user
    const existingAddress = await prisma.shippingAddress.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 },
      );
    }

    if (existingAddress.isDefault) {
      return NextResponse.json(
        { message: "Address is already the default" },
        { status: 400 },
      );
    }

    // Use a transaction to ensure consistency
    await prisma.$transaction([
      // Remove default from all other addresses
      prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      // Set this address as default
      prisma.shippingAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return NextResponse.json({
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error("Set default address API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
