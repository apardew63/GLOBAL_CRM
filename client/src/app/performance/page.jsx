"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Award, TrendingUp, Users, Calendar, Star, Target, BarChart3, Trophy } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PerformancePageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function PerformancePageContent() {
  const { user } = useAuth()
  const [performanceData, setPerformanceData] = useState([])
  const [employeeOfTheMonth, setEmployeeOfTheMonth] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const [perfRes, eotmRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/performance', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/performance/employee-of-month/current', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/performance/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (perfRes.ok) {
        const perfData = await perfRes.json()
        setPerformanceData(perfData.data.performances)
      }

      if (eotmRes.ok) {
        const eotmData = await eotmRes.json()
        setEmployeeOfTheMonth(eotmData.data.employeeOfTheMonth)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data.stats)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'text-green-600 bg-green-100'
      case 'b': return 'text-blue-600 bg-blue-100'
      case 'c': return 'text-yellow-600 bg-yellow-100'
      case 'd': return 'text-orange-600 bg-orange-100'
      case 'f': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
            <h1 className="text-3xl font-light tracking-tight text-foreground">Performance Management</h1>
            <p className="text-muted-foreground mt-1">Track employee performance and achievements</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Employee of the Month */}
        {employeeOfTheMonth && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-1">Employee of the Month</h2>
                <p className="text-muted-foreground mb-2">Congratulations to our top performer!</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {employeeOfTheMonth.employee.firstName} {employeeOfTheMonth.employee.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {employeeOfTheMonth.employee.designation}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{employeeOfTheMonth.overallScore}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{employeeOfTheMonth.grade}</p>
                      <p className="text-xs text-muted-foreground">Grade</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-light text-foreground">{stats.averageScore}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Performers</p>
                  <p className="text-2xl font-light text-foreground">{stats.topPerformersCount}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Evaluations</p>
                  <p className="text-2xl font-light text-foreground">{stats.totalEvaluations}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-light text-foreground">{stats.currentMonthEvaluations}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Performance Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">Employee Performance</h2>
            <p className="text-sm text-muted-foreground">Latest performance evaluations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tasks Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Evaluation Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {performanceData.map((performance) => (
                  <tr key={performance._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {performance.employee.firstName[0]}{performance.employee.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {performance.employee.firstName} {performance.employee.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {performance.employee.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-foreground mr-2">
                          {performance.overallScore}%
                        </span>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${performance.overallScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(performance.grade)}`}>
                        {performance.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {performance.tasksCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {Math.round(performance.attendanceRate)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(performance.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {performanceData.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No performance data</h3>
              <p className="text-muted-foreground">Performance evaluations will appear here</p>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-light text-foreground">Performance Trends</h2>
                <p className="text-sm text-muted-foreground">Monthly performance overview</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-sm font-medium text-foreground">87%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Attendance Rate</span>
                <span className="text-sm font-medium text-foreground">92%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Task Completion</span>
                <span className="text-sm font-medium text-foreground">78%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-light text-foreground">Top Achievements</h2>
                <p className="text-sm text-muted-foreground">Recent recognitions</p>
              </div>
            </div>

            <div className="space-y-4">
              {performanceData.slice(0, 3).map((performance, index) => (
                <div key={performance._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {performance.employee.firstName} {performance.employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {performance.overallScore}% overall score
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${getGradeColor(performance.grade)}`}>
                    {performance.grade}
                  </div>
                </div>
              ))}

              {performanceData.length === 0 && (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No achievements yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}