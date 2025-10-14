"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Users, Plus, Eye, Edit, UserCheck, X, Briefcase, Calendar, MapPin, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function RecruitmentPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RecruitmentPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function RecruitmentPageContent() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showApplications, setShowApplications] = useState(false)

  useEffect(() => {
    fetchRecruitmentData()
  }, [])

  const fetchRecruitmentData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/recruitment', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/recruitment/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData.data.jobs)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data.stats)
      }
    } catch (error) {
      console.error('Error fetching recruitment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyForJob = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          coverLetter: 'I am interested in this position.'
        })
      })

      if (response.ok) {
        fetchRecruitmentData()
      }
    } catch (error) {
      console.error('Error applying for job:', error)
    }
  }

  const handleUpdateApplicationStatus = async (jobId, applicationId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/${jobId}/application/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchRecruitmentData()
      }
    } catch (error) {
      console.error('Error updating application status:', error)
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
            <h1 className="text-3xl font-light tracking-tight text-foreground">Recruitment Management</h1>
            <p className="text-muted-foreground mt-1">Manage job postings, applications, and hiring process</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-light text-foreground">{stats.totalJobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-light text-foreground">{stats.activeJobs}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-light text-foreground">{stats.totalApplications}</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hired Candidates</p>
                  <p className="text-2xl font-light text-foreground">{stats.hiredCandidates}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Job Postings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">Job Postings</h2>
            <p className="text-sm text-muted-foreground">All job openings and their status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {job.jobTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {job.employmentType} • {job.experienceLevel}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {job.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {job.totalApplications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowApplications(job)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        {(user.role === 'admin' || user.role === 'project_manager') && (
                          <button
                            onClick={() => handleApplyForJob(job._id)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No job postings</h3>
              <p className="text-muted-foreground">Job postings will appear here</p>
            </div>
          )}
        </div>

        {/* Applications Modal */}
        {showApplications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Applications for {showApplications.jobTitle}
                </h2>
                <button
                  onClick={() => setShowApplications(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {showApplications.applications.map((application) => (
                  <div key={application._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {application.applicant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {application.applicant.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'hired' ? 'bg-green-100 text-green-800' :
                          application.status === 'interviewed' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {application.coverLetter && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {application.coverLetter}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Applied: {new Date(application.applicationDate).toLocaleDateString()}
                      </span>
                      {(user.role === 'admin' || user.role === 'project_manager') && (
                        <div className="flex gap-2 ml-auto">
                          {application.status === 'applied' && (
                            <button
                              onClick={() => handleUpdateApplicationStatus(showApplications._id, application._id, 'shortlisted')}
                              className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                            >
                              Shortlist
                            </button>
                          )}
                          {application.status === 'shortlisted' && (
                            <button
                              onClick={() => handleUpdateApplicationStatus(showApplications._id, application._id, 'interview_scheduled')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Schedule Interview
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {showApplications.applications.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}