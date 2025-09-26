import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for address update
const updateAddressSchema = z.object({
  address1: z.string().min(1, "Address line 1 is required").trim(),
  address2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  postalCode: z.string().min(1, "Postal code is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
  isDefault: z.boolean().optional().default(false),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
    const addressId = parseInt(id);

    if (isNaN(addressId)) {
      return NextResponse.json(
        { message: "Invalid address ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateAddressSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { address1, address2, city, state, postalCode, country, isDefault } =
      validationResult.data;

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

    // If setting as default, remove default from other addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.shippingAddress.update({
      where: { id: addressId },
      data: {
        address1,
        address2,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      message: "Address updated successfully",
      address: {
        ...updatedAddress,
        createdAt: updatedAddress.createdAt.toISOString(),
        updatedAt: updatedAddress.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Update address API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
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

    // Don't allow deleting the default address if it's the only one
    if (existingAddress.isDefault) {
      const addressCount = await prisma.shippingAddress.count({
        where: { userId },
      });

      if (addressCount === 1) {
        return NextResponse.json(
          { message: "Cannot delete the only address" },
          { status: 400 },
        );
      }

      // If deleting default address, set another address as default
      const nextAddress = await prisma.shippingAddress.findFirst({
        where: { userId, id: { not: addressId } },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await prisma.shippingAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    await prisma.shippingAddress.delete({
      where: { id: addressId },
    });

    return NextResponse.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
