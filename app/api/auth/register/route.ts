import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").trim(),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT", // Default to CLIENT role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });

    // Handle Prisma errors
    if (error instanceof Error) {
      // Handle unique constraint violation
      if (
        error.message.includes("Unique constraint") ||
        error.message.includes("unique constraint")
      ) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 },
        );
      }

      // Handle other Prisma specific errors
      if (
        error.message.includes("prisma") ||
        error.message.includes("database")
      ) {
        console.error("Database connection error:", error.message);
        return NextResponse.json(
          { message: "Database connection error. Please try again later." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
