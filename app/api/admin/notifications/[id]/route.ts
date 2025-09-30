import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/notifications";

// Admin authorization check
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, error: "Authentication required" };
  }

  if (session.user.role !== "ADMIN") {
    return { authorized: false, error: "Admin access required" };
  }

  return { authorized: true, user: session.user };
}

// PUT - Mark notification as read
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const notificationId = parseInt(id, 10);
    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const success = await markNotificationAsRead(notificationId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const notificationId = parseInt(id, 10);
    if (!notificationId || isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const success = await deleteNotification(notificationId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Notification deleted",
      });
    } else {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
