import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAdminNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications,
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

// GET - Get all notifications
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await getAdminNotifications(unreadOnly);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT - Mark all notifications as read
export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === "markAllRead") {
      await markAllNotificationsAsRead();
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all notifications
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 });
    }

    await clearAllNotifications();

    return NextResponse.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return NextResponse.json(
      { error: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
