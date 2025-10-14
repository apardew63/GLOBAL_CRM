"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export function NotificationBell() {
  const { user, getToken } = useAuth()
  const [stats, setStats] = useState({})
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [taskCount, setTaskCount] = useState(0)
  const [hasNewTask, setHasNewTask] = useState(false)

  // Fetch notification stats
  const fetchStats = async () => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Fetch task count to detect new tasks
  const fetchTaskCount = async () => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/tasks?limit=1`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const newCount = data.data.pagination.totalItems
        if (newCount > taskCount && taskCount > 0) {
          setHasNewTask(true)
        }
        setTaskCount(newCount)
      }
    } catch (error) {
      console.error('Failed to fetch task count:', error)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true, status: 'read' } : n
          )
        )
        setStats(prev => ({ ...prev, totalUnread: Math.max(0, prev.totalUnread - 1) }))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, status: 'read' }))
        )
        setStats(prev => ({ ...prev, totalUnread: 0 }))
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        // Update stats if deleted notification was unread
        const deletedNotification = notifications.find(n => n.id === notificationId)
        if (deletedNotification && !deletedNotification.isRead) {
          setStats(prev => ({ ...prev, totalUnread: Math.max(0, prev.totalUnread - 1) }))
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchNotifications()
    fetchTaskCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
      fetchTaskCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (open) {
      fetchNotifications()
      setHasNewTask(false) // Reset new task indicator when opening
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} className={hasNewTask ? 'text-red-500' : ''} />
          {stats.totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {stats.totalUnread > 99 ? '99+' : stats.totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {stats.totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck size={14} className="mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b last:border-b-0 hover:bg-muted/50 ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timeAgo}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Check size={12} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}