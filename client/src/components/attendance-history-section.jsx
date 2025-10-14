"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle, Check, XCircle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function AttendanceHistorySection() {
  const { user, getToken } = useAuth()
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const URL = process.env.NEXT_PUBLIC_URL

  // Fetch attendance history
  const fetchAttendanceHistory = async () => {
    if (!user) return

    setLoadingHistory(true)
    try {
      const response = await fetch(`${URL}/api/attendance/history?limit=50`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAttendanceHistory(data.data.attendance || [])
      }
    } catch (error) {
      console.error('Failed to fetch attendance history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchAttendanceHistory()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance History
        </CardTitle>
        <CardDescription>
          Your complete attendance records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance history found
          </div>
        ) : (
          <div className="space-y-3">
            {attendanceHistory.map((record) => {
              // Determine status icon and color
              let statusIcon, statusColor, statusText;
              const isLate = record.checkIn?.isLate;
              const isEarly = record.checkOut?.isEarly;
              const hasCheckedIn = record.checkIn?.time;
              const hasCheckedOut = record.checkOut?.time;

              if (record.status === 'absent') {
                statusIcon = <XCircle className="h-4 w-4" />;
                statusColor = 'text-red-500';
                statusText = 'Absent';
              } else if (isLate || isEarly) {
                statusIcon = <AlertCircle className="h-4 w-4" />;
                statusColor = 'text-yellow-500';
                statusText = isLate && isEarly ? 'Late & Early' : isLate ? 'Late' : 'Early';
              } else if (hasCheckedIn && hasCheckedOut) {
                statusIcon = <Check className="h-4 w-4" />;
                statusColor = 'text-green-500';
                statusText = 'On Time';
              } else {
                statusIcon = <Clock className="h-4 w-4" />;
                statusColor = 'text-gray-500';
                statusText = 'Incomplete';
              }

              return (
                <div key={record._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 ${statusColor}`}>
                      {statusIcon}
                      <span className="text-sm font-medium">{statusText}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="text-muted-foreground">Check-in</div>
                      <div className="font-medium">
                        {hasCheckedIn
                          ? new Date(record.checkIn.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '--:--'
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">Check-out</div>
                      <div className="font-medium">
                        {hasCheckedOut
                          ? new Date(record.checkOut.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '--:--'
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">Hours</div>
                      <div className="font-medium">
                        {record.totalHours ? `${record.totalHours.toFixed(2)}h` : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}