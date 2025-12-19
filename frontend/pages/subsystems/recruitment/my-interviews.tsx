import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import { Interview, InterviewStatus, InterviewMethod } from '../../../types/recruitment';

export default function MyInterviews() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string>('');

  useEffect(() => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('candidateId');
    if (userId) {
      setCandidateId(userId);
      fetchMyInterviews(userId);
    } else {
      setError('Could not identify candidate. Please ensure you are logged in.');
      setLoading(false);
    }
  }, []);

  const fetchMyInterviews = async (candidateId: string) => {
    try {
      setLoading(true);
      // Fetch interviews filtered by candidate ID
      const res = await apiClient.get<Interview[]>(`/interviews?candidateId=${candidateId}`);
      const interviews = Array.isArray(res.data) ? res.data : [];
      
      setInterviews(interviews);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching interviews:', err);
      setError(err?.response?.data?.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.COMPLETED:
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case InterviewStatus.SCHEDULED:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case InterviewStatus.CANCELLED:
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const getMethodLabel = (method: InterviewMethod) => {
    switch (method) {
      case InterviewMethod.VIDEO:
        return 'Video Call';
      case InterviewMethod.ONSITE:
        return 'In Person';
      case InterviewMethod.PHONE:
        return 'Phone Call';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading interviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-300">{error}</p>
          <Link
            href="/subsystems/recruitment"
            className="text-blue-300 hover:text-blue-200 underline"
          >
            ← Back to Recruitment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">My Scheduled Interviews</h1>
            <p className="text-slate-200/80 mt-2">
              View all interviews scheduled for you
            </p>
          </div>
          <Link
            href="/subsystems/recruitment"
            className="text-blue-300 hover:text-blue-200 underline text-sm"
          >
            ← Back
          </Link>
        </div>

        {interviews.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <p className="text-slate-300">No interviews scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className={`bg-white/5 rounded-lg p-6 border ${getStatusColor(interview.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {interview.stage.replace('_', ' ').toUpperCase()} Interview
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Date & Time:</strong>{' '}
                        {interview.scheduledDate
                          ? new Date(interview.scheduledDate).toLocaleString()
                          : 'TBD'}
                      </p>
                      <p>
                        <strong>Method:</strong> {getMethodLabel(interview.method)}
                      </p>
                      {interview.videoLink && (
                        <p>
                          <strong>Video Link:</strong>{' '}
                          <a
                            href={interview.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-200 underline"
                          >
                            {interview.videoLink}
                          </a>
                        </p>
                      )}
                      {interview.method === InterviewMethod.ONSITE && (
                        <p>
                          <strong>Location:</strong> Onsite
                        </p>
                      )}
                      {interview.candidateFeedback && (
                        <p>
                          <strong>Notes:</strong> {interview.candidateFeedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(interview.status)}`}
                  >
                    {interview.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

