"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Search, FileText, Users, Calendar, MessageCircle, Filter } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SearchPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function SearchPageContent() {
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState({
    tasks: [],
    employees: [],
    announcements: []
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const searchTabs = [
    { id: "all", label: "All Results", count: 0 },
    { id: "tasks", label: "Tasks", count: results.tasks.length },
    { id: "employees", label: "Employees", count: results.employees.length },
    { id: "announcements", label: "Announcements", count: results.announcements.length }
  ]

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ tasks: [], employees: [], announcements: [] })
      return
    }

    setLoading(true)
    try {
      // Simulate API calls - in real implementation, these would be actual API calls
      const [tasksRes, employeesRes, announcementsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/tasks?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }).catch(() => ({ ok: false })),
        fetch(`http://localhost:5000/api/employees/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }).catch(() => ({ ok: false })),
        fetch(`http://localhost:5000/api/holidays?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }).catch(() => ({ ok: false }))
      ])

      const tasks = tasksRes.ok ? (await tasksRes.json()).data.tasks : []
      const employees = employeesRes.ok ? (await employeesRes.json()).data.employees : []
      const announcements = announcementsRes.ok ? (await announcementsRes.json()).data.holidays : []

      setResults({ tasks, employees, announcements })

      // Update tab counts
      searchTabs[0].count = tasks.length + employees.length + announcements.length
      searchTabs[1].count = tasks.length
      searchTabs[2].count = employees.length
      searchTabs[3].count = announcements.length

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const renderResults = () => {
    switch (activeTab) {
      case "tasks":
        return (
          <div className="space-y-4">
            {results.tasks.map((task) => (
              <div key={task._id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{task.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Status: {task.status.replace('_', ' ')}</span>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                  </div>
                </div>
              </div>
            ))}
            {results.tasks.length === 0 && query && !loading && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No tasks found</p>
              </div>
            )}
          </div>
        )

      case "employees":
        return (
          <div className="space-y-4">
            {results.employees.map((employee) => (
              <div key={employee._id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">
                    {employee.firstName[0]}{employee.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Role: {employee.role}</span>
                    <span>Department: {employee.department || 'Not assigned'}</span>
                    {employee.employeeId && <span>ID: {employee.employeeId}</span>}
                  </div>
                </div>
              </div>
            ))}
            {results.employees.length === 0 && query && !loading && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No employees found</p>
              </div>
            )}
          </div>
        )

      case "announcements":
        return (
          <div className="space-y-4">
            {results.announcements.map((announcement) => (
              <div key={announcement._id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{announcement.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Type: {announcement.type}</span>
                    <span>Date: {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            ))}
            {results.announcements.length === 0 && query && !loading && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No announcements found</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-8">
            {/* Tasks Section */}
            {results.tasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Tasks ({results.tasks.length})
                </h3>
                <div className="space-y-3">
                  {results.tasks.slice(0, 3).map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-sm text-muted-foreground">Status: {task.status.replace('_', ' ')}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employees Section */}
            {results.employees.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Employees ({results.employees.length})
                </h3>
                <div className="space-y-3">
                  {results.employees.slice(0, 3).map((employee) => (
                    <div key={employee._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {employee.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements Section */}
            {results.announcements.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  Announcements ({results.announcements.length})
                </h3>
                <div className="space-y-3">
                  {results.announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{announcement.title}</p>
                        <p className="text-sm text-muted-foreground">Type: {announcement.type}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.tasks.length === 0 && results.employees.length === 0 && results.announcements.length === 0 && query && !loading && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or check your spelling</p>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tight text-foreground">Search</h1>
          <p className="text-muted-foreground mt-1">Find tasks, employees, and announcements</p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg shadow-sm"
              autoFocus
            />
            {loading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            {searchTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Results */}
        <div className="min-h-[400px]">
          {renderResults()}
        </div>

        {/* Search Tips */}
        {query && (
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="font-medium text-foreground mb-3">Search Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Tasks</p>
                <p>Search by title, description, or assignee name</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Employees</p>
                <p>Search by name, email, employee ID, or department</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Announcements</p>
                <p>Search by title, description, or type</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Advanced</p>
                <p>Use quotes for exact matches, or combine multiple terms</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}