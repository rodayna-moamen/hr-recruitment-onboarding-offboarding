import React, { useState } from 'react';
import { Application, JobRequisition, ApplicationStatus } from '../../types/recruitment';
import { ApplicationStatusForm } from './ApplicationStatusForm';
import { rejectApplication, RejectionTemplate } from '../../services/recruitment';

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
  const [rejectionTemplate, setRejectionTemplate] = useState({
    subject: 'Application Update - Thank You for Your Interest',
    body: 'Thank you for taking the time to apply for a position with us.\n\nAfter careful consideration, we have decided not to move forward with your application at this time.\n\nWe appreciate your interest in our company and encourage you to apply for future positions that match your qualifications.\n\nWe wish you the best in your career search.',
    reason: 'Does not meet current requirements',
  });

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
    if (!application) return;
    setRejecting(true);
    setFeedback(null);
    try {
      await rejectApplication(application._id, rejectionTemplate);
      await onRejected?.();
      setShowRejectModal(false);
      setFeedback('Application rejected and notification sent');
      setTimeout(() => setFeedback(null), 2000);
      // Reset template to default
      setRejectionTemplate({
        subject: 'Application Update - Thank You for Your Interest',
        body: 'Thank you for taking the time to apply for a position with us.\n\nAfter careful consideration, we have decided not to move forward with your application at this time.\n\nWe appreciate your interest in our company and encourage you to apply for future positions that match your qualifications.\n\nWe wish you the best in your career search.',
        reason: 'Does not meet current requirements',
      });
    } catch (error: any) {
      setFeedback(error?.response?.data?.message || 'Failed to reject application');
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
              <div><span className="text-slate-400">Candidate ID:</span> {
                typeof application.candidateId === 'object' && application.candidateId
                  ? (application.candidateId as any)?._id || (application.candidateId as any)?.candidateNumber || String(application.candidateId)
                  : application.candidateId || 'N/A'
              }</div>
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

        {/* Reject confirmation modal with template builder */}
        {showRejectModal && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-slate-900 text-white rounded shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Reject Application</h3>
              <p className="mb-4 text-slate-300">Customize the rejection notification that will be sent to the candidate.</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Subject *</label>
                  <input
                    type="text"
                    value={rejectionTemplate.subject}
                    onChange={(e) => setRejectionTemplate({ ...rejectionTemplate, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Application Update - Thank You for Your Interest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rejection Reason *</label>
                  <input
                    type="text"
                    value={rejectionTemplate.reason}
                    onChange={(e) => setRejectionTemplate({ ...rejectionTemplate, reason: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Does not meet current requirements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Body *</label>
                  <textarea
                    value={rejectionTemplate.body}
                    onChange={(e) => setRejectionTemplate({ ...rejectionTemplate, body: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Thank you for taking the time to apply..."
                  />
                  <p className="text-xs text-slate-400 mt-1">This will be sent as the rejection email to the candidate.</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                  onClick={() => {
                    setShowRejectModal(false);
                    // Reset to default
                    setRejectionTemplate({
                      subject: 'Application Update - Thank You for Your Interest',
                      body: 'Thank you for taking the time to apply for a position with us.\n\nAfter careful consideration, we have decided not to move forward with your application at this time.\n\nWe appreciate your interest in our company and encourage you to apply for future positions that match your qualifications.\n\nWe wish you the best in your career search.',
                      reason: 'Does not meet current requirements',
                    });
                  }}
                  disabled={rejecting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white font-bold disabled:bg-gray-600 transition"
                  onClick={handleRejectApp}
                  disabled={rejecting || !rejectionTemplate.subject.trim() || !rejectionTemplate.body.trim() || !rejectionTemplate.reason.trim()}
                >
                  {rejecting ? 'Rejecting...' : 'Reject & Send Notification'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

