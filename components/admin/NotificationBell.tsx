"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconBell,
  IconBellRinging,
  IconCheck,
  IconTrash,
  IconPackage,
  IconAlertTriangle,
  IconShoppingCart,
  IconSettings,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { AdminNotification } from "@/lib/notifications";

const NotificationIcon = ({ type }: { type: AdminNotification["type"] }) => {
  switch (type) {
    case "NEW_ORDER":
      return <IconShoppingCart className="h-4 w-4 text-blue-500" />;
    case "LOW_STOCK":
      return <IconAlertTriangle className="h-4 w-4 text-orange-500" />;
    case "ORDER_STATUS_CHANGE":
      return <IconPackage className="h-4 w-4 text-green-500" />;
    case "NEW_USER_REGISTRATION":
      return <IconUser className="h-4 w-4 text-indigo-500" />;
    case "SYSTEM_ALERT":
      return <IconSettings className="h-4 w-4 text-purple-500" />;
    default:
      return <IconBell className="h-4 w-4 text-gray-500" />;
  }
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Initialize and load notifications
  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle marking notification as read
  const handleMarkAsRead = async (id: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "PUT",
      });

      if (response.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle deleting notification
  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });

      if (response.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "DELETE",
      });

      if (response.ok) {
        loadNotifications();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  // Get notification link
  const getNotificationLink = (notification: AdminNotification): string => {
    switch (notification.type) {
      case "NEW_ORDER":
        return notification.data?.orderId
          ? `/admin/orders/${notification.data.orderId}`
          : "/admin/orders";
      case "LOW_STOCK":
        return notification.data?.productId
          ? `/admin/products/${notification.data.productId}`
          : "/admin/products";
      case "ORDER_STATUS_CHANGE":
        return notification.data?.orderId
          ? `/admin/orders/${notification.data.orderId}`
          : "/admin/orders";
      case "NEW_USER_REGISTRATION":
        return notification.data?.userId
          ? `/admin/customers/${notification.data.userId}`
          : "/admin/customers";
      case "SYSTEM_ALERT":
        return "/admin/settings";
      default:
        return "/admin";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <IconBellRinging className="h-5 w-5" />
          ) : (
            <IconBell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-7 px-2 text-xs"
              >
                <IconCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                <IconTrash className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <IconBell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? "border-primary/20 bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="block"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <NotificationIcon type={notification.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5
                              className={`text-sm font-medium truncate ${
                                !notification.read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h5>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) =>
                                    handleMarkAsRead(notification.id, e)
                                  }
                                  className="h-6 w-6 p-0 hover:bg-primary/10"
                                >
                                  <IconCheck className="h-3 w-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) =>
                                  handleDelete(notification.id, e)
                                }
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <IconX className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/settings">
                  <IconSettings className="h-4 w-4 mr-2" />
                  Notification Settings
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
