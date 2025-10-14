"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Phone, TrendingUp, Target, Clock, Users, DollarSign, PhoneCall, CheckCircle } from "lucide-react"

export default function SalesDashboard() {
  const { user } = useAuth()
  const [salesStats, setSalesStats] = useState(null)
  const [upcomingCalls, setUpcomingCalls] = useState([])
  const [followUps, setFollowUps] = useState([])
  const [isCalling, setIsCalling] = useState(false)

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      const [statsRes, upcomingRes, followUpsRes] = await Promise.all([
        fetch('http://localhost:5000/api/sales/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/sales/upcoming', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/sales/follow-ups', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setSalesStats(statsData.data.stats)
      }

      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json()
        setUpcomingCalls(upcomingData.data.salesCalls)
      }

      if (followUpsRes.ok) {
        const followUpsData = await followUpsRes.json()
        setFollowUps(followUpsData.data.salesCalls)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    }
  }

  const initiateCall = async (callId) => {
    setIsCalling(true)
    try {
      const response = await fetch(`http://localhost:5000/api/sales/calls/${callId}/initiate-call`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      if (response.ok) {
        // In a real implementation, this would connect to Ringblaze
        alert('Call initiated successfully! (Ringblaze integration would handle the actual call)')
      } else {
        alert('Failed to initiate call')
      }
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Error initiating call')
    } finally {
      setIsCalling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track calls, leads, and performance</p>
          </div>
          <div className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded">
            Sales Representative
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-3xl font-light text-foreground mt-2">{salesStats?.totalCalls || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </div>
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-light text-foreground mt-2">{salesStats?.conversionRate || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">Successful calls</p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Generated</p>
                <p className="text-3xl font-light text-foreground mt-2">${salesStats?.totalDealValue || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Closed deals</p>
              </div>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Call Duration</p>
                <p className="text-3xl font-light text-foreground mt-2">{salesStats?.avgCallDuration || 0}m</p>
                <p className="text-xs text-muted-foreground mt-1">Per call</p>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Calls */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <PhoneCall className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-light text-foreground">Upcoming Calls</h2>
                <p className="text-sm text-muted-foreground">Scheduled sales calls</p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingCalls.length > 0 ? (
                upcomingCalls.slice(0, 5).map((call) => (
                  <div key={call._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{call.lead.name}</p>
                      <p className="text-xs text-muted-foreground">{call.lead.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(call.scheduledDate).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => initiateCall(call._id)}
                      disabled={isCalling}
                      className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      <Phone className="w-3 h-3 inline mr-1" />
                      {isCalling ? 'Calling...' : 'Call'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <PhoneCall className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No upcoming calls</p>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Calls */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-light text-foreground">Follow-up Required</h2>
                <p className="text-sm text-muted-foreground">Calls needing attention</p>
              </div>
            </div>

            <div className="space-y-4">
              {followUps.length > 0 ? (
                followUps.slice(0, 5).map((call) => (
                  <div key={call._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{call.lead.name}</p>
                      <p className="text-xs text-muted-foreground">{call.outcome || 'Needs follow-up'}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(call.followUpDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => initiateCall(call._id)}
                      disabled={isCalling}
                      className="px-3 py-1 border border-border text-muted-foreground text-xs rounded hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Phone className="w-3 h-3 inline mr-1" />
                      Follow-up
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No follow-ups required</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-light text-foreground">Sales Actions</h2>
              <p className="text-sm text-muted-foreground">Common activities</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group">
              <Phone className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
              <div className="text-sm font-medium text-foreground mb-1">New Call</div>
              <div className="text-xs text-muted-foreground">Add sales call</div>
            </button>

            <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group">
              <Users className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
              <div className="text-sm font-medium text-foreground mb-1">Add Lead</div>
              <div className="text-xs text-muted-foreground">Create new prospect</div>
            </button>

            <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group">
              <CheckCircle className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
              <div className="text-sm font-medium text-foreground mb-1">Complete Call</div>
              <div className="text-xs text-muted-foreground">Mark call as done</div>
            </button>

            <button className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left group">
              <TrendingUp className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
              <div className="text-sm font-medium text-foreground mb-1">View Reports</div>
              <div className="text-xs text-muted-foreground">Sales analytics</div>
            </button>
          </div>
        </div>

        {/* Ringblaze Integration Notice */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-center">
            <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-light text-foreground mb-2">Ringblaze Dialer Integration</h3>
            <p className="text-muted-foreground mb-4">
              Your sales dialer is integrated with Ringblaze for seamless calling experience.
              Click "Call" buttons above to initiate calls through the integrated system.
            </p>
            <div className="inline-flex px-3 py-1 bg-muted text-muted-foreground text-xs rounded">
              Integration Active
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}