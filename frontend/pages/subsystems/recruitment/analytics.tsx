import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import {
  AnalyticsData,
  ApplicationStatus,
  JobRequisition,
} from '../../../types/recruitment';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    requisitionId: '',
    status: '' as ApplicationStatus | '',
  });

  useEffect(() => {
    fetchRequisitions();
    fetchAnalytics();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await apiClient.get<JobRequisition[]>('/jobs');
      setRequisitions(res.data);
    } catch (err: any) {
      console.error('Error fetching requisitions:', err);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.startDate) {
        params.startDate = new Date(filters.startDate).toISOString();
      }
      if (filters.endDate) {
        params.endDate = new Date(filters.endDate).toISOString();
      }
      if (filters.requisitionId) {
        params.requisitionId = filters.requisitionId;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const queryString = new URLSearchParams(params).toString();
      const res = await apiClient.get<AnalyticsData>(
        `/analytics/recruitment${queryString ? `?${queryString}` : ''}`,
      );
      setAnalytics(res.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err?.response?.data?.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      requisitionId: '',
      status: '',
    });
    setTimeout(() => {
      fetchAnalytics();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Analytics</h1>
            </div>
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
            >
              ← Back
            </Link>
          </div>
          <p className="text-lg text-slate-200/80">
            View recruitment metrics, conversion rates, and time-to-hire statistics.
          </p>
        </header>

        {/* Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-slate-100">Start Date</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-100">End Date</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-100">Requisition</span>
              <select
                value={filters.requisitionId}
                onChange={(e) => setFilters({ ...filters, requisitionId: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white"
              >
                <option value="">All Requisitions</option>
                {requisitions.map((req) => (
                  <option key={req._id} value={req._id}>
                    {req.requisitionId}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-100">Status</span>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as ApplicationStatus | '' })
                }
                className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white"
              >
                <option value="">All Statuses</option>
                <option value={ApplicationStatus.SUBMITTED}>Submitted</option>
                <option value={ApplicationStatus.IN_PROCESS}>In Process</option>
                <option value={ApplicationStatus.OFFER}>Offer</option>
                <option value={ApplicationStatus.HIRED}>Hired</option>
                <option value={ApplicationStatus.REJECTED}>Rejected</option>
              </select>
            </label>
          </form>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleFilterSubmit}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-semibold text-white"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && <div className="text-center text-slate-200/80">Loading analytics...</div>}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center text-red-200 rounded-2xl border border-red-400/40 bg-red-500/10 p-6">
            {error}
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && analytics && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-2">
                  Total Applications
                </h3>
                <p className="text-3xl font-bold">{analytics.totalApplications}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-2">
                  Average Time to Hire
                </h3>
                <p className="text-3xl font-bold">
                  {analytics.averageTimeToHire != null 
                    ? analytics.averageTimeToHire.toFixed(1) 
                    : '0.0'} days
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-2">
                  Total Referrals
                </h3>
                <p className="text-3xl font-bold">{analytics.referralStats.totalReferrals}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 mb-2">
                  Referral Percentage
                </h3>
                <p className="text-3xl font-bold">
                  {analytics.referralStats?.referralPercentage != null 
                    ? analytics.referralStats.referralPercentage.toFixed(1) 
                    : '0.0'}%
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Status */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold mb-4">Applications by Status</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.byStatus).map(([status, count]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 capitalize">{status.replace('_', ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${
                              analytics.totalApplications > 0
                                ? (count / analytics.totalApplications) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Stage */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold mb-4">Applications by Stage</h2>
                <div className="space-y-3">
                  {Object.entries(analytics.byStage).map(([stage, count]) => (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 capitalize">
                          {stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${
                              analytics.totalApplications > 0
                                ? (count / analytics.totalApplications) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversion Rates */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-4">Conversion Rates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400">
                    Screening → Interview
                  </h3>
                  <p className="text-2xl font-bold">
                    {analytics.conversionRates.screeningToInterview.toFixed(1)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400">
                    Interview → Offer
                  </h3>
                  <p className="text-2xl font-bold">
                    {analytics.conversionRates.interviewToOffer.toFixed(1)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400">
                    Offer → Hired
                  </h3>
                  <p className="text-2xl font-bold">
                    {analytics.conversionRates.offerToHired.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
