import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getAllTerminationRequests,
  getTerminationRequest,
  approveTermination,
  getClearanceChecklist,
  updateClearanceItem,
  updateEquipmentReturn,
  markCardReturned,
  getEmployeePerformanceData,
  getEmployeeLeaveBalance,
  revokeSystemAccess,
  type TerminationRequest,
  type ClearanceChecklist,
} from '../../../services/recruitment';

export default function TerminationsManagement() {
  const router = useRouter();
  const [terminations, setTerminations] = useState<TerminationRequest[]>([]);
  const [selectedTermination, setSelectedTermination] = useState<TerminationRequest | null>(null);
  const [clearanceChecklist, setClearanceChecklist] = useState<ClearanceChecklist | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showInitiateForm, setShowInitiateForm] = useState(false);
  const [initiateData, setInitiateData] = useState({
    employeeId: '',
    reason: '',
    hrComments: '',
  });

  useEffect(() => {
    fetchTerminations();
  }, []);

  useEffect(() => {
    if (selectedTermination) {
      fetchTerminationDetails(selectedTermination._id);
    }
  }, [selectedTermination]);

  const fetchTerminations = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token) {
        alert('Please log in to access this page');
        router.push('/login');
        return;
      }

      console.log('Current user role:', role);
      
      const response = await getAllTerminationRequests();
      setTerminations(response.data);
    } catch (err: any) {
      console.error('Error fetching terminations:', err);
      
      if (err?.response?.status === 403) {
        const errorMessage = err?.response?.data?.message || 'Access denied. You need HR Manager or HR Employee role to view terminations.';
        alert(errorMessage);
        console.error('403 Forbidden - User role:', localStorage.getItem('role'));
      } else if (err?.code === 'ERR_NETWORK' || err?.code === 'ERR_CONNECTION_REFUSED') {
        alert('Cannot connect to server. Please ensure the backend is running on port 4000.');
      } else {
        alert(err?.response?.data?.message || 'Failed to load terminations');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminationDetails = async (terminationId: string) => {
    try {
      // Fetch termination details
      const termResponse = await getTerminationRequest(terminationId);
      setSelectedTermination(termResponse.data);

      // Fetch clearance checklist
      try {
        const checklistResponse = await getClearanceChecklist(terminationId);
        setClearanceChecklist(checklistResponse.data);
      } catch (err) {
        // Checklist might not exist yet
        setClearanceChecklist(null);
      }

      // Fetch performance data
      try {
        const perfResponse = await getEmployeePerformanceData(termResponse.data.employeeId);
        setPerformanceData(perfResponse.data);
      } catch (err) {
        console.warn('Could not fetch performance data:', err);
      }

      // Fetch leave balance
      try {
        const leaveResponse = await getEmployeeLeaveBalance(termResponse.data.employeeId);
        setLeaveBalance(leaveResponse.data);
      } catch (err) {
        console.warn('Could not fetch leave balance:', err);
      }
    } catch (err: any) {
      console.error('Error fetching termination details:', err);
      alert(err?.response?.data?.message || 'Failed to load termination details');
    }
  };

  const handleApprove = async (terminationId: string) => {
    if (!confirm('Are you sure you want to approve this termination? This will trigger offboarding and payroll processing.')) {
      return;
    }

    try {
      setActionLoading(`approve-${terminationId}`);
      await approveTermination(terminationId);
      alert('Termination approved successfully!');
      await fetchTerminations();
      if (selectedTermination?._id === terminationId) {
        await fetchTerminationDetails(terminationId);
      }
    } catch (err: any) {
      console.error('Error approving termination:', err);
      alert(err?.response?.data?.message || 'Failed to approve termination');
    } finally {
      setActionLoading(null);
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
      await fetchTerminationDetails(selectedTermination._id);
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
      await fetchTerminationDetails(selectedTermination._id);
      alert('Access card marked as returned!');
    } catch (err: any) {
      console.error('Error marking card returned:', err);
      alert(err?.response?.data?.message || 'Failed to mark card returned');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAccess = async () => {
    if (!selectedTermination) return;

    if (!confirm('Are you sure you want to revoke system access for this employee? This will disable their account and revoke all system access.')) {
      return;
    }

    try {
      setActionLoading('revoke-access');
      await revokeSystemAccess(selectedTermination.employeeId);
      alert('System access revoked successfully!');
    } catch (err: any) {
      console.error('Error revoking access:', err);
      alert(err?.response?.data?.message || 'Failed to revoke system access');
    } finally {
      setActionLoading(null);
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
          <p className="text-lg">Loading terminations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Offboarding</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Termination Management</h1>
              <p className="text-lg text-slate-200/80">
                Review, approve, and manage employee terminations and offboarding
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
              <h2 className="text-xl font-semibold">All Terminations</h2>
              {terminations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-300">No termination requests found.</p>
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
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(termination.status)}`}
                        >
                          {termination.status.replace('_', ' ').toUpperCase()}
                        </span>
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

          {/* Termination Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTermination ? (
              <>
                {/* Termination Details */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                  <div className="flex items-start justify-between pb-4 border-b border-white/10">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Termination Details</h2>
                      <p className="text-sm text-slate-300/80">
                        Employee ID: {selectedTermination.employeeId}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {selectedTermination.status === 'under_review' && (
                        <button
                          onClick={() => handleApprove(selectedTermination._id)}
                          disabled={actionLoading === `approve-${selectedTermination._id}`}
                          className="px-5 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg transition disabled:opacity-50 font-medium"
                        >
                          {actionLoading === `approve-${selectedTermination._id}` ? 'Approving...' : 'Approve Termination'}
                        </button>
                      )}
                      {selectedTermination.status === 'approved' && (
                        <button
                          onClick={handleRevokeAccess}
                          disabled={actionLoading === 'revoke-access'}
                          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-50 font-medium"
                        >
                          {actionLoading === 'revoke-access' ? 'Revoking...' : 'Revoke System Access'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Reason</p>
                      <p className="text-white text-base">{selectedTermination.reason}</p>
                    </div>
                    {selectedTermination.employeeComments && (
                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Employee Comments</p>
                        <p className="text-white text-base">{selectedTermination.employeeComments}</p>
                      </div>
                    )}
                    {selectedTermination.hrComments && (
                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">HR Comments</p>
                        <p className="text-white text-base">{selectedTermination.hrComments}</p>
                      </div>
                    )}
                    {selectedTermination.terminationDate && (
                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Termination Date</p>
                        <p className="text-white text-base">
                          {new Date(selectedTermination.terminationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Data */}
                {performanceData && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                    <h3 className="text-xl font-semibold pb-4 border-b border-white/10">Performance Data</h3>
                    <div className="space-y-3">
                      <p>
                        <strong>Total Appraisals:</strong> {performanceData.totalAppraisals}
                      </p>
                      <p>
                        <strong>Low Performance Count:</strong>{' '}
                        <span className={performanceData.lowPerformanceCount > 0 ? 'text-red-300' : 'text-green-300'}>
                          {performanceData.lowPerformanceCount}
                        </span>
                      </p>
                      {performanceData.lowPerformanceAppraisals?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Low Performance Appraisals:</p>
                          <div className="space-y-2">
                            {performanceData.lowPerformanceAppraisals.map((appraisal: any, idx: number) => (
                              <div key={idx} className="bg-red-500/10 rounded p-3 border border-red-500/30">
                                <p className="text-sm">
                                  Score: {appraisal.totalScore || 'N/A'} | Rating:{' '}
                                  {appraisal.overallRatingLabel || 'N/A'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Leave Balance */}
                {leaveBalance && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                    <h3 className="text-xl font-semibold pb-4 border-b border-white/10">Leave Balance</h3>
                    <div className="space-y-3">
                      <p>
                        <strong>Total Remaining Days:</strong> {leaveBalance.totalRemaining || 0}
                      </p>
                      <p>
                        <strong>Total Accrued Days:</strong> {leaveBalance.totalAccruedDays || 0}
                      </p>
                    </div>
                  </div>
                )}

                {/* Clearance Checklist */}
                {clearanceChecklist ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
                    <h3 className="text-xl font-semibold pb-4 border-b border-white/10">Clearance Checklist</h3>

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
                    <p className="text-slate-300">Clearance checklist will be created when termination is approved.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-slate-300 text-lg">Select a termination request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

