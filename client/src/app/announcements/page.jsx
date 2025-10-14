"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Bell, Plus, Search, Edit, Eye, Megaphone, Calendar, User } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AnnouncementsPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function AnnouncementsPageContent() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    type: "announcement",
    date: ""
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/holidays", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.data.holidays)
      }
    } catch (error) {
      console.error("Error fetching announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || announcement.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeColor = (type) => {
    switch (type) {
      case "holiday":
        return "bg-green-100 text-green-800"
      case "event":
        return "bg-blue-100 text-blue-800"
      case "announcement":
        return "bg-purple-100 text-purple-800"
      case "reminder":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:5000/api/holidays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(newAnnouncement)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setNewAnnouncement({
          title: "",
          description: "",
          type: "announcement",
          date: ""
        })
        fetchAnnouncements()
      }
    } catch (error) {
      console.error("Error creating announcement:", error)
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Announcements</h1>
            <p className="text-muted-foreground mt-1">Company announcements, holidays, and important updates</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Announcement
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="announcement">Announcement</option>
            <option value="holiday">Holiday</option>
            <option value="event">Event</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement._id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{announcement.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {announcement.date
                      ? new Date(announcement.date).toLocaleDateString()
                      : "Ongoing"}
                  </span>
                </div>

                {announcement.createdBy && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>
                      Posted by {announcement.createdBy.firstName} {announcement.createdBy.lastName}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Announcements" value={announcements.length} icon={<Bell className="w-8 h-8 text-muted-foreground" />} />
          <StatCard title="Holidays" value={announcements.filter(a => a.type === "holiday").length} icon={<Calendar className="w-8 h-8 text-green-500" />} />
          <StatCard title="Events" value={announcements.filter(a => a.type === "event").length} icon={<Megaphone className="w-8 h-8 text-blue-500" />} />
          <StatCard
            title="This Month"
            value={announcements.filter(a => {
              const d = new Date(a.date || a.createdAt)
              const now = new Date()
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length}
            icon={<Calendar className="w-8 h-8 text-purple-500" />}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-light text-foreground">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest announcements and updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.slice(0, 5).map((announcement) => (
              <div key={announcement._id} className="flex items-start gap-4 py-3 border-b border-border last:border-b-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{announcement.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(announcement.createdAt).toLocaleDateString()} • {announcement.type}
                  </p>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Modal moved outside loading block */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Announcement</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  value={newAnnouncement.description}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="holiday">Holiday</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date (Optional)</label>
                  <input
                    type="date"
                    value={newAnnouncement.date}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-light text-foreground">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}
