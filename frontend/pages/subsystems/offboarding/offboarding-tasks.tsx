import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getAllTerminationRequests,
  getClearanceChecklist,
  updateClearanceItem,
  updateEquipmentReturn,
  markCardReturned,
  type TerminationRequest,
  type ClearanceChecklist,
} from '../../../services/recruitment';

export default function OffboardingTasks() {
  const router = useRouter();
  const [terminations, setTerminations] = useState<TerminationRequest[]>([]);
  const [selectedTermination, setSelectedTermination] = useState<TerminationRequest | null>(null);
  const [clearanceChecklist, setClearanceChecklist] = useState<ClearanceChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTerminations();
  }, []);

  useEffect(() => {
    if (selectedTermination) {
      fetchClearanceChecklist(selectedTermination._id);
    }
  }, [selectedTermination]);

  const fetchTerminations = async () => {
    try {
      setLoading(true);
      const response = await getAllTerminationRequests();
      setTerminations(response.data.filter(t => t.status === 'approved'));
    } catch (err: any) {
      console.error('Error fetching terminations:', err);
      alert(err?.response?.data?.message || 'Failed to load terminations');
    } finally {
      setLoading(false);
    }
  };

  const fetchClearanceChecklist = async (terminationId: string) => {
    try {
      const response = await getClearanceChecklist(terminationId);
      setClearanceChecklist(response.data);
    } catch (err: any) {
      console.error('Error fetching clearance checklist:', err);
      setClearanceChecklist(null);
    }
  };

  const handleUpdateClearance = async (department: string, status: 'pending' | 'approved' | 'rejected', comments?: string) => {
    if (!selectedTermination) return;

    try {
      setActionLoading(`clearance-${department}`);
      await updateClearanceItem(selectedTermination._id, department, {
        department,
        status,
        comments,
      });
      await fetchClearanceChecklist(selectedTermination._id);
      alert('Clearance status updated!');
    } catch (err: any) {
      console.error('Error updating clearance:', err);
      alert(err?.response?.data?.message || 'Failed to update clearance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCardReturned = async () => {
    if (!selectedTermination) return;

    try {
      setActionLoading('card-returned');
      await markCardReturned(selectedTermination._id);
      await fetchClearanceChecklist(selectedTermination._id);
      alert('Access card marked as returned!');
    } catch (err: any) {
      console.error('Error marking card returned:', err);
      alert(err?.response?.data?.message || 'Failed to mark card returned');
    } finally {
      setActionLoading(null);
    }
  };

  const getClearanceStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading offboarding tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Offboarding</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Offboarding Tasks</h1>
              <p className="text-lg text-slate-200/80">
                Manage clearance checklists and offboarding tasks for terminated employees
              </p>
            </div>
            <Link
              href="/subsystems/offboarding"
              className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
            >
              ← Back
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminations List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Approved Terminations</h2>
              {terminations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-300">No approved terminations found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {terminations.map((termination) => (
                    <div
                      key={termination._id}
                      onClick={() => setSelectedTermination(termination)}
                      className={`rounded-lg p-4 border cursor-pointer transition-all ${
                        selectedTermination?._id === termination._id
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-sm">Employee ID: {termination.employeeId}</p>
                          <p className="text-xs text-slate-300/80">
                            {termination.initiator === 'employee' ? 'Resignation' : 'Termination'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
                        {termination.createdAt
                          ? new Date(termination.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clearance Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTermination ? (
              clearanceChecklist ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                  <h3 className="text-xl font-semibold pb-4 border-b border-white/10">
                    Clearance Checklist - Employee {selectedTermination.employeeId}
                  </h3>

                  {/* Department Clearances */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-4">Department Sign-offs</h4>
                    {clearanceChecklist.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${getClearanceStatusColor(item.status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.department}</span>
                          <span className="text-xs px-2 py-1 rounded">
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        {item.comments && (
                          <p className="text-sm text-slate-300/80 mt-1">{item.comments}</p>
                        )}
                        {item.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleUpdateClearance(item.department, 'approved')}
                              disabled={actionLoading === `clearance-${item.department}`}
                              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateClearance(item.department, 'rejected')}
                              disabled={actionLoading === `clearance-${item.department}`}
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Equipment Return */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-lg mb-4">Equipment Return</h4>
                    {clearanceChecklist.equipmentList.length === 0 ? (
                      <p className="text-sm text-slate-300/60">No equipment tracked</p>
                    ) : (
                      <div className="space-y-2">
                        {clearanceChecklist.equipmentList.map((equipment: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded border ${
                              equipment.returned
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-yellow-500/10 border-yellow-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{equipment.name || equipment.equipmentId}</span>
                              <span className="text-xs">
                                {equipment.returned ? 'Returned' : 'Pending'}
                              </span>
                            </div>
                            {equipment.condition && (
                              <p className="text-xs text-slate-300/60 mt-1">
                                Condition: {equipment.condition}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Access Card */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-lg mb-4">Access Card</h4>
                    <div className="flex items-center justify-between">
                      <span
                        className={clearanceChecklist.cardReturned ? 'text-green-300' : 'text-yellow-300'}
                      >
                        {clearanceChecklist.cardReturned ? 'Returned' : 'Not Returned'}
                      </span>
                      {!clearanceChecklist.cardReturned && (
                        <button
                          onClick={handleMarkCardReturned}
                          disabled={actionLoading === 'card-returned'}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          {actionLoading === 'card-returned' ? 'Updating...' : 'Mark as Returned'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-slate-300">Clearance checklist not available for this termination.</p>
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-slate-300 text-lg">Select a termination to view offboarding tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

