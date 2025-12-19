import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import { Application, ApplicationStage, ApplicationStatus } from '../../../types/recruitment';

export default function MyApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string>('');

  useEffect(() => {
    // Get candidate ID from localStorage or profile
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCandidateId(userId);
      fetchMyApplications(userId);
    } else {
      // Try to get from profile
      fetchCandidateId();
    }
  }, []);

  const fetchCandidateId = async () => {
    try {
      const res = await apiClient.get('/employee-profile/profile/me');
      if (res.data?._id) {
        setCandidateId(res.data._id);
        fetchMyApplications(res.data._id);
      } else {
        setError('Could not identify candidate. Please ensure you are logged in.');
        setLoading(false);
      }
    } catch (err) {
      setError('Could not load candidate profile. Please ensure you are logged in.');
      setLoading(false);
    }
  };

  const fetchMyApplications = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch applications by candidate ID
      const res = await apiClient.get<Application[]>(`/applications?candidateId=${id}`);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err?.response?.data?.message || 'Could not load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.HIRED:
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case ApplicationStatus.REJECTED:
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case ApplicationStatus.IN_PROCESS:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case ApplicationStatus.OFFER:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case ApplicationStatus.SUBMITTED:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getStageColor = (stage: ApplicationStage) => {
    switch (stage) {
      case ApplicationStage.SCREENING:
        return 'bg-cyan-500/20 text-cyan-300';
      case ApplicationStage.HR_INTERVIEW:
        return 'bg-indigo-500/20 text-indigo-300';
      case ApplicationStage.DEPARTMENT_INTERVIEW:
        return 'bg-purple-500/20 text-purple-300';
      case ApplicationStage.OFFER:
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold mb-2">My Applications</h1>
            <p className="text-slate-200/80">Track the status of your job applications</p>
          </div>
          <Link
            href="/subsystems/recruitment/careers"
            className="glow-btn px-6 py-3"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card p-6 border-red-500/40 bg-red-500/10">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 && !error && (
          <div className="glass-card p-12 text-center">
            <p className="text-xl text-slate-200/80 mb-4">No applications yet</p>
            <p className="text-slate-300/60 mb-6">Start applying for positions to see your applications here.</p>
            <Link
              href="/subsystems/recruitment/careers"
              className="glow-btn px-6 py-3 inline-block"
            >
              Browse Open Positions
            </Link>
          </div>
        )}

        {/* Applications Grid */}
        {applications.length > 0 && (
          <div className="grid gap-6">
            {applications.map((app) => {
              // Handle requisitionId - can be string or object
              const requisitionId = typeof app.requisitionId === 'object' 
                ? app.requisitionId._id 
                : app.requisitionId;

              return (
                <div
                  key={app._id}
                  className="glass-card p-6 hover:border-blue-400/60 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-semibold">
                          Application #{app._id.slice(-8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(app.currentStage)}`}>
                          {app.currentStage}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-200/80">
                        <p>
                          <span className="text-slate-300/60">Requisition ID:</span>{' '}
                          <span className="font-medium">
                            {typeof app.requisitionId === 'object' 
                              ? app.requisitionId.requisitionId || app.requisitionId._id
                              : app.requisitionId || 'N/A'}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-300/60">Submitted:</span>{' '}
                          <span className="font-medium">
                            {app.createdAt 
                              ? new Date(app.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-300/60">CV:</span>{' '}
                          <span className="font-medium text-blue-300">Uploaded</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {requisitionId && (
                        <Link
                          href={`/subsystems/recruitment/careers/${requisitionId}`}
                          className="glass-btn px-4 py-2 text-sm"
                        >
                          View Job
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Status Updates Section */}
                  {app.status === ApplicationStatus.IN_PROCESS && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-slate-200/80">
                        Your application is being reviewed. You will receive updates as it progresses through the hiring stages.
                      </p>
                    </div>
                  )}

                  {app.status === ApplicationStatus.OFFER && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-green-300 font-medium mb-2">
                        🎉 Congratulations! You have received an offer.
                      </p>
                      <Link
                        href={`/subsystems/recruitment/offers?applicationId=${app._id}`}
                        className="text-blue-300 hover:text-blue-200 text-sm underline"
                      >
                        View Offer Details →
                      </Link>
                    </div>
                  )}

                  {app.status === ApplicationStatus.REJECTED && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-slate-200/80">
                        This application was not selected for this position. Thank you for your interest.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

