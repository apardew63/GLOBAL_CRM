"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import AdminDashboard from "./admin/page"
import SalesDashboard from "./sales/page"
import EmployeeDashboard from "./employee/page"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />
      case 'project_manager':
        return <AdminDashboard /> // PMs see admin dashboard
      case 'employee':
        // Check if employee has sales designation
        if (user?.designation === 'sales') {
          return <SalesDashboard />
        }
        return <EmployeeDashboard />
      default:
        return <EmployeeDashboard />
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {renderDashboard()}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
