"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { DollarSign, Plus, Eye, Edit, CheckCircle, XCircle, Clock, Users, TrendingUp, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function PayrollPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PayrollPageContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function PayrollPageContent() {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState([])
  const [stats, setStats] = useState(null)
  const [pendingPayrolls, setPendingPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState(null)

  useEffect(() => {
    fetchPayrollData()
  }, [])

  const fetchPayrollData = async () => {
    try {
      const [payrollsRes, statsRes, pendingRes] = await Promise.all([
        fetch('http://localhost:5000/api/payroll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/payroll/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch('http://localhost:5000/api/payroll/pending', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ])

      if (payrollsRes.ok) {
        const payrollsData = await payrollsRes.json()
        setPayrolls(payrollsData.data.payrolls)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data.stats)
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingPayrolls(pendingData.data.payrolls)
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayroll = async (payrollId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payroll/${payrollId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })

      if (response.ok) {
        fetchPayrollData()
      }
    } catch (error) {
      console.error('Error approving payroll:', error)
    }
  }

  const handleMarkAsPaid = async (payrollId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payroll/${payrollId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          paymentDate: new Date().toISOString(),
          paymentMethod: 'bank_transfer'
        })
      })

      if (response.ok) {
        fetchPayrollData()
      }
    } catch (error) {
      console.error('Error marking payroll as paid:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-3xl font-light tracking-tight text-foreground">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee salaries, bonuses, and payments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Payroll
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payrolls</p>
                  <p className="text-2xl font-light text-foreground">{stats.totalPayrolls}</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Gross Pay</p>
                  <p className="text-2xl font-light text-foreground">${stats.totalGrossPay?.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Net Pay</p>
                  <p className="text-2xl font-light text-foreground">${stats.totalNetPay?.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Gross Pay</p>
                  <p className="text-2xl font-light text-foreground">${stats.averageGrossPay?.toFixed(0)}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        {pendingPayrolls.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-yellow-800">Pending Approvals</h2>
            </div>
            <div className="space-y-3">
              {pendingPayrolls.slice(0, 3).map((payroll) => (
                <div key={payroll._id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-foreground">
                      {payroll.employee.firstName} {payroll.employee.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payroll.period} - ${payroll.netPay} net pay
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprovePayroll(payroll._id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payroll Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">Payroll Records</h2>
            <p className="text-sm text-muted-foreground">All employee payroll records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Net Pay
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
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {payroll.employee.firstName[0]}{payroll.employee.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {payroll.employee.firstName} {payroll.employee.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {payroll.employee.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {payroll.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${payroll.grossPay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${payroll.netPay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPayroll(payroll)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payroll.status === 'approved' && (
                          <button
                            onClick={() => handleMarkAsPaid(payroll._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {payroll.status === 'pending' && user.role === 'admin' && (
                          <button
                            onClick={() => handleApprovePayroll(payroll._id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payrolls.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No payroll records</h3>
              <p className="text-muted-foreground">Payroll records will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}