import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AdminNotification {
  id: string;
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'ORDER_STATUS_CHANGE' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  adminNewOrder: boolean;
  adminLowStock: boolean;
  adminOrderStatusChange: boolean;
  emailNotifications: boolean;
}

// Get notification preferences from localStorage or defaults
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    // Server-side defaults
    return {
      adminNewOrder: true,
      adminLowStock: true,
      adminOrderStatusChange: false,
      emailNotifications: true,
    };
  }

  try {
    const saved = localStorage.getItem('adminNotifications');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to parse notification preferences:', error);
  }

  // Client-side defaults
  return {
    adminNewOrder: true,
    adminLowStock: true,
    adminOrderStatusChange: false,
    emailNotifications: true,
  };
}

// In-memory notification store (in production, use Redis or database)
let notifications: AdminNotification[] = [];

// Generate unique ID
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new admin notification
export async function createAdminNotification(
  type: AdminNotification['type'],
  title: string,
  message: string,
  data?: any,
  expiresInHours?: number
): Promise<AdminNotification> {
  const notification: AdminNotification = {
    id: generateId(),
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
    expiresAt: expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : undefined,
  };

  // Add to in-memory store
  notifications.unshift(notification);

  // Keep only last 100 notifications
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100);
  }

  console.log(`Admin notification created: ${type} - ${title}`);

  return notification;
}

// Get all admin notifications
export function getAdminNotifications(unreadOnly: boolean = false): AdminNotification[] {
  const now = new Date();

  // Filter out expired notifications
  const activeNotifications = notifications.filter(
    n => !n.expiresAt || n.expiresAt > now
  );

  if (unreadOnly) {
    return activeNotifications.filter(n => !n.read);
  }

  return activeNotifications;
}

// Mark notification as read
export function markNotificationAsRead(id: string): boolean {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
}

// Mark all notifications as read
export function markAllNotificationsAsRead(): void {
  notifications.forEach(n => n.read = true);
}

// Delete a notification
export function deleteNotification(id: string): boolean {
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.splice(index, 1);
    return true;
  }
  return false;
}

// Clear all notifications
export function clearAllNotifications(): void {
  notifications = [];
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
    console.log('New order notifications disabled, skipping...');
    return;
  }

  const orderNumber = `#${orderData.id.toString().padStart(6, '0')}`;
  const customerType = orderData.isGuestOrder ? 'Guest' : 'Registered';

  await createAdminNotification(
    'NEW_ORDER',
    'New Order Received',
    `${customerType} customer ${orderData.customerName} placed order ${orderNumber} for ${formatCurrency(orderData.total)} (${orderData.itemCount} items)`,
    {
      orderId: orderData.id,
      customerName: orderData.customerName,
      total: orderData.total,
      itemCount: orderData.itemCount,
      isGuestOrder: orderData.isGuestOrder,
    },
    24 // Expire after 24 hours
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
    'LOW_STOCK',
    'Low Stock Alert',
    `Product "${productData.name}" is running low on stock (${productData.currentStock} remaining)`,
    {
      productId: productData.id,
      productName: productData.name,
      currentStock: productData.currentStock,
      threshold: productData.threshold,
    },
    72 // Expire after 72 hours
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

  const orderNumber = `#${orderData.id.toString().padStart(6, '0')}`;

  await createAdminNotification(
    'ORDER_STATUS_CHANGE',
    'Order Status Updated',
    `Order ${orderNumber} for ${orderData.customerName} changed from ${orderData.oldStatus} to ${orderData.newStatus}`,
    {
      orderId: orderData.id,
      customerName: orderData.customerName,
      oldStatus: orderData.oldStatus,
      newStatus: orderData.newStatus,
    },
    48 // Expire after 48 hours
  );
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Initialize with some demo notifications for testing
export function initializeDemoNotifications(): void {
  if (notifications.length === 0) {
    createAdminNotification(
      'SYSTEM_ALERT',
      'Admin Panel Ready',
      'The admin notification system is now active and ready to receive alerts.',
      {},
      24
    );
  }
}

// Email notification helper (placeholder for future implementation)
export async function sendEmailNotification(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  // TODO: Implement email sending with your preferred service (SendGrid, AWS SES, etc.)
  console.log(`Email notification would be sent to ${to}: ${subject}`);
  return true;
}
