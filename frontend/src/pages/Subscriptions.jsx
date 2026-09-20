import { useEffect, useState } from 'react';
import { api } from '../api/client';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionForm from '../components/SubscriptionForm';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [priceIncreases, setPriceIncreases] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function refresh() {
    try {
      const [{ subscriptions }, summary] = await Promise.all([
        api.listSubscriptions(),
        api.dashboardSummary(),
      ]);
      setSubscriptions(subscriptions);
      setPriceIncreases(summary.recentPriceIncreases);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(data) {
    await api.createSubscription(data);
    setShowForm(false);
    refresh();
  }

  async function handleUpdate(data) {
    await api.updateSubscription(editing.id, data);
    setEditing(null);
    refresh();
  }

  async function handleDelete(subscription) {
    if (!confirm(`Delete ${subscription.name}?`)) return;
    await api.deleteSubscription(subscription.id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Subscriptions</h1>
          <p className="mt-1 text-sm text-ink/60">Everything you're paying for, in one ledger.</p>
        </div>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-sm bg-ledger px-4 py-2 text-sm font-medium text-white hover:bg-ledger-dark"
          >
            Add subscription
          </button>
        )}
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      {showForm && (
        <SubscriptionForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <SubscriptionForm
          initial={{
            name: editing.name,
            category: editing.category,
            amount: editing.amount,
            currency: editing.currency,
            billingCycle: editing.billingCycle,
            nextRenewalDate: editing.nextRenewalDate?.slice(0, 10),
            status: editing.status,
            notes: editing.notes || '',
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="border border-line bg-white px-4">
        {subscriptions.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/50">No subscriptions yet. Add your first one above.</p>
        )}
        {subscriptions.map((s) => (
          <SubscriptionCard
            key={s.id}
            subscription={s}
            priceIncrease={priceIncreases.find((p) => p.subscriptionId === s.id)}
            onEdit={(sub) => {
              setShowForm(false);
              setEditing(sub);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
