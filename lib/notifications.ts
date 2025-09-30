import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

export interface AdminNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date | null;
}

export interface NotificationPreferences {
  adminNewOrder: boolean;
  adminLowStock: boolean;
  adminOrderStatusChange: boolean;
  emailNotifications: boolean;
}

// Get notification preferences from localStorage or defaults
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    // Server-side defaults
    return {
      adminNewOrder: true,
      adminLowStock: true,
      adminOrderStatusChange: false,
      emailNotifications: true,
    };
  }

  try {
    const saved = localStorage.getItem("adminNotifications");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to parse notification preferences:", error);
  }

  // Client-side defaults
  return {
    adminNewOrder: true,
    adminLowStock: true,
    adminOrderStatusChange: false,
    emailNotifications: true,
  };
}

// Create a new admin notification
export async function createAdminNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: any,
  expiresInHours?: number,
): Promise<AdminNotification> {
  const expiresAt = expiresInHours
    ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    : null;

  const notification = await prisma.adminNotification.create({
    data: {
      type,
      title,
      message,
      data: data || null,
      expiresAt,
    },
  });

  console.log(`Admin notification created: ${type} - ${title}`);

  return notification;
}

// Get all admin notifications
export async function getAdminNotifications(
  unreadOnly: boolean = false,
): Promise<AdminNotification[]> {
  const now = new Date();

  const whereClause: any = {
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (unreadOnly) {
    whereClause.read = false;
  }

  const notifications = await prisma.adminNotification.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to 100 most recent
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data,
    read: n.read,
    createdAt: n.createdAt,
    expiresAt: n.expiresAt,
  }));
}

// Mark notification as read
export async function markNotificationAsRead(id: number): Promise<boolean> {
  try {
    await prisma.adminNotification.update({
      where: { id },
      data: { read: true },
    });
    return true;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  await prisma.adminNotification.updateMany({
    data: { read: true },
  });
}

// Delete a notification
export async function deleteNotification(id: number): Promise<boolean> {
  try {
    await prisma.adminNotification.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return false;
  }
}

// Clear all notifications
export async function clearAllNotifications(): Promise<void> {
  await prisma.adminNotification.deleteMany({});
}

// Specific notification creators
export async function notifyNewOrder(orderData: {
  id: string | number;
  customerName: string;
  total: number;
  itemCount: number;
  isGuestOrder: boolean;
}): Promise<void> {
  const preferences = getNotificationPreferences();

  if (!preferences.adminNewOrder) {
    console.log("New order notifications disabled, skipping...");
    return;
  }

  const orderNumber = `#${orderData.id.toString().padStart(6, "0")}`;
  const customerType = orderData.isGuestOrder ? "Guest" : "Registered";

  await createAdminNotification(
    NotificationType.NEW_ORDER,
    "New Order Received",
    `${customerType} customer ${orderData.customerName} placed order ${orderNumber} for ${formatCurrency(orderData.total)} (${orderData.itemCount} items)`,
    {
      orderId: orderData.id,
      customerName: orderData.customerName,
      total: orderData.total,
      itemCount: orderData.itemCount,
      isGuestOrder: orderData.isGuestOrder,
    },
    24, // Expire after 24 hours
  );
}

export async function notifyLowStock(productData: {
  id: string | number;
  name: string;
  currentStock: number;
  threshold: number;
}): Promise<void> {
  const preferences = getNotificationPreferences();

  if (!preferences.adminLowStock) {
    return;
  }

  await createAdminNotification(
    NotificationType.LOW_STOCK,
    "Low Stock Alert",
    `Product "${productData.name}" is running low on stock (${productData.currentStock} remaining)`,
    {
      productId: productData.id,
      productName: productData.name,
      currentStock: productData.currentStock,
      threshold: productData.threshold,
    },
    72, // Expire after 72 hours
  );
}

export async function notifyOrderStatusChange(orderData: {
  id: string | number;
  customerName: string;
  oldStatus: string;
  newStatus: string;
}): Promise<void> {
  const preferences = getNotificationPreferences();

  if (!preferences.adminOrderStatusChange) {
    return;
  }

  const orderNumber = `#${orderData.id.toString().padStart(6, "0")}`;

  await createAdminNotification(
    NotificationType.ORDER_STATUS_CHANGE,
    "Order Status Updated",
    `Order ${orderNumber} for ${orderData.customerName} changed from ${orderData.oldStatus} to ${orderData.newStatus}`,
    {
      orderId: orderData.id,
      customerName: orderData.customerName,
      oldStatus: orderData.oldStatus,
      newStatus: orderData.newStatus,
    },
    48, // Expire after 48 hours
  );
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Create a notification for new user registration
export async function notifyNewUserRegistration(userData: {
  id: string | number;
  name: string;
  email: string;
}): Promise<void> {
  await createAdminNotification(
    NotificationType.NEW_USER_REGISTRATION,
    "New User Registration",
    `New user ${userData.name} (${userData.email}) has registered`,
    {
      userId: userData.id,
      userName: userData.name,
      userEmail: userData.email,
    },
    48, // Expire after 48 hours
  );
}

// Email notification helper (placeholder for future implementation)
export async function sendEmailNotification(
  to: string,
  subject: string,
  htmlContent: string,
): Promise<boolean> {
  // TODO: Implement email sending with your preferred service (SendGrid, AWS SES, etc.)
  console.log(`Email notification would be sent to ${to}: ${subject}`);
  return true;
}
