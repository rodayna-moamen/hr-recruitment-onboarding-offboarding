import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import {
  Offer,
  OfferResponseStatus,
  OfferFinalStatus,
  ApprovalStatus,
  Application,
} from '../../../types/recruitment';

export default function Offers() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [offerApplications, setOfferApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [offerIdSearch, setOfferIdSearch] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    applicationId: '',
    candidateId: '',
    hrEmployeeId: '',
    grossSalary: '',
    signingBonus: '',
    benefits: [] as string[],
    conditions: '',
    insurances: '',
    content: '',
    role: '',
    deadline: '',
  });

  // Approve form state
  const [approveForm, setApproveForm] = useState({
    employeeId: '',
    role: '',
    status: ApprovalStatus.APPROVED,
    comment: '',
  });

  // Accept form state
  const [acceptForm, setAcceptForm] = useState({
    response: OfferResponseStatus.ACCEPTED,
  });

  useEffect(() => {
    fetchOffers();
    fetchApplications();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const res = await apiClient.get<Offer[]>('/offers');
        setOffers(Array.isArray(res.data) ? res.data : []);
        setOfferApplications([]);
      } catch (directFetchError: any) {
        const applicationsRes = await apiClient.get<Application[]>('/applications');
        const appsWithOffers = applicationsRes.data.filter(
          (app) => app.status === 'offer' || app.currentStage === 'offer'
        );
        setOfferApplications(appsWithOffers);
        setOffers([]);
      }
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err?.response?.data?.message || 'Could not load offers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get<Application[]>('/applications');
      setApplications(res.data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...createForm,
        grossSalary: parseFloat(createForm.grossSalary),
        signingBonus: createForm.signingBonus ? parseFloat(createForm.signingBonus) : undefined,
        benefits: createForm.benefits.filter((b) => b.trim()),
        deadline: new Date(createForm.deadline).toISOString(),
      };
      const res = await apiClient.post<Offer>('/offers', payload);
      setShowCreateForm(false);
      setCreateForm({
        applicationId: '',
        candidateId: '',
        hrEmployeeId: '',
        grossSalary: '',
        signingBonus: '',
        benefits: [],
        conditions: '',
        insurances: '',
        content: '',
        role: '',
        deadline: '',
      });
      // Optionally fetch the created offer
      if (res.data._id) {
        router.push(`/subsystems/recruitment/offers/${res.data._id}`);
      }
    } catch (err: any) {
      console.error('Error creating offer:', err);
      alert(err?.response?.data?.message || 'Failed to create offer.');
    }
  };

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    try {
      await apiClient.post(`/offers/${selectedOffer._id}/approve`, approveForm);
      setShowApproveForm(false);
      setSelectedOffer(null);
      fetchOffers();
    } catch (err: any) {
      console.error('Error approving offer:', err);
      alert(err?.response?.data?.message || 'Failed to approve offer.');
    }
  };

  const handleAccept = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;
    try {
      await apiClient.post(`/offers/${selectedOffer._id}/accept`, acceptForm);
      setShowAcceptForm(false);
      setSelectedOffer(null);
      fetchOffers();
    } catch (err: any) {
      console.error('Error responding to offer:', err);
      alert(err?.response?.data?.message || 'Failed to respond to offer.');
    }
  };

  const addBenefit = () => {
    setCreateForm({
      ...createForm,
      benefits: [...createForm.benefits, ''],
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...createForm.benefits];
    newBenefits[index] = value;
    setCreateForm({ ...createForm, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = createForm.benefits.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, benefits: newBenefits });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Offers</h1>
              <p className="text-lg text-slate-200/80">
                Create, approve, and manage job offers.
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

        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
        >
          + Create New Offer
        </button>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Create Offer</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Application ID *</span>
                    <select
                      value={createForm.applicationId}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, applicationId: e.target.value })
                      }
                      required
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    >
                      <option value="">-- Select application --</option>
                      {applications.map((app) => (
                        <option key={app._id} value={app._id}>
                          {app._id.slice(-8)} - {app.status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Candidate ID *</span>
                    <input
                      type="text"
                      value={createForm.candidateId}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, candidateId: e.target.value })
                      }
                      required
                      placeholder="MongoDB ObjectId"
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">HR Employee ID (optional)</span>
                  <input
                    type="text"
                    value={createForm.hrEmployeeId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, hrEmployeeId: e.target.value })
                    }
                    placeholder="MongoDB ObjectId"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Gross Salary *</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={createForm.grossSalary}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, grossSalary: e.target.value })
                      }
                      required
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Signing Bonus (optional)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={createForm.signingBonus}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, signingBonus: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-100">Benefits (optional)</span>
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add Benefit
                    </button>
                  </div>
                  {createForm.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        placeholder="Benefit description"
                        className="flex-1 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Conditions (optional)</span>
                  <textarea
                    value={createForm.conditions}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, conditions: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Insurances (optional)</span>
                  <input
                    type="text"
                    value={createForm.insurances}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, insurances: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Role *</span>
                  <input
                    type="text"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Offer Content *</span>
                  <textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Deadline *</span>
                  <input
                    type="datetime-local"
                    value={createForm.deadline}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, deadline: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    Create Offer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <div className="text-center text-slate-200/80">Loading offers...</div>}

        {/* Error State */}
        {error && !loading && <div className="text-center text-red-200">{error}</div>}

        {/* Offers List */}
        {!loading && !error && offers.length > 0 && (
          <div className="grid gap-4">
            {offers.map((offer) => (
              <Link
                key={offer._id}
                href={`/subsystems/recruitment/offers/${offer._id}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/60 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{offer.role}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          offer.applicantResponse === OfferResponseStatus.ACCEPTED
                            ? 'bg-green-500/20 border border-green-400/40 text-green-200'
                            : offer.applicantResponse === OfferResponseStatus.REJECTED
                              ? 'bg-red-500/20 border border-red-400/40 text-red-200'
                              : 'bg-yellow-500/20 border border-yellow-400/40 text-yellow-200'
                        }`}
                      >
                        {offer.applicantResponse}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          offer.finalStatus === OfferFinalStatus.APPROVED
                            ? 'bg-green-500/20 border border-green-400/40 text-green-200'
                            : offer.finalStatus === OfferFinalStatus.REJECTED
                              ? 'bg-red-500/20 border border-red-400/40 text-red-200'
                              : 'bg-yellow-500/20 border border-yellow-400/40 text-yellow-200'
                        }`}
                      >
                        {offer.finalStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200/80">
                      Salary: ${offer.grossSalary.toLocaleString()}
                      {offer.signingBonus && ` + $${offer.signingBonus.toLocaleString()} signing bonus`}
                    </p>
                    <p className="text-sm text-slate-200/80">
                      Deadline: {new Date(offer.deadline).toLocaleString()}
                    </p>
                    {offer.approvers && offer.approvers.length > 0 && (
                      <p className="text-sm text-slate-200/80">
                        Approvers: {offer.approvers.length} ({offer.approvers.filter((a) => a.status === ApprovalStatus.APPROVED).length} approved)
                      </p>
                    )}
                  </div>
                  <div className="text-blue-400 group-hover:text-blue-300">View →</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && offers.length === 0 && offerApplications.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-400/40 bg-blue-500/10 p-4">
              <p className="text-sm text-slate-200">
                Showing applications in offer stage. Click to view application details or create an offer.
              </p>
            </div>
            <div className="grid gap-4">
              {offerApplications.map((app) => (
                <div
                  key={app._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">Application {app._id.slice(-8)}</h3>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 border border-blue-400/40 text-blue-200">
                          {app.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 border border-purple-400/40 text-purple-200">
                          {app.currentStage}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200/80">
                        Candidate ID: {app.candidateId ? app.candidateId.slice(-8) : 'N/A'}
                      </p>
                      <p className="text-sm text-slate-200/80">
                        Created: {app.createdAt ? new Date(app.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/subsystems/recruitment/applications/${app._id}`}
                        className="px-3 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 border border-white/10 text-sm"
                      >
                        View Application
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && offers.length === 0 && offerApplications.length === 0 && (
          <div className="rounded-2xl border border-blue-400/40 bg-blue-500/10 p-6 text-center">
            <p className="text-slate-200 mb-2">No offers found.</p>
            <p className="text-sm text-slate-300/80">
              Create a new offer above or view an offer by ID using the search below.
            </p>
          </div>
        )}

        {/* Offer ID Search */}
        {!loading && !error && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold mb-4">View Offer by ID</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={offerIdSearch}
                onChange={(e) => setOfferIdSearch(e.target.value)}
                placeholder="Enter Offer ID (MongoDB ObjectId)"
                className="flex-1 rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (offerIdSearch.trim()) {
                    router.push(`/subsystems/recruitment/offers/${offerIdSearch.trim()}`);
                  }
                }}
                disabled={!offerIdSearch.trim()}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Offer
              </button>
            </div>
          </div>
        )}

        {/* Approve Form Modal */}
        {showApproveForm && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-semibold mb-4">Approve Offer</h2>
              <form onSubmit={handleApprove} className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Employee ID *</span>
                  <input
                    type="text"
                    value={approveForm.employeeId}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, employeeId: e.target.value })
                    }
                    required
                    placeholder="MongoDB ObjectId"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Role *</span>
                  <input
                    type="text"
                    value={approveForm.role}
                    onChange={(e) => setApproveForm({ ...approveForm, role: e.target.value })}
                    required
                    placeholder="e.g., HR Manager, Financial Approver"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Status *</span>
                  <select
                    value={approveForm.status}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, status: e.target.value as ApprovalStatus })
                    }
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value={ApprovalStatus.APPROVED}>Approved</option>
                    <option value={ApprovalStatus.REJECTED}>Rejected</option>
                    <option value={ApprovalStatus.PENDING}>Pending</option>
                  </select>
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Comment (optional)</span>
                  <textarea
                    value={approveForm.comment}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, comment: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    Submit Approval
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApproveForm(false);
                      setSelectedOffer(null);
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

        {/* Accept Form Modal */}
        {showAcceptForm && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-semibold mb-4">Respond to Offer</h2>
              <form onSubmit={handleAccept} className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Response *</span>
                  <select
                    value={acceptForm.response}
                    onChange={(e) =>
                      setAcceptForm({
                        ...acceptForm,
                        response: e.target.value as OfferResponseStatus,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value={OfferResponseStatus.ACCEPTED}>Accept</option>
                    <option value={OfferResponseStatus.REJECTED}>Reject</option>
                    <option value={OfferResponseStatus.PENDING}>Pending</option>
                  </select>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    Submit Response
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAcceptForm(false);
                      setSelectedOffer(null);
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
      </div>
    </div>
  );
}
