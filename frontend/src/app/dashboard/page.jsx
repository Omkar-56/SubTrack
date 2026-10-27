'use client';

import Dashboard from '../../views/Dashboard';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 py-8">
        <Dashboard />
      </main>
    </ProtectedRoute>
  );
}
