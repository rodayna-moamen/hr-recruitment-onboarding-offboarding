import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import { Referral } from '../../../types/recruitment';

export default function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [candidateIdFilter, setCandidateIdFilter] = useState('');

  const [formData, setFormData] = useState({
    referringEmployeeId: '',
    candidateId: '',
    role: '',
    level: '',
  });

  const fetchReferrals = async (candidateId?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (candidateId && candidateId.trim()) {
        const res = await apiClient.get<Referral[]>(`/referrals?candidateId=${candidateId.trim()}`);
        setReferrals(Array.isArray(res.data) ? res.data : []);
      } else {
        // Fetch all referrals by default
        const res = await apiClient.get<Referral[]>(`/referrals`);
        setReferrals(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err: any) {
      console.error('Error fetching referrals:', err);
      setError(err?.response?.data?.message || 'Could not load referrals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all referrals on component mount
    fetchReferrals();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        referringEmployeeId: formData.referringEmployeeId.trim(),
        candidateId: formData.candidateId.trim(),
        ...(formData.role.trim() && { role: formData.role.trim() }),
        ...(formData.level.trim() && { level: formData.level.trim() }),
      };

      await apiClient.post('/referrals', payload);
      setShowCreateForm(false);
      setFormData({
        referringEmployeeId: '',
        candidateId: '',
        role: '',
        level: '',
      });
      fetchReferrals(candidateIdFilter || undefined);
    } catch (err: any) {
      console.error('Error creating referral:', err);
      alert(err?.response?.data?.message || 'Failed to create referral.');
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchReferrals(candidateIdFilter.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Referrals</h1>
              <p className="text-lg text-slate-200/80">
                Tag candidates as referrals for priority screening and tracking.
              </p>
            </div>
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
            >
              ← Back
            </Link>
          </div>
        </header>

        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
          >
            + Create Referral
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Filter Referrals by Candidate</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={candidateIdFilter}
              onChange={(e) => setCandidateIdFilter(e.target.value)}
              placeholder="Enter Candidate ID to filter (leave empty to show all)"
              className="flex-1 rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-semibold text-white"
            >
              Filter
            </button>
            {candidateIdFilter && (
              <button
                type="button"
                onClick={() => {
                  setCandidateIdFilter('');
                  fetchReferrals();
                }}
                className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
              >
                Show All
              </button>
            )}
          </form>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-semibold mb-4">Create Referral</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Referring Employee ID *</span>
                  <input
                    type="text"
                    value={formData.referringEmployeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, referringEmployeeId: e.target.value })
                    }
                    required
                    placeholder="MongoDB ObjectId"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Candidate ID *</span>
                  <input
                    type="text"
                    value={formData.candidateId}
                    onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                    required
                    placeholder="MongoDB ObjectId"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Role (optional)</span>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Level (optional)</span>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g., Senior, Mid-level"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    Create Referral
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({
                        referringEmployeeId: '',
                        candidateId: '',
                        role: '',
                        level: '',
                      });
                    }}
                    className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <div className="text-center text-slate-200/80">Loading referrals...</div>}

        {error && !loading && (
          <div className="text-center text-red-200 rounded-2xl border border-red-400/40 bg-red-500/10 p-6">
            {error}
          </div>
        )}

        {!loading && !error && referrals.length === 0 && (
          <div className="rounded-2xl border border-blue-400/40 bg-blue-500/10 p-6 text-center">
            <p className="text-slate-200">
              {candidateIdFilter 
                ? 'No referrals found for this candidate.' 
                : 'No referrals found. Create a new referral to get started.'}
            </p>
          </div>
        )}

        {!loading && !error && referrals.length > 0 && (
          <div className="grid gap-4">
            {referrals.map((referral) => (
              <div
                key={referral._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Referral {referral._id.slice(-8)}</h3>
                  </div>
                  <p className="text-sm text-slate-200/80">
                    Referring Employee: {referral.referringEmployeeId.slice(-8)}
                  </p>
                  <p className="text-sm text-slate-200/80">
                    Candidate: {referral.candidateId.slice(-8)}
                  </p>
                  {referral.role && (
                    <p className="text-sm text-slate-200/80">Role: {referral.role}</p>
                  )}
                  {referral.level && (
                    <p className="text-sm text-slate-200/80">Level: {referral.level}</p>
                  )}
                  {referral.createdAt && (
                    <p className="text-xs text-slate-400">
                      Created: {new Date(referral.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

