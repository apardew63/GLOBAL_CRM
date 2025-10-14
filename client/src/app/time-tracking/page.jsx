"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Timer, Play, Square, Pause, Clock, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function TimeTrackingPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TimeTrackingPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function TimeTrackingPageContent() {
  const { user } = useAuth()
  const [activeTasks, setActiveTasks] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      if (response.ok) {
        const data = await response.json()
        setMyTasks(data.data.tasks)
        setActiveTasks(data.data.tasks.filter(task => task.timeTracking?.isActive))
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error starting task:', error)
    }
  }

  const handleStopTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error stopping task:', error)
    }
  }

  const formatDuration = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getCurrentSessionDuration = (startTime) => {
    if (!startTime) return 0
    return Date.now() - new Date(startTime).getTime()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Time Tracking</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage your work time</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Sessions</p>
            <p className="text-2xl font-bold text-primary">{activeTasks.length}</p>
          </div>
        </div>

        {/* Active Time Tracking */}
        {activeTasks.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-900">Active Time Tracking</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTasks.map((task) => (
                <div key={task._id} className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-foreground mb-2">{task.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="animate-pulse">Tracking active</span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 mb-1">
                      {formatDuration(getCurrentSessionDuration(task.timeTracking?.currentSessionStart))}
                    </p>
                    <p className="text-xs text-muted-foreground">Current session</p>
                  </div>
                  <button
                    onClick={() => handleStopTask(task._id)}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop Timer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Tasks for Time Tracking */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-light text-foreground">My Tasks</h2>
              <p className="text-sm text-muted-foreground">Start tracking time on your assigned tasks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTasks.filter(task => task.status === 'in_progress').map((task) => (
              <div key={task._id} className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-foreground">{task.title}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    In Progress
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {task.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total time:</span>
                    <span className="text-foreground font-medium">
                      {formatDuration(task.timeTracking?.totalTimeSpent || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Due date:</span>
                    <span className="text-foreground">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {task.timeTracking?.isActive ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Tracking Active
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartTask(task._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Timer
                  </button>
                )}
              </div>
            ))}
          </div>

          {myTasks.filter(task => task.status === 'in_progress').length === 0 && (
            <div className="text-center py-12">
              <Timer className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No active tasks</h3>
              <p className="text-muted-foreground">Tasks in progress will appear here for time tracking</p>
            </div>
          )}
        </div>

        {/* Time Tracking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Time</p>
                <p className="text-2xl font-light text-foreground">
                  {myTasks.reduce((total, task) => {
                    if (task.timeTracking?.sessions) {
                      const todaySessions = task.timeTracking.sessions.filter(session => {
                        const sessionDate = new Date(session.startTime)
                        const today = new Date()
                        return sessionDate.toDateString() === today.toDateString()
                      })
                      return total + todaySessions.reduce((sum, session) => sum + session.duration, 0)
                    }
                    return total
                  }, 0) / (1000 * 60 * 60) || 0}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-light text-foreground">
                  {myTasks.reduce((total, task) => {
                    if (task.timeTracking?.sessions) {
                      const weekSessions = task.timeTracking.sessions.filter(session => {
                        const sessionDate = new Date(session.startTime)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return sessionDate >= weekAgo
                      })
                      return total + weekSessions.reduce((sum, session) => sum + session.duration, 0)
                    }
                    return total
                  }, 0) / (1000 * 60 * 60) || 0}h
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-light text-foreground">{activeTasks.length}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-light text-foreground">
                  {myTasks.filter(task => task.status === 'in_progress').length}
                </p>
              </div>
              <Timer className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Time Tracking History */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-light text-foreground">Recent Time Sessions</h2>
              <p className="text-sm text-muted-foreground">Your latest time tracking activity</p>
            </div>
          </div>

          <div className="space-y-4">
            {myTasks.flatMap(task =>
              (task.timeTracking?.sessions || [])
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                .slice(0, 3)
                .map((session, index) => (
                  <div key={`${task._id}-${index}`} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.startTime).toLocaleDateString()} •
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                          {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatDuration(session.duration)}
                      </p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground">{session.notes}</p>
                      )}
                    </div>
                  </div>
                ))
            )}

            {myTasks.every(task => !task.timeTracking?.sessions?.length) && (
              <div className="text-center py-8">
                <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No time tracking sessions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}