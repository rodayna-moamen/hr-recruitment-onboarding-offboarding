import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../../lib/apiClient';
import {
  Offer,
  OfferResponseStatus,
  OfferFinalStatus,
  ApprovalStatus,
} from '../../../../types/recruitment';

export default function OfferDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);

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
    if (id && typeof id === 'string') {
      fetchOffer(id);
    }
  }, [id]);

  const fetchOffer = async (offerId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching offer with ID:', offerId);
      const res = await apiClient.get<Offer>(`/offers/${offerId}`);
      console.log('Offer fetched successfully:', res.data);
      setOffer(res.data);
    } catch (err: any) {
      console.error('Error fetching offer:', err);
      console.error('Error response:', err?.response);
      console.error('Error status:', err?.response?.status);
      console.error('Error URL:', err?.config?.url);
      setError(err?.response?.data?.message || err?.message || `Could not load offer details. Status: ${err?.response?.status || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    try {
      await apiClient.post(`/offers/${offer._id}/approve`, approveForm);
      setShowApproveForm(false);
      fetchOffer(offer._id);
    } catch (err: any) {
      console.error('Error approving offer:', err);
      alert(err?.response?.data?.message || 'Failed to approve offer.');
    }
  };

  const handleAccept = async (e: FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    try {
      await apiClient.post(`/offers/${offer._id}/accept`, acceptForm);
      setShowAcceptForm(false);
      fetchOffer(offer._id);
    } catch (err: any) {
      console.error('Error responding to offer:', err);
      alert(err?.response?.data?.message || 'Failed to respond to offer.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12 flex items-center justify-center">
        <div className="text-center text-slate-200/80">Loading offer details...</div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/subsystems/recruitment/offers"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Offers
          </Link>
          <div className="text-center text-red-200">{error || 'Offer not found'}</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === OfferResponseStatus.ACCEPTED || status === OfferFinalStatus.APPROVED) {
      return 'bg-green-500/20 border-green-400/40 text-green-200';
    }
    if (status === OfferResponseStatus.REJECTED || status === OfferFinalStatus.REJECTED) {
      return 'bg-red-500/20 border-red-400/40 text-red-200';
    }
    return 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/subsystems/recruitment/offers"
          className="text-blue-400 hover:text-blue-300 inline-block"
        >
          ← Back to Offers
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <header className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-semibold">Offer Details</h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(offer.finalStatus)}`}
                    title="HR/Manager Approval Status"
                  >
                    HR: {offer.finalStatus === 'pending' ? 'Pending Approval' : offer.finalStatus}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(offer.applicantResponse)}`}
                    title="Candidate Response Status"
                  >
                    Candidate: {offer.applicantResponse === 'pending' ? 'Pending Response' : offer.applicantResponse}
                  </span>
                </div>
              </div>
              <Link
                href="/subsystems/recruitment/offers"
                className="text-blue-300 hover:text-blue-200 underline text-sm"
              >
                ← Back
              </Link>
            </div>
          </header>

          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Role</h3>
              <p className="text-lg">{offer.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Gross Salary</h3>
                <p className="text-lg">${offer.grossSalary.toLocaleString()}</p>
              </div>

              {offer.signingBonus && (
                <div className="space-y-2">
                  <h3 className="text-sm uppercase tracking-wider text-slate-400">Signing Bonus</h3>
                  <p className="text-lg">${offer.signingBonus.toLocaleString()}</p>
                </div>
              )}
            </div>

            {offer.benefits && offer.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Benefits</h3>
                <ul className="space-y-1">
                  {offer.benefits.map((benefit, index) => (
                    <li key={index} className="text-slate-200">
                      • {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {offer.conditions && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Conditions</h3>
                <p className="text-slate-200">{offer.conditions}</p>
              </div>
            )}

            {offer.insurances && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Insurances</h3>
                <p className="text-slate-200">{offer.insurances}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Offer Content</h3>
              <div className="rounded-lg border border-white/10 bg-slate-900/60 p-4">
                <p className="text-slate-200 whitespace-pre-wrap">{offer.content}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Deadline</h3>
              <p className="text-lg">{new Date(offer.deadline).toLocaleString()}</p>
            </div>

            {offer.approvers && offer.approvers.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Approvers</h3>
                <div className="space-y-3">
                  {offer.approvers.map((approver, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-white/10 bg-slate-900/60 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{approver.role}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(approver.status)}`}
                        >
                          {approver.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">Employee ID: {approver.employeeId}</p>
                      {approver.comment && (
                        <p className="text-sm text-slate-200 mt-2">{approver.comment}</p>
                      )}
                      {approver.actionDate && (
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(approver.actionDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Application ID</h3>
                <p className="text-slate-200 font-mono text-sm">
                  {typeof offer.applicationId === 'object' 
                    ? (offer.applicationId as any)?._id || String(offer.applicationId)
                    : offer.applicationId}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Candidate ID</h3>
                <p className="text-slate-200 font-mono text-sm">
                  {typeof offer.candidateId === 'object' 
                    ? (offer.candidateId as any)?._id || (offer.candidateId as any)?.candidateNumber || String(offer.candidateId)
                    : offer.candidateId || 'N/A'}
                </p>
              </div>
            </div>

            {offer.candidateSignedAt && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Candidate Signed At</h3>
                <p className="text-slate-200">{new Date(offer.candidateSignedAt).toLocaleString()}</p>
              </div>
            )}

            {offer.hrSignedAt && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">HR Signed At</h3>
                <p className="text-slate-200">{new Date(offer.hrSignedAt).toLocaleString()}</p>
              </div>
            )}

            {offer.managerSignedAt && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Manager Signed At</h3>
                <p className="text-slate-200">{new Date(offer.managerSignedAt).toLocaleString()}</p>
              </div>
            )}

            {offer.createdAt && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Created At</h3>
                <p className="text-slate-200">{new Date(offer.createdAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => {
                setApproveForm({
                  employeeId: '',
                  role: '',
                  status: ApprovalStatus.APPROVED,
                  comment: '',
                });
                setShowApproveForm(true);
              }}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-semibold text-white"
              title="For HR/Managers: Approve or reject the offer before sending to candidate"
            >
              HR Approval
            </button>
            <button
              onClick={() => {
                setAcceptForm({ response: OfferResponseStatus.ACCEPTED });
                setShowAcceptForm(true);
              }}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition font-semibold text-white"
              title="For Candidate: Accept or reject the offer"
            >
              Candidate Response
            </button>
          </div>
        </div>

        {/* Approve Form Modal */}
        {showApproveForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-semibold mb-2">HR/Manager Approval</h2>
              <p className="text-sm text-slate-400 mb-4">Approve or reject this offer before sending to candidate</p>
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
                    onClick={() => setShowApproveForm(false)}
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
        {showAcceptForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-semibold mb-2">Candidate Response</h2>
              <p className="text-sm text-slate-400 mb-4">Accept or reject this job offer</p>
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
                    onClick={() => setShowAcceptForm(false)}
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

