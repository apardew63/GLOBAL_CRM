"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { User, Mail, Phone, MapPin, Calendar, Award, Briefcase, Clock, Edit3, Camera } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfilePageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function ProfilePageContent() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || {}
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const [statsRes, perfRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/dashboard-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`http://localhost:5000/api/performance/employee/${user._id}?limit=1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setUserStats(statsData.data.stats)
      }

      if (perfRes.ok) {
        const perfData = await perfRes.json()
        setPerformance(perfData.data.performances[0])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        setIsEditing(false)
        // Refresh user data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
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
            <h1 className="text-4xl font-light tracking-tight text-slate-900">Profile</h1>
            <p className="text-slate-600 mt-2">Manage your account information and view your performance</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-1/2 translate-x-16 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name and Role */}
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-600 mb-2 capitalize">{user.designation}</p>
                <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {user.role}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{userStats?.myTasks || 0}</div>
                    <div className="text-sm text-slate-600">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{userStats?.completedTasks || 0}</div>
                    <div className="text-sm text-slate-600">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-slate-600" />
                <h3 className="text-xl font-semibold text-slate-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-slate-900 py-2">{user.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="flex items-center gap-2 py-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-900">{user.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID</label>
                  <p className="text-slate-900 py-2 font-mono">{user.employeeId || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <div className="flex items-center gap-2 py-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">{user.department || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Performance Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-slate-600" />
                <h3 className="text-xl font-semibold text-slate-900">Performance Overview</h3>
              </div>

              {performance ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{performance.overallScore}%</div>
                    <div className="text-green-700 font-medium">Overall Score</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{performance.tasksCompleted}</div>
                    <div className="text-blue-700 font-medium">Tasks Completed</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(performance.attendanceRate)}%</div>
                    <div className="text-purple-700 font-medium">Attendance Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Performance data will be available soon</p>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-slate-600" />
                <h3 className="text-xl font-semibold text-slate-900">Account Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Join Date</label>
                  <div className="flex items-center gap-2 py-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Login</label>
                  <div className="flex items-center gap-2 py-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-slate-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Account Status</label>
                  <div className="flex items-center gap-2 py-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-slate-900">{user.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Verified</label>
                  <div className="flex items-center gap-2 py-2">
                    <div className={`w-2 h-2 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <p className="text-slate-900">{user.isEmailVerified ? 'Verified' : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
