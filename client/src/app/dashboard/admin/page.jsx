"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Users, FileText, Bell, Award, Calendar, Settings, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [employeeOfTheMonth, setEmployeeOfTheMonth] = useState(null)
  const [recentHolidays, setRecentHolidays] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eotmRes, holidaysRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/dashboard-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/performance/employee-of-month/current', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/holidays?limit=5', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data.stats)
      }

      if (eotmRes.ok) {
        const eotmData = await eotmRes.json()
        setEmployeeOfTheMonth(eotmData.data.employeeOfTheMonth)
      }

      if (holidaysRes.ok) {
        const holidaysData = await holidaysRes.json()
        setRecentHolidays(holidaysData.data.holidays)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">System overview and management</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg shadow-sm">
            Administrator
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Employees</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Active users</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.activeTasks || 0}</p>
                <p className="text-xs text-slate-500 mt-1">In progress</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Overdue Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.overdueTasks || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Require attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Notifications</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.unreadNotifications || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Unread</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employee of the Month */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Employee of the Month</h2>
                <p className="text-sm text-slate-600">Current recognition</p>
              </div>
            </div>

            {employeeOfTheMonth ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {employeeOfTheMonth.employee.firstName[0]}{employeeOfTheMonth.employee.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {employeeOfTheMonth.employee.firstName} {employeeOfTheMonth.employee.lastName}
                    </p>
                    <p className="text-sm text-slate-600 capitalize">
                      {employeeOfTheMonth.employee.designation}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Score</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{employeeOfTheMonth.overallScore}%</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">Grade</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{employeeOfTheMonth.grade}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600">No selection yet</p>
              </div>
            )}
          </div>

          {/* Recent Announcements */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Announcements</h2>
                <p className="text-sm text-slate-600">Recent updates</p>
              </div>
            </div>

            <div className="space-y-4">
              {recentHolidays.length > 0 ? (
                recentHolidays.map((holiday) => (
                  <div key={holiday._id} className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 rounded-lg px-3 -mx-3 transition-colors">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{holiday.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(holiday.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No announcements</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
              <p className="text-sm text-slate-600">Administrative tasks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">Manage Employees</div>
              <div className="text-xs text-slate-600 leading-relaxed">Add, edit, or remove staff members</div>
            </button>

            <button className="p-6 border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">Post Announcement</div>
              <div className="text-xs text-slate-600 leading-relaxed">Create company updates and news</div>
            </button>

            <button className="p-6 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">View Reports</div>
              <div className="text-xs text-slate-600 leading-relaxed">Performance analytics and insights</div>
            </button>

            <button className="p-6 border border-slate-200 rounded-xl hover:border-yellow-300 hover:shadow-md transition-all duration-200 text-left group bg-gradient-to-br from-white to-slate-50">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-2">Calculate EOTM</div>
              <div className="text-xs text-slate-600 leading-relaxed">Employee of the Month selection</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}