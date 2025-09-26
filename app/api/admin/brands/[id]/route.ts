import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    // Fetch the brand with product count
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    const data = await request.json();

    // Validation
    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 },
      );
    }

    const name = data.name.trim();

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check for duplicate name (excluding current brand)
    const duplicateBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        NOT: {
          id: brandId,
        },
      },
    });

    if (duplicateBrand) {
      return NextResponse.json(
        { error: "A brand with this name already exists" },
        { status: 400 },
      );
    }

    // Validate URLs if provided
    if (data.logoUrl && !isValidUrl(data.logoUrl)) {
      return NextResponse.json(
        { error: "Logo URL must be a valid URL" },
        { status: 400 },
      );
    }

    if (data.website && !isValidUrl(data.website)) {
      return NextResponse.json(
        { error: "Website must be a valid URL" },
        { status: 400 },
      );
    }

    // Update the brand
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name,
        logoUrl: data.logoUrl?.trim() || null,
        website: data.website?.trim() || null,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A brand with this name already exists" },
          { status: 400 },
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify admin access
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const brandId = parseInt(id, 10);
    if (isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    // Check if brand has associated products
    const brandWithProducts = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brandWithProducts) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (brandWithProducts._count.products > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete brand with associated products",
          productCount: brandWithProducts._count.products,
        },
        { status: 400 },
      );
    }

    // Delete the brand
    await prisma.brand.delete({
      where: { id: brandId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting brand:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
