import React, { useState } from 'react';
import { Application, JobRequisition, ApplicationStatus } from '../../types/recruitment';
import { ApplicationStatusForm } from './ApplicationStatusForm';

interface ApplicationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  onStatusUpdated?: (newStatus: ApplicationStatus | string) => void;
  onRejected?: () => Promise<void>;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({ open, onClose, application, onStatusUpdated, onRejected }) => {
  const [statusLoading, setStatusLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!open || !application) return null;

  // Fake timeline/history (expand this with real data if available)
  const statusHistory = [
    { date: application.createdAt?.slice(0, 10) || '-', status: application.status },
    // ...could push more if the API returns
  ];

  // If job info is nested in Application
  const job = typeof application.requisitionId === 'object'
    ? application.requisitionId as JobRequisition
    : undefined;

  // Handler for status update
  async function handleUpdateStatus(newStatus: ApplicationStatus | string) {
    if (!application || application.status === 'rejected' || application.status === 'hired') return; // Can't update
    setStatusLoading(true);
    setFeedback(null);
    try {
      await onStatusUpdated?.(newStatus);
      setFeedback('Status updated');
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleRejectApp() {
    setRejecting(true);
    setFeedback(null);
    try {
      await onRejected?.();
      setShowRejectModal(false);
      setFeedback('Application rejected');
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback('Failed to reject application');
    } finally {
      setRejecting(false);
    }
  }

  const isRejected = application.status === 'rejected';
  const isHired = application.status === 'hired';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
      <div className="bg-slate-900 w-full max-w-md h-screen shadow-xl p-6 relative flex flex-col">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-white" onClick={onClose}>
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2">Application Details</h2>
        <div className="space-y-4 flex-1 overflow-y-auto pb-8">
          <div>
            <h3 className="text-xs font-semibold uppercase text-blue-300/70 mb-1">Candidate Info</h3>
            <div className="bg-slate-800 rounded p-2 text-sm">
              <div><span className="text-slate-400">Candidate ID:</span> {application.candidateId}</div>
              {/* Add more candidate info if available from API */}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-blue-300/70 mb-1">Job Info</h3>
            <div className="bg-slate-800 rounded p-2 text-sm">
              {job ? (
                <>
                  <div><span className="text-slate-400">Requisition ID:</span> {job.requisitionId}</div>
                  <div><span className="text-slate-400">Location:</span> {job.location}</div>
                  <div><span className="text-slate-400">Openings:</span> {job.openings}</div>
                </>
              ) : (
                <div><span className="text-slate-400">Requisition:</span> {typeof application.requisitionId === 'string' ? application.requisitionId : '-'}</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-blue-300/70 mb-1">Current Status</h3>
            <div className="bg-slate-800 rounded p-2 flex gap-2 items-center">
              <span className="px-2 py-1 rounded bg-slate-700 text-xs font-semibold">{application.currentStage}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${application.status === 'rejected' ? 'bg-red-800/60 text-red-200' : application.status === 'hired' ? 'bg-green-800/60 text-green-200' : 'bg-slate-800/60 text-slate-400'}`}>{application.status}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase text-blue-300/70 mb-1">Update Status</h3>
            <ApplicationStatusForm
              currentStatus={application.status}
              onUpdateStatus={handleUpdateStatus}
              loading={statusLoading}
              disabled={isRejected || isHired}
            />
            {feedback && <div className="text-xs mt-1 text-green-400">{feedback}</div>}
            {(isRejected || isHired) && <div className="text-xs mt-1 text-slate-400">No further status changes allowed.</div>}
          </div>

          {!isRejected && !isHired && (
            <div>
              <button
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded mt-2 font-bold disabled:bg-gray-600"
                onClick={() => setShowRejectModal(true)}
                disabled={rejecting}
              >
                Reject Application
              </button>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase text-blue-300/70 mb-1">Status History</h3>
            <div className="space-y-2 pl-2 border-l border-blue-800">
              {statusHistory.map((h, idx) => (
                <div key={idx} className="flex items-center text-xs gap-2 text-slate-300">
                  <span>{h.date}</span> <span className="font-bold">→</span> <span>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reject confirmation modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60">
            <div className="bg-slate-900 text-white rounded shadow-lg p-8 max-w-sm">
              <h3 className="text-lg font-bold mb-3">Reject Application</h3>
              <p className="mb-4">Are you sure you want to reject this application? This cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejecting}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white font-bold disabled:bg-gray-600"
                  onClick={handleRejectApp}
                  disabled={rejecting}
                >
                  {rejecting ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
