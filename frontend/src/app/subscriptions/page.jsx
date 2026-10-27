'use client';

import Subscriptions from '../../views/Subscriptions';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-[1440px] w-full px-6 sm:px-10 lg:px-14 py-8">
        <Subscriptions />
      </main>
    </ProtectedRoute>
  );
}
