"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut, Calendar, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function AttendanceSection() {
  const { user, getToken } = useAuth()
  const [attendance, setAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [resetting, setResetting] = useState(false)

  const URL = process.env.NEXT_PUBLIC_URL

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    if (!user) return

    try {
      const response = await fetch(`${URL}/api/attendance/today`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAttendance(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }


  // Check-in handler
  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const response = await fetch(`${URL}/api/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Checked in successfully!')
        if (data.data.isLate) {
          toast.warning(`Late check-in: ${data.data.lateMinutes} minutes late`)
        }
        // Refresh attendance data to ensure UI updates
        await fetchTodayAttendance()
      } else {
        toast.error(data.message || 'Failed to check in')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      toast.error('Failed to check in')
    } finally {
      setCheckingIn(false)
    }
  }

  // Check-out handler
  const handleCheckOut = async () => {
    setCheckingOut(true)
    try {
      const response = await fetch(`${URL}/api/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Checked out successfully!')
        if (data.data.isEarly) {
          toast.warning(`Early check-out: ${data.data.earlyMinutes} minutes early`)
        }
        // Refresh attendance data to ensure UI updates
        await fetchTodayAttendance()
      } else {
        toast.error(data.message || 'Failed to check out')
      }
    } catch (error) {
      console.error('Check-out error:', error)
      toast.error('Failed to check out')
    } finally {
      setCheckingOut(false)
    }
  }

  // Reset today's attendance handler
  const handleResetToday = async () => {
    if (!confirm('Are you sure you want to reset today\'s attendance? This will allow you to check in again.')) {
      return
    }

    setResetting(true)
    try {
      const response = await fetch(`${URL}/api/attendance/reset-today`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Today\'s attendance has been reset!')
        // Refresh the attendance data
        await fetchTodayAttendance()
      } else {
        toast.error(data.message || 'Failed to reset attendance')
      }
    } catch (error) {
      console.error('Reset attendance error:', error)
      toast.error('Failed to reset attendance')
    } finally {
      setResetting(false)
    }
  }

  useEffect(() => {
    fetchTodayAttendance()

    // Refresh attendance data every minute
    const interval = setInterval(fetchTodayAttendance, 60000)
    return () => clearInterval(interval)
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            My Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasCheckedIn = attendance?.hasCheckedIn
  const hasCheckedOut = attendance?.hasCheckedOut
  const isLate = attendance?.isLate
  const isEarly = attendance?.isEarly

  return (
    <div className="space-y-6">
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          My Attendance
        </CardTitle>
        <CardDescription>
          Track your daily check-in and check-out times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Check-in</div>
            <div className="text-lg font-semibold">
              {hasCheckedIn ? (
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {new Date(attendance.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">--:--</span>
              )}
            </div>
            {isLate && (
              <Badge variant="destructive" className="mt-1 text-xs">
                {attendance.lateMinutes} min late
              </Badge>
            )}
          </div>

          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Check-out</div>
            <div className="text-lg font-semibold">
              {hasCheckedOut ? (
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {new Date(attendance.checkOutTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">--:--</span>
              )}
            </div>
            {isEarly && (
              <Badge variant="destructive" className="mt-1 text-xs">
                {attendance.earlyMinutes} min early
              </Badge>
            )}
          </div>
        </div>

        {/* Working Hours */}
        {hasCheckedOut && attendance.totalHours && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Today's Hours</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {attendance.totalHours.toFixed(2)}h
                </div>
                {attendance.overtimeHours > 0 && (
                  <div className="text-xs text-green-600">
                    +{attendance.overtimeHours.toFixed(2)}h overtime
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!hasCheckedIn ? (
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="flex-1"
              size="lg"
            >
              {checkingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking In...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Check In
                </>
              )}
            </Button>
          ) : hasCheckedIn && !hasCheckedOut ? (
            <Button
              onClick={handleCheckOut}
              disabled={checkingOut}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              {checkingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking Out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Check Out
                </>
              )}
            </Button>
          ) : (
            <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
              <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-sm font-medium text-green-700">
                Attendance Complete
              </div>
            </div>
          )}
        </div>

        {/* Reset Button for Testing */}
        <div className="pt-2">
          <Button
            onClick={handleResetToday}
            disabled={resetting}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {resetting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-2"></div>
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="h-3 w-3 mr-2" />
                Reset Today (Testing)
              </>
            )}
          </Button>
        </div>

        {/* Warnings */}
        {(isLate || isEarly) && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                {isLate && `You checked in ${attendance.lateMinutes} minutes late today.`}
                {isLate && isEarly && ' '}
                {isEarly && `You checked out ${attendance.earlyMinutes} minutes early today.`}
              </div>
            </div>
          </div>
        )}

        {/* Today's Date */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </CardContent>
    </Card>

    </div>
  )
}