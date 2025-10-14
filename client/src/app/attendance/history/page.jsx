import { DashboardLayout } from "@/components/dashboard-layout";
import { AttendanceHistorySection } from "@/components/attendance-history-section";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AttendanceHistoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Attendance History</h1>
            <AttendanceHistorySection />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}