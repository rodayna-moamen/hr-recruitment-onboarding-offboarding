import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import {
  Interview,
  InterviewMethod,
  InterviewStatus,
  ApplicationStage,
  Application,
} from '../../../types/recruitment';

export default function Interviews() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    stage: ApplicationStage.SCREENING,
    scheduledDate: '',
    method: InterviewMethod.VIDEO,
    panel: [] as string[],
    videoLink: '',
    calendarEventId: '',
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    interviewerId: '',
    technicalScore: 5,
    communicationScore: 5,
    cultureFitScore: 5,
    overallScore: 5,
    comments: '',
    recommendation: 'maybe' as 'hire' | 'reject' | 'maybe',
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get<Application[]>('/applications');
        setApplications(res.data);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    if (selectedApplicationId) {
      fetchInterviews(selectedApplicationId);
    } else {
      setInterviews([]);
      setLoading(false);
    }
  }, [selectedApplicationId]);

  const fetchInterviews = async (applicationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<Interview[]>(`/interviews?applicationId=${applicationId}`);
      setInterviews(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching interviews:', err);
      setError(err?.response?.data?.message || 'Could not load interviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty panel members
      const validPanel = scheduleForm.panel.filter((id) => id.trim());
      
      // Validate panel is not empty (backend requirement)
      if (validPanel.length === 0) {
        alert('At least one panel member is required.');
        return;
      }

      // Validate panel members are valid MongoDB ObjectIds (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const invalidPanelMembers = validPanel.filter((id) => !objectIdRegex.test(id.trim()));
      if (invalidPanelMembers.length > 0) {
        alert('Panel member IDs must be valid MongoDB ObjectIds (24 hex characters).');
        return;
      }

      const payload = {
        applicationId: scheduleForm.applicationId || selectedApplicationId,
        stage: scheduleForm.stage,
        scheduledDate: new Date(scheduleForm.scheduledDate).toISOString(),
        method: scheduleForm.method,
        panel: validPanel,
        ...(scheduleForm.videoLink && { videoLink: scheduleForm.videoLink }),
        ...(scheduleForm.calendarEventId && { calendarEventId: scheduleForm.calendarEventId }),
      };
      
      await apiClient.post('/interviews', payload);
      setShowScheduleForm(false);
      setScheduleForm({
        applicationId: selectedApplicationId,
        stage: ApplicationStage.SCREENING,
        scheduledDate: '',
        method: InterviewMethod.VIDEO,
        panel: [],
        videoLink: '',
        calendarEventId: '',
      });
      if (selectedApplicationId) {
        fetchInterviews(selectedApplicationId);
      }
    } catch (err: any) {
      console.error('Error scheduling interview:', err);
      const errorMessage = err?.response?.data?.message || 
                          (err?.response?.data?.error && Array.isArray(err.response.data.error) 
                            ? err.response.data.error.join(', ') 
                            : err?.response?.data?.error) ||
                          'Failed to schedule interview.';
      alert(errorMessage);
    }
  };

  const handleSubmitFeedback = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      await apiClient.post(`/interviews/${selectedInterview._id}/feedback`, feedbackForm);
      setShowFeedbackForm(false);
      setSelectedInterview(null);
      if (selectedApplicationId) {
        fetchInterviews(selectedApplicationId);
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      alert(err?.response?.data?.message || 'Failed to submit feedback.');
    }
  };

  const addPanelMember = () => {
    setScheduleForm({
      ...scheduleForm,
      panel: [...scheduleForm.panel, ''],
    });
  };

  const updatePanelMember = (index: number, value: string) => {
    const newPanel = [...scheduleForm.panel];
    newPanel[index] = value;
    setScheduleForm({ ...scheduleForm, panel: newPanel });
  };

  const removePanelMember = (index: number) => {
    const newPanel = scheduleForm.panel.filter((_, i) => i !== index);
    setScheduleForm({ ...scheduleForm, panel: newPanel });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
          <h1 className="text-4xl lg:text-5xl font-semibold">Interviews</h1>
          <p className="text-lg text-slate-200/80">
            Schedule interviews, manage panels, and submit feedback.
          </p>
        </header>

        {/* Application Selector */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <label className="space-y-2 block">
            <span className="text-sm text-slate-100 font-semibold">Select Application</span>
            <select
              value={selectedApplicationId}
              onChange={(e) => setSelectedApplicationId(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select an application --</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  Application {app._id.slice(-8)} - {app.status} ({app.currentStage})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Schedule Interview Button */}
        {selectedApplicationId && (
          <button
            onClick={() => {
              setScheduleForm({
                applicationId: selectedApplicationId,
                stage: ApplicationStage.SCREENING,
                scheduledDate: '',
                method: InterviewMethod.VIDEO,
                panel: [],
                videoLink: '',
                calendarEventId: '',
              });
              setShowScheduleForm(true);
            }}
            className="rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
          >
            + Schedule New Interview
          </button>
        )}

        {/* Schedule Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Schedule Interview</h2>
              <form onSubmit={handleSchedule} className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Stage</span>
                  <select
                    value={scheduleForm.stage}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, stage: e.target.value as ApplicationStage })
                    }
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value={ApplicationStage.SCREENING}>Screening</option>
                    <option value={ApplicationStage.DEPARTMENT_INTERVIEW}>Department Interview</option>
                    <option value={ApplicationStage.HR_INTERVIEW}>HR Interview</option>
                    <option value={ApplicationStage.OFFER}>Offer</option>
                  </select>
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Scheduled Date & Time</span>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Method</span>
                  <select
                    value={scheduleForm.method}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, method: e.target.value as InterviewMethod })
                    }
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value={InterviewMethod.ONSITE}>Onsite</option>
                    <option value={InterviewMethod.VIDEO}>Video</option>
                    <option value={InterviewMethod.PHONE}>Phone</option>
                  </select>
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-100">Panel Members (User IDs) *</span>
                      <p className="text-xs text-slate-400 mt-1">
                        At least one panel member required (24-character MongoDB ObjectId)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addPanelMember}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add Member
                    </button>
                  </div>
                  {scheduleForm.panel.length === 0 && (
                    <p className="text-xs text-yellow-400">Please add at least one panel member</p>
                  )}
                  {scheduleForm.panel.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => updatePanelMember(index, e.target.value)}
                        placeholder="MongoDB ObjectId (24 hex characters)"
                        className="flex-1 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePanelMember(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Video Link (optional)</span>
                  <input
                    type="url"
                    value={scheduleForm.videoLink}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, videoLink: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Calendar Event ID (optional)</span>
                  <input
                    type="text"
                    value={scheduleForm.calendarEventId}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, calendarEventId: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    Schedule Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <div className="text-center text-slate-200/80">Loading interviews...</div>}

        {/* Error State */}
        {error && !loading && <div className="text-center text-red-200">{error}</div>}

        {/* Interviews List */}
        {!loading && !error && selectedApplicationId && interviews.length === 0 && (
          <div className="text-center text-slate-200/80">
            No interviews scheduled for this application yet.
          </div>
        )}

        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/60 transition"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">
                      {interview.stage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
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
                  <p className="text-sm text-slate-200/80">
                    Scheduled: {new Date(interview.scheduledDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-200/80">Method: {interview.method}</p>
                  {interview.videoLink && (
                    <a
                      href={interview.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Join Video Call →
                    </a>
                  )}
                  {interview.panel && interview.panel.length > 0 && (
                    <p className="text-sm text-slate-200/80">
                      Panel: {interview.panel.length} member(s)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedInterview(interview);
                      setShowFeedbackForm(true);
                    }}
                    disabled={interview.status === InterviewStatus.COMPLETED}
                    className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Feedback
                  </button>
                  <Link
                    href={`/subsystems/recruitment/interviews/${interview._id}`}
                    className="px-3 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 border border-white/10 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Form Modal */}
        {showFeedbackForm && selectedInterview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Submit Interview Feedback</h2>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Interviewer ID</span>
                  <input
                    type="text"
                    value={feedbackForm.interviewerId}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, interviewerId: e.target.value })
                    }
                    required
                    placeholder="MongoDB ObjectId"
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Technical Score (1-10)</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackForm.technicalScore}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          technicalScore: parseInt(e.target.value),
                        })
                      }
                      required
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Communication Score (1-10)</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackForm.communicationScore}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          communicationScore: parseInt(e.target.value),
                        })
                      }
                      required
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Culture Fit Score (1-10)</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackForm.cultureFitScore}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          cultureFitScore: parseInt(e.target.value),
                        })
                      }
                      required
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">Overall Score (1-10)</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={feedbackForm.overallScore}
                      onChange={(e) =>
                        setFeedbackForm({
                          ...feedbackForm,
                          overallScore: parseInt(e.target.value),
                        })
                      }
                      required
                      className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Recommendation</span>
                  <select
                    value={feedbackForm.recommendation}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        recommendation: e.target.value as 'hire' | 'reject' | 'maybe',
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="hire">Hire</option>
                    <option value="maybe">Maybe</option>
                    <option value="reject">Reject</option>
                  </select>
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Comments</span>
                  <textarea
                    value={feedbackForm.comments}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, comments: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    Submit Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFeedbackForm(false);
                      setSelectedInterview(null);
                    }}
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
