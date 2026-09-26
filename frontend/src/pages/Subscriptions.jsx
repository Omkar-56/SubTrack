import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionForm from '../components/SubscriptionForm';
import ReceiptParserModal from '../components/ReceiptParserModal';
import PaymentConfirmModal from '../components/PaymentConfirmModal';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import CancellationGuideModal from '../components/CancellationGuideModal';
import { formatMoney } from '../utils/date';
import { formatCategoryLabel } from '../utils/brands';

const CYCLE_TO_MONTHS = {
  weekly: 12 / 52,
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

function monthlyEquivalent(sub) {
  const months = CYCLE_TO_MONTHS[sub.billingCycle] || 1;
  const amt = sub.convertedAmount !== undefined ? sub.convertedAmount : Number(sub.amount);
  return amt / months;
}

export default function Subscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [priceIncreases, setPriceIncreases] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showReceiptParser, setShowReceiptParser] = useState(false);
  const [editing, setEditing] = useState(null);

  // Modals for Payment Confirmation, History & Cancellation Guides
  const [payingSub, setPayingSub] = useState(null);
  const [historySub, setHistorySub] = useState(null);
  const [guideSub, setGuideSub] = useState(null);

  const baseCurrency = user?.baseCurrency || 'USD';

  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('renewal_asc');

  async function refresh() {
    try {
      const [{ subscriptions: rawSubs }, summary] = await Promise.all([
        api.listSubscriptions(),
        api.dashboardSummary(14, baseCurrency),
      ]);

      const upcomingMap = new Map((summary?.upcomingRenewals || []).map((u) => [u.id, u]));
      const enriched = rawSubs.map((s) => {
        const matchingUpcoming = upcomingMap.get(s.id);
        if (matchingUpcoming) {
          return { ...s, convertedAmount: matchingUpcoming.convertedAmount };
        }
        return s;
      });

      setSubscriptions(enriched);
      setPriceIncreases(summary?.recentPriceIncreases || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [baseCurrency]);

  useEffect(() => {
    function onExternalRefresh() {
      refresh();
    }
    window.addEventListener('subtrack:refresh', onExternalRefresh);
    return () => window.removeEventListener('subtrack:refresh', onExternalRefresh);
  }, [baseCurrency]);

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

  async function handleConvertTrial(subscription) {
    try {
      await api.convertTrial(subscription.id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirmPayment(paymentData) {
    if (!payingSub) return;
    await api.confirmPayment(payingSub.id, paymentData);
    setPayingSub(null);
    refresh();
  }

  async function handleStatusChange(subscription, newStatus) {
    try {
      await api.updateSubscription(subscription.id, {
        name: subscription.name,
        category: subscription.category || 'other',
        amount: Number(subscription.amount),
        currency: subscription.currency || 'USD',
        billingCycle: subscription.billingCycle || 'monthly',
        nextRenewalDate: String(subscription.nextRenewalDate).slice(0, 10),
        status: newStatus,
        notes: subscription.notes || '',
        isFreeTrial: Boolean(subscription.isFreeTrial),
        trialEndDate: subscription.trialEndDate ? String(subscription.trialEndDate).slice(0, 10) : null,
        cancellationDeadline: subscription.cancellationDeadline ? String(subscription.cancellationDeadline).slice(0, 10) : null,
        postTrialAmount: subscription.postTrialAmount !== null && subscription.postTrialAmount !== undefined ? Number(subscription.postTrialAmount) : null,
        postTrialCurrency: subscription.postTrialCurrency || subscription.currency,
      });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(subscription) {
    if (!confirm(`Delete ${subscription.name}?`)) return;
    await api.deleteSubscription(subscription.id);
    refresh();
  }

  // Extract unique categories from actual data
  const availableCategories = useMemo(() => {
    const set = new Set(subscriptions.map((s) => s.category).filter(Boolean));
    return Array.from(set).sort();
  }, [subscriptions]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: subscriptions.length,
      active: subscriptions.filter((s) => s.status === 'active' && !s.isFreeTrial).length,
      trials: subscriptions.filter((s) => s.isFreeTrial && s.status === 'active').length,
      paused: subscriptions.filter((s) => s.status === 'paused').length,
      cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
    };
  }, [subscriptions]);

  // Filtered and sorted subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => {
        // Status filter
        if (statusFilter === 'trials') {
          if (!s.isFreeTrial || s.status !== 'active') return false;
        } else if (statusFilter !== 'all' && s.status !== statusFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && s.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        // Billing Cycle filter
        if (cycleFilter !== 'all' && s.billingCycle !== cycleFilter) return false;

        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = s.name.toLowerCase().includes(q);
          const matchCat = s.category.toLowerCase().includes(q);
          const matchNotes = (s.notes || '').toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'renewal_asc') {
          const dateA = a.isFreeTrial && a.cancellationDeadline ? a.cancellationDeadline : a.nextRenewalDate;
          const dateB = b.isFreeTrial && b.cancellationDeadline ? b.cancellationDeadline : b.nextRenewalDate;
          return new Date(dateA) - new Date(dateB);
        }
        if (sortBy === 'renewal_desc') {
          const dateA = a.isFreeTrial && a.cancellationDeadline ? a.cancellationDeadline : a.nextRenewalDate;
          const dateB = b.isFreeTrial && b.cancellationDeadline ? b.cancellationDeadline : b.nextRenewalDate;
          return new Date(dateB) - new Date(dateA);
        }
        if (sortBy === 'cost_desc') {
          return monthlyEquivalent(b) - monthlyEquivalent(a);
        }
        if (sortBy === 'cost_asc') {
          return monthlyEquivalent(a) - monthlyEquivalent(b);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name_desc') {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'created_desc') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [subscriptions, statusFilter, categoryFilter, cycleFilter, searchTerm, sortBy]);

  // Calculate monthly total of currently filtered active subscriptions
  const filteredMonthlySpend = useMemo(() => {
    return filteredSubscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + monthlyEquivalent(s), 0);
  }, [filteredSubscriptions]);

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    cycleFilter !== 'all' ||
    sortBy !== 'renewal_asc';

  function resetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setCycleFilter('all');
    setSortBy('renewal_asc');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Subscriptions</h1>
          <p className="mt-1 text-sm text-ink/60">
            Everything you're paying for or trialing, in one searchable ledger.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowReceiptParser(true)}
            className="flex items-center gap-2 rounded-sm border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
            title="Upload invoice, document, screenshot, or paste text to auto-create subscriptions with Gemini"
          >
            <svg className="h-4 w-4 text-ink/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Upload Receipt / AI Parse</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-sm bg-ledger px-4 py-2 text-sm font-medium text-white shadow-2xs hover:bg-ledger-dark transition-colors cursor-pointer"
          >
            + Add subscription
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      {showReceiptParser && (
        <ReceiptParserModal
          isOpen={showReceiptParser}
          onClose={() => setShowReceiptParser(false)}
          onParsed={() => refresh()}
        />
      )}

      {showForm && (
        <SubscriptionForm
          defaultCurrency={baseCurrency}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <SubscriptionForm
          defaultCurrency={baseCurrency}
          initial={{
            name: editing.name,
            category: editing.category,
            amount: editing.amount,
            currency: editing.currency,
            billingCycle: editing.billingCycle,
            nextRenewalDate: editing.nextRenewalDate?.slice(0, 10),
            status: editing.status,
            notes: editing.notes || '',
            reminderDaysBefore: editing.reminderDaysBefore || 3,
            isFreeTrial: Boolean(editing.isFreeTrial),
            trialEndDate: editing.trialEndDate ? String(editing.trialEndDate).slice(0, 10) : '',
            cancellationDeadline: editing.cancellationDeadline ? String(editing.cancellationDeadline).slice(0, 10) : '',
            postTrialAmount: editing.postTrialAmount,
            postTrialCurrency: editing.postTrialCurrency || editing.currency,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Filter & Search Bar */}
      <div className="space-y-3 rounded-t border border-line bg-white p-4 shadow-2xs">
        {/* Top Row: Search & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs including Free Trials */}
          <div className="inline-flex rounded-sm bg-paper p-0.5 text-xs font-medium border border-line">
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'active', label: 'Active Paid', count: counts.active },
              { id: 'trials', label: '🛡️ Trials', count: counts.trials },
              { id: 'paused', label: 'Paused', count: counts.paused },
              { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 rounded-xs px-3 py-1.5 transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-ink shadow-2xs font-semibold'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    statusFilter === tab.id
                      ? tab.id === 'trials'
                        ? 'bg-amber text-white'
                        : 'bg-ledger-light text-ledger-dark'
                      : 'bg-line/60 text-ink/50'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by name, category, notes…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-line bg-paper/40 px-3 py-1.5 pl-8 text-xs text-ink outline-none transition-all placeholder:text-ink/40 focus:border-ledger focus:bg-white focus:ring-1 focus:ring-ledger"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1.5 text-xs text-ink/40 hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Category, Cycle, Sort & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-sm border border-line bg-paper/30 px-2.5 py-1 text-ink outline-none hover:border-line focus:border-ledger cursor-pointer"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {formatCategoryLabel(c)}
                </option>
              ))}
            </select>

            {/* Cycle Filter */}
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="rounded-sm border border-line bg-paper/30 px-2.5 py-1 text-ink outline-none hover:border-line focus:border-ledger cursor-pointer"
            >
              <option value="all">All Cycles</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-ink/60">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-sm border border-line bg-paper/30 px-2.5 py-1 text-ink outline-none hover:border-line focus:border-ledger cursor-pointer"
              >
                <option value="renewal_asc">Next renewal / deadline (soonest)</option>
                <option value="renewal_desc">Next renewal / deadline (furthest)</option>
                <option value="cost_desc">Cost (highest/mo)</option>
                <option value="cost_asc">Cost (lowest/mo)</option>
                <option value="name_asc">Name (A → Z)</option>
                <option value="name_desc">Name (Z → A)</option>
              </select>
            </div>
          </div>

          {/* Quick Summary and Reset Button */}
          <div className="flex items-center gap-3">
            <span className="text-ink/60">
              Showing <strong className="text-ink">{filteredSubscriptions.length}</strong> of{' '}
              {subscriptions.length} (
              <span className="tabular font-medium text-ledger-dark">
                {formatMoney(filteredMonthlySpend, baseCurrency)}/mo
              </span>
              )
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="font-medium text-rust hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <div className="border border-t-0 border-line bg-white px-4">
        {filteredSubscriptions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-ink/70">No subscriptions found</p>
            <p className="mt-1 text-xs text-ink/40">
              {hasActiveFilters
                ? 'Try tweaking or resetting your search and filter criteria.'
                : 'Add your first subscription or free trial to get started.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 rounded-sm border border-line bg-paper px-3 py-1.5 text-xs text-ink hover:bg-line/40 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {filteredSubscriptions.map((s) => (
          <SubscriptionCard
            key={s.id}
            subscription={s}
            baseCurrency={baseCurrency}
            priceIncrease={priceIncreases.find((p) => p.subscriptionId === s.id)}
            onEdit={(sub) => {
              setShowForm(false);
              setEditing(sub);
            }}
            onConvertTrial={handleConvertTrial}
            onConfirmPayment={(sub) => setPayingSub(sub)}
            onCancelGuide={(sub) => setGuideSub(sub)}
            onViewPayments={(sub) => setHistorySub(sub)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Payment Confirmation Modal */}
      {payingSub && (
        <PaymentConfirmModal
          subscription={payingSub}
          onConfirm={handleConfirmPayment}
          onCancel={() => setPayingSub(null)}
        />
      )}

      {/* Cancellation Guide Modal */}
      {guideSub && (
        <CancellationGuideModal
          subscription={guideSub}
          onClose={() => setGuideSub(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Payment Receipts / History Modal */}
      {historySub && (
        <PaymentHistoryModal
          subscription={historySub}
          onClose={() => setHistorySub(null)}
        />
      )}
    </div>
  );
}
