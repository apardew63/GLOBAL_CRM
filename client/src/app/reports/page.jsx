"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, Users, FileText, Calendar, Download } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReportsPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function ReportsPageContent() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // This would fetch actual reports data from the API
      // For now, we'll show placeholder data
      setTimeout(() => {
        setReports([
          {
            id: 1,
            title: "Employee Performance Report",
            type: "performance",
            date: "2024-01-15",
            status: "completed"
          },
          {
            id: 2,
            title: "Task Completion Report",
            type: "tasks",
            date: "2024-01-14",
            status: "completed"
          },
          {
            id: 3,
            title: "Attendance Summary",
            type: "attendance",
            date: "2024-01-13",
            status: "processing"
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setLoading(false)
    }
  }

  const reportTypes = [
    {
      title: "Employee Reports",
      description: "Performance, attendance, and productivity metrics",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Task Reports",
      description: "Task completion, time tracking, and project analytics",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Sales Reports",
      description: "Sales performance, leads, and conversion metrics",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Attendance Reports",
      description: "Time tracking, overtime, and attendance patterns",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  const handleExportReport = () => {
    // Placeholder for export functionality
    alert('Export functionality will be implemented soon!')
  }

  const handleGenerateReport = (reportType) => {
    setSelectedReportType(reportType)
    setShowGenerateModal(true)
  }

  const handleGenerateReportSubmit = (e) => {
    e.preventDefault()
    // Placeholder for report generation
    alert(`Generating ${selectedReportType} report... This feature will be implemented soon!`)
    setShowGenerateModal(false)
    setSelectedReportType('')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
  
        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-4">Generate {selectedReportType}</h2>
              <form onSubmit={handleGenerateReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Report Period</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>Custom range</option>
                  </select>
                </div>
  
                <div>
                  <label className="block text-sm font-medium mb-1">Format</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
  
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Generate and view comprehensive business reports</p>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((type, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${type.bgColor} rounded-lg flex items-center justify-center`}>
                  <type.icon className={`w-6 h-6 ${type.color}`} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{type.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{type.description}</p>
              <div className="mt-4">
                <button
                  onClick={() => handleGenerateReport(type.title)}
                  className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  Generate Report
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-light text-foreground">Recent Reports</h2>
              <p className="text-sm text-muted-foreground">Your latest generated reports</p>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No reports generated</h3>
                <p className="text-muted-foreground">Generate your first report to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-light text-foreground">{reports.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-light text-foreground">
                  {reports.filter(r => {
                    const reportDate = new Date(r.date)
                    const now = new Date()
                    return reportDate.getMonth() === now.getMonth() &&
                           reportDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-light text-foreground">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-light text-foreground">
                  {reports.filter(r => r.status === 'processing').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}