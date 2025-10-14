"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { CheckCircle, Clock, AlertTriangle, Calendar, Award, FileText, TrendingUp } from "lucide-react"

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [myTasks, setMyTasks] = useState([])
  const [upcomingHolidays, setUpcomingHolidays] = useState([])
  const [performance, setPerformance] = useState(null)

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      const [statsRes, tasksRes, holidaysRes, perfRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/dashboard-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/tasks?limit=5', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/holidays', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`http://localhost:5000/api/performance/employee/${user._id}?limit=1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data.stats)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setMyTasks(tasksData.data.tasks)
      }

      if (holidaysRes.ok) {
        const holidaysData = await holidaysRes.json()
        setUpcomingHolidays(holidaysData.data.holidays)
      }

      if (perfRes.ok) {
        const perfData = await perfRes.json()
        setPerformance(perfData.data.performances[0])
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
    }
  }

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-muted-foreground" />
      case 'in_progress': return <Clock className="w-4 h-4 text-muted-foreground" />
      case 'pending': return <FileText className="w-4 h-4 text-muted-foreground" />
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-muted-foreground" />
      default: return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900">My Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome back, {user?.firstName}</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg shadow-sm capitalize">
            {user?.designation || 'Employee'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">My Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.myTasks || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Total assigned</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.completedTasks || 0}</p>
                <p className="text-xs text-slate-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.inProgressTasks || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Active tasks</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.overdueTasks || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">My Recent Tasks</h2>
                <p className="text-sm text-slate-600">Latest assignments</p>
              </div>
            </div>

            <div className="space-y-4">
              {myTasks.length > 0 ? (
                myTasks.map((task) => (
                  <div key={task._id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="mt-0.5">
                      {getTaskStatusIcon(task.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <div className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full mt-2 capitalize">
                        {task.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No tasks assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance & Recognition */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Performance</h2>
                <p className="text-sm text-slate-600">Recent evaluation</p>
              </div>
            </div>

            {performance ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{performance.overallScore}%</p>
                  <div className="inline-flex px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg mt-3">
                    Grade {performance.grade}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Tasks Completed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{performance.tasksCompleted}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{Math.round(performance.attendanceRate)}%</p>
                  </div>
                </div>
                {performance.achievements && performance.achievements.length > 0 && (
                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-600 uppercase tracking-wide mb-3 font-medium">Recent Achievement</p>
                    <p className="text-sm text-slate-900 font-medium">{performance.achievements[0].title}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600">Performance data will be available soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Announcements</h2>
              <p className="text-sm text-slate-600">Company updates and holidays</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingHolidays.length > 0 ? (
              upcomingHolidays.map((holiday) => (
                <div key={holiday._id} className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{holiday.title}</h4>
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                      {holiday.type}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 font-medium">
                    {holiday.date ? new Date(holiday.date).toLocaleDateString() : 'Ongoing'}
                  </p>
                  <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    {holiday.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600">No upcoming announcements</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
              <p className="text-sm text-slate-600">Common employee tasks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">Check In/Out</div>
              <div className="text-xs text-slate-600 leading-relaxed">Attendance tracking</div>
            </button>

            <button className="p-6 border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">My Tasks</div>
              <div className="text-xs text-slate-600 leading-relaxed">View all assignments</div>
            </button>

            <button className="p-6 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">Time Tracking</div>
              <div className="text-xs text-slate-600 leading-relaxed">Start/stop timers</div>
            </button>

            <button className="p-6 border border-slate-200 rounded-xl hover:border-yellow-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">My Profile</div>
              <div className="text-xs text-slate-600 leading-relaxed">Update information</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}