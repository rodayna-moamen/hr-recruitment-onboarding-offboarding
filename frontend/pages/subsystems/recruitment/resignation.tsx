import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  createResignationRequest,
  getResignationRequestsByEmployee,
  type TerminationRequest,
  type CreateResignationRequestData,
} from '../../../services/recruitment';

export default function ResignationRequest() {
  const router = useRouter();
  const [requests, setRequests] = useState<TerminationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateResignationRequestData>({
    employeeId: '',
    reason: '',
    employeeComments: '',
    terminationDate: '',
    contractId: '',
  });

  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId') || localStorage.getItem('userId');
    if (!employeeId) {
      router.push('/login');
      return;
    }

    formData.employeeId = employeeId;
    fetchResignationRequests(employeeId);
  }, []);

  const fetchResignationRequests = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await getResignationRequestsByEmployee(employeeId);
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching resignation requests:', err);
      alert(err?.response?.data?.message || 'Failed to load resignation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert('Please provide a reason for resignation');
      return;
    }

    try {
      setSubmitting(true);
      await createResignationRequest(formData);
      alert('Resignation request submitted successfully!');
      setShowForm(false);
      setFormData({
        employeeId: formData.employeeId,
        reason: '',
        employeeComments: '',
        terminationDate: '',
        contractId: '',
      });
      await fetchResignationRequests(formData.employeeId);
    } catch (err: any) {
      console.error('Error submitting resignation:', err);
      alert(err?.response?.data?.message || 'Failed to submit resignation request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'under_review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Resignation Requests</h1>
            <p className="text-slate-200/80 mt-2">
              Submit a resignation request or track your existing requests
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm"
            >
              ← Back
            </Link>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
              >
                + New Request
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Submit Resignation Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Resignation *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                  rows={4}
                  required
                  placeholder="Please provide a reason for your resignation..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Additional Comments</label>
                <textarea
                  value={formData.employeeComments}
                  onChange={(e) => setFormData({ ...formData, employeeComments: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                  rows={3}
                  placeholder="Any additional comments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Proposed Termination Date</label>
                <input
                  type="date"
                  value={formData.terminationDate}
                  onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">My Resignation Requests</h2>
          {requests.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
              <p className="text-slate-300">No resignation requests found.</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
                >
                  Submit Your First Request
                </button>
              )}
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className={`bg-white/5 rounded-lg p-6 border ${getStatusColor(request.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Resignation Request</h3>
                    <p className="text-sm text-slate-300/80 mb-2">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    {request.employeeComments && (
                      <p className="text-sm text-slate-300/80 mb-2">
                        <strong>Comments:</strong> {request.employeeComments}
                      </p>
                    )}
                    {request.hrComments && (
                      <p className="text-sm text-blue-300/80 mb-2">
                        <strong>HR Comments:</strong> {request.hrComments}
                      </p>
                    )}
                    {request.terminationDate && (
                      <p className="text-sm text-slate-300/80 mb-2">
                        <strong>Termination Date:</strong>{' '}
                        {new Date(request.terminationDate).toLocaleDateString()}
                      </p>
                    )}
                    {request.createdAt && (
                      <p className="text-xs text-slate-400">
                        Submitted: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                  >
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

