import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

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
    const optionId = parseInt(id, 10);
    if (isNaN(optionId)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
    }

    // Fetch the option with its variant type
    const option = await prisma.variantOption.findUnique({
      where: { id: optionId },
      select: {
        id: true,
        value: true,
        variantType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    return NextResponse.json(option);
  } catch (error) {
    console.error("Error fetching variant option:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant option" },
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
    const optionId = parseInt(id, 10);
    if (isNaN(optionId)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
    }

    const data = await request.json();

    // Validation
    if (
      !data.value ||
      typeof data.value !== "string" ||
      data.value.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Option value is required" },
        { status: 400 },
      );
    }

    const value = data.value.trim();

    // Get the current option to check for duplicates
    const currentOption = await prisma.variantOption.findUnique({
      where: { id: optionId },
      include: {
        variantType: true,
      },
    });

    if (!currentOption) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    // Check for duplicate option value (case-insensitive, same variant type)
    if (value.toLowerCase() !== currentOption.value.toLowerCase()) {
      const existingOption = await prisma.variantOption.findFirst({
        where: {
          variantTypeId: currentOption.variantTypeId,
          value: {
            equals: value,
            mode: "insensitive",
          },
          NOT: {
            id: optionId,
          },
        },
      });

      if (existingOption) {
        return NextResponse.json(
          {
            error:
              "An option with this value already exists for this variant type",
          },
          { status: 400 },
        );
      }
    }

    // Update the option
    const updatedOption = await prisma.variantOption.update({
      where: { id: optionId },
      data: {
        value,
      },
      select: {
        id: true,
        value: true,
        variantType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOption);
  } catch (error) {
    console.error("Error updating variant option:", error);

    if (error instanceof Error && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error:
              "An option with this value already exists for this variant type",
          },
          { status: 400 },
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Option not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update variant option" },
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
    const optionId = parseInt(id, 10);
    if (isNaN(optionId)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
    }

    // Check if option is used in any products
    const optionWithProducts = await prisma.variantOption.findUnique({
      where: { id: optionId },
      include: {
        productOptions: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!optionWithProducts) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    if (optionWithProducts.productOptions.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete option that is being used in products",
          isUsedInProducts: true,
        },
        { status: 400 },
      );
    }

    // Delete the option
    await prisma.variantOption.delete({
      where: { id: optionId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting variant option:", error);

    if (error instanceof Error && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Option not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete variant option" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
