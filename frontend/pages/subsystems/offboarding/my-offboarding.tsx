import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getResignationRequestsByEmployee,
  getClearanceChecklist,
  type TerminationRequest,
  type ClearanceChecklist,
} from '../../../services/recruitment';

export default function MyOffboarding() {
  const router = useRouter();
  const [resignation, setResignation] = useState<TerminationRequest | null>(null);
  const [clearanceChecklist, setClearanceChecklist] = useState<ClearanceChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employeeId = localStorage.getItem('employeeId') || localStorage.getItem('userId');
    if (!employeeId) {
      router.push('/login');
      return;
    }

    fetchResignation(employeeId);
  }, []);

  useEffect(() => {
    if (resignation && resignation.status === 'approved') {
      fetchClearanceChecklist(resignation._id);
    }
  }, [resignation]);

  const fetchResignation = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await getResignationRequestsByEmployee(employeeId);
      // Get the most recent approved resignation
      const approved = response.data.find(r => r.status === 'approved');
      if (approved) {
        setResignation(approved);
      } else {
        setResignation(response.data[0] || null);
      }
    } catch (err: any) {
      console.error('Error fetching resignation:', err);
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
            <h1 className="text-4xl font-semibold">My Offboarding Tasks</h1>
            <p className="text-slate-200/80 mt-2">
              Track your resignation request and offboarding clearance status
            </p>
          </div>
          <Link
            href="/subsystems/offboarding"
            className="text-blue-300 hover:text-blue-200 underline text-sm"
          >
            ← Back
          </Link>
        </div>

        {resignation ? (
          <>
            {/* Resignation Status */}
            <div className={`bg-white/5 rounded-lg p-6 border ${getStatusColor(resignation.status)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Resignation Request</h3>
                  <p className="text-sm text-slate-300/80 mb-2">
                    <strong>Reason:</strong> {resignation.reason}
                  </p>
                  {resignation.employeeComments && (
                    <p className="text-sm text-slate-300/80 mb-2">
                      <strong>Your Comments:</strong> {resignation.employeeComments}
                    </p>
                  )}
                  {resignation.hrComments && (
                    <p className="text-sm text-blue-300/80 mb-2">
                      <strong>HR Comments:</strong> {resignation.hrComments}
                    </p>
                  )}
                  {resignation.terminationDate && (
                    <p className="text-sm text-slate-300/80 mb-2">
                      <strong>Termination Date:</strong>{' '}
                      {new Date(resignation.terminationDate).toLocaleDateString()}
                    </p>
                  )}
                  {resignation.createdAt && (
                    <p className="text-xs text-slate-400">
                      Submitted: {new Date(resignation.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(resignation.status)}`}
                >
                  {resignation.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Clearance Checklist */}
            {resignation.status === 'approved' && clearanceChecklist ? (
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-6">
                <h3 className="text-xl font-semibold pb-4 border-b border-white/10">
                  Clearance Checklist
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Access Card */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-semibold text-lg mb-4">Access Card</h4>
                  <p className={clearanceChecklist.cardReturned ? 'text-green-300' : 'text-yellow-300'}>
                    {clearanceChecklist.cardReturned ? 'Returned' : 'Not Returned'}
                  </p>
                </div>
              </div>
            ) : resignation.status === 'approved' ? (
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="text-slate-300">Clearance checklist will be available once your resignation is processed.</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <p className="text-slate-300">No resignation request found.</p>
            <Link
              href="/subsystems/offboarding/resignation"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
            >
              Submit Resignation Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

