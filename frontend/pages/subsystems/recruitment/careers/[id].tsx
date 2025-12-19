import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useMemo, useState, FormEvent } from 'react';
import apiClient from '../../../../lib/apiClient';
import { JobRequisition, JobTemplate } from '../../../../types/recruitment';

type JobWithTemplate = JobRequisition & { templateId?: JobTemplate | string };

export default function CareerDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<JobWithTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [candidateId, setCandidateId] = useState('');
  const [cvPath, setCvPath] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  );
  const [submitMessage, setSubmitMessage] = useState('');

  const template = useMemo(
    () => (job && typeof job.templateId === 'object' ? job.templateId : undefined),
    [job],
  );

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    const fetchJob = async () => {
      try {
        const res = await apiClient.get<JobWithTemplate>(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setError('Job not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const isValidUrl = (value: string) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setSubmitState('error');
        setSubmitMessage('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitState('error');
        setSubmitMessage('File size must be less than 5MB');
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
      setCvPath(''); // Clear URL if file is selected
    }
  };

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || Array.isArray(id)) return;

    if (!candidateId.trim()) {
      setSubmitState('error');
      setSubmitMessage('Candidate ID is required.');
      return;
    }
    if (!consentGiven) {
      setSubmitState('error');
      setSubmitMessage('Consent is required to apply.');
      return;
    }
    
    // CV is required - either file or URL
    if (!cvFile && !cvPath) {
      setSubmitState('error');
      setSubmitMessage('CV/Resume is required. Please upload a file or provide a URL.');
      return;
    }
    
    if (cvPath && !isValidUrl(cvPath)) {
      setSubmitState('error');
      setSubmitMessage('Please enter a valid URL for CV/Resume.');
      return;
    }

    setSubmitState('submitting');
    setSubmitMessage('');
    try {
      let finalCvPath = cvPath;
      
      // If file is uploaded, convert to base64 data URL
      if (cvFile) {
        const reader = new FileReader();
        finalCvPath = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            // Store as data URL (base64 encoded)
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(cvFile);
        });
      }

      await apiClient.post('/applications', {
        candidateId,
        requisitionId: id,
        consentGiven,
        cvPath: finalCvPath,
        cvFileName: cvFile ? cvFileName : undefined,
      });
      setSubmitState('success');
      setSubmitMessage('Application submitted. We will be in touch soon.');
      setCandidateId('');
      setCvPath('');
      setCvFile(null);
      setCvFileName('');
      setConsentGiven(false);
    } catch (err: any) {
      setSubmitState('error');
      const message =
        err?.response?.data?.message || 'Could not submit your application. Please try again.';
      setSubmitMessage(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {loading && <div className="text-center text-slate-200/80">Loading role...</div>}

        {error && !loading && <div className="text-center text-red-200">{error}</div>}

        {!loading && job && (
          <>
            <header className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Careers</p>
                  <h1 className="text-4xl lg:text-5xl font-semibold">
                    {template?.title || `Requisition ${job.requisitionId}`}
                  </h1>
                  <div className="flex flex-wrap gap-3 text-sm text-blue-200/80">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-400/40">
                      {job.publishStatus || 'draft'}
                    </span>
                    {job.location && <span className="text-slate-200/80">📍 {job.location}</span>}
                    {template?.department && (
                      <span className="text-slate-200/80">Dept: {template.department}</span>
                    )}
                  </div>
                </div>
                <Link
                  href="/subsystems/recruitment/careers"
                  className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
                >
                  ← Back
                </Link>
              </div>
            </header>

            <section className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
                  <h2 className="text-xl font-semibold">About the role</h2>
                  {template?.description ? (
                    <p className="text-slate-200/80 leading-relaxed">{template.description}</p>
                  ) : (
                    <p className="text-slate-200/60">No description provided.</p>
                  )}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Qualifications</h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-200/80">
                      {template?.qualifications?.length ? (
                        template.qualifications.map((q) => <li key={q}>{q}</li>)
                      ) : (
                        <li>Not specified</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-200/80">
                      {template?.skills?.length ? (
                        template.skills.map((s) => <li key={s}>{s}</li>)
                      ) : (
                        <li>Not specified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleApply}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Apply now</h2>
                  <p className="text-sm text-slate-200/70">
                    Enter your candidate ID and upload your CV or provide a link. Consent is required.
                  </p>
                </div>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Candidate ID <span className="text-red-400">*</span></span>
                  <input
                    value={candidateId}
                    onChange={(e) => setCandidateId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-900/40 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., MongoDB ObjectId"
                  />
                </label>

                <div className="space-y-3">
                  <label className="space-y-2 block">
                    <span className="text-sm text-slate-100">CV / Resume <span className="text-red-400">*</span></span>
                    <div className="text-xs text-slate-300/70 mb-2">
                      Upload a file (PDF, DOC, DOCX - max 5MB) or provide a URL
                    </div>
                    
                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <span className="px-4 py-2 rounded-lg border border-white/15 bg-slate-900/40 hover:bg-slate-800/40 transition text-sm text-white">
                          {cvFile ? `📄 ${cvFileName}` : '📎 Upload CV File'}
                        </span>
                        {cvFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setCvFile(null);
                              setCvFileName('');
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </label>
                    </div>
                    
                    {/* OR Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-xs text-slate-400">OR</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    
                    {/* URL Input */}
                    <input
                      type="url"
                      value={cvPath}
                      onChange={(e) => {
                        setCvPath(e.target.value);
                        if (e.target.value) {
                          setCvFile(null);
                          setCvFileName('');
                        }
                      }}
                      className="w-full rounded-lg border border-white/15 bg-slate-900/40 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/cv.pdf"
                    />
                    {cvPath && (
                      <button
                        type="button"
                        onClick={() => setCvPath('')}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Clear URL
                      </button>
                    )}
                  </label>
                </div>

                <label className="flex items-start gap-3 text-sm text-slate-200/80">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/30 bg-slate-900/40"
                  />
                  <span>I consent to data processing for recruitment purposes (required).</span>
                </label>

                <button
                  type="submit"
                  disabled={submitState === 'submitting'}
                  className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {submitState === 'submitting' ? 'Submitting...' : 'Submit application'}
                </button>

                {submitState === 'success' && (
                  <div className="text-green-200 text-sm">{submitMessage}</div>
                )}
                {submitState === 'error' && (
                  <div className="text-red-200 text-sm">{submitMessage}</div>
                )}
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
