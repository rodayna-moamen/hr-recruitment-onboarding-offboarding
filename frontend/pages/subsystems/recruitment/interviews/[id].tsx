import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../../lib/apiClient';
import { Interview, InterviewStatus, InterviewMethod, ApplicationStage } from '../../../../types/recruitment';

type AssessmentResult = {
  _id: string;
  interviewId: string;
  interviewerId: string;
  score: number;
  comments?: string;
  createdAt?: string;
};

type InterviewWithFeedback = Interview & {
  feedback?: AssessmentResult[];
};

export default function InterviewDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [interview, setInterview] = useState<InterviewWithFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchInterview(id);
    }
  }, [id]);

  const fetchInterview = async (interviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<InterviewWithFeedback>(`/interviews/${interviewId}`);
      setInterview(res.data);
    } catch (err: any) {
      console.error('Error fetching interview:', err);
      setError(err?.response?.data?.message || 'Could not load interview details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12 flex items-center justify-center">
        <div className="text-center text-slate-200/80">Loading interview details...</div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/subsystems/recruitment/interviews"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Interviews
          </Link>
          <div className="text-center text-red-200">{error || 'Interview not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/subsystems/recruitment/interviews"
          className="text-blue-400 hover:text-blue-300 inline-block"
        >
          ← Back to Interviews
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          <header className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">
                {interview.stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  interview.status === InterviewStatus.COMPLETED
                    ? 'bg-green-500/20 border border-green-400/40 text-green-200'
                    : interview.status === InterviewStatus.CANCELLED
                      ? 'bg-red-500/20 border border-red-400/40 text-red-200'
                      : 'bg-blue-500/20 border border-blue-400/40 text-blue-200'
                }`}
              >
                {interview.status}
              </span>
            </div>
          </header>

          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Scheduled Date</h3>
              <p className="text-lg">{new Date(interview.scheduledDate).toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Method</h3>
              <p className="text-lg capitalize">{interview.method}</p>
            </div>

            {interview.videoLink && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Video Link</h3>
                <a
                  href={interview.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {interview.videoLink}
                </a>
              </div>
            )}

            {interview.panel && interview.panel.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Panel Members</h3>
                <ul className="space-y-1">
                  {interview.panel.map((memberId, index) => (
                    <li key={index} className="text-slate-200">
                      {memberId}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {interview.calendarEventId && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Calendar Event ID</h3>
                <p className="text-slate-200">{interview.calendarEventId}</p>
              </div>
            )}

            {interview.candidateFeedback && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Candidate Feedback</h3>
                <p className="text-slate-200">{interview.candidateFeedback}</p>
              </div>
            )}

            {interview.feedback && interview.feedback.length > 0 && (
              <div className="space-y-4 border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold uppercase tracking-wider text-slate-300">Interview Feedback</h3>
                <div className="space-y-4">
                  {interview.feedback.map((feedbackItem, index) => (
                    <div key={feedbackItem._id || index} className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Interviewer ID: {feedbackItem.interviewerId}</span>
                        <span className="text-sm font-semibold text-blue-300">Score: {feedbackItem.score}/10</span>
                      </div>
                      {feedbackItem.comments && (
                        <p className="text-slate-200 mt-2">{feedbackItem.comments}</p>
                      )}
                      {feedbackItem.createdAt && (
                        <p className="text-xs text-slate-400 mt-2">
                          Submitted: {new Date(feedbackItem.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interview.feedbackId && !interview.feedback && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Feedback ID</h3>
                <p className="text-slate-200">{interview.feedbackId}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-slate-400">Application ID</h3>
              <p className="text-slate-200 font-mono text-sm">
                {typeof interview.applicationId === 'object' 
                  ? (interview.applicationId as any)?._id || String(interview.applicationId)
                  : interview.applicationId}
              </p>
            </div>

            {interview.createdAt && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Created At</h3>
                <p className="text-slate-200">{new Date(interview.createdAt).toLocaleString()}</p>
              </div>
            )}

            {interview.updatedAt && (
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-wider text-slate-400">Updated At</h3>
                <p className="text-slate-200">{new Date(interview.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

