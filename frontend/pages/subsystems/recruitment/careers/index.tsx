import Link from 'next/link';
import { useEffect, useState } from 'react';
import apiClient from '../../../../lib/apiClient';
import { JobRequisition, JobTemplate } from '../../../../types/recruitment';

type JobWithTemplate = JobRequisition & { templateId?: JobTemplate | string };

export default function Careers() {
  const [jobs, setJobs] = useState<JobWithTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get<JobWithTemplate[]>('/jobs');
        setJobs(res.data);
      } catch (err) {
        setError('Could not load jobs right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const publishedJobs = jobs.filter((job) => job.publishStatus !== 'closed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Careers</p>
          <h1 className="text-4xl lg:text-5xl font-semibold">Open Roles</h1>
          <p className="text-lg text-slate-200/80">
            Browse current openings and apply in one flow.
          </p>
        </header>

        {loading && (
          <div className="text-center text-slate-200/80">Loading jobs...</div>
        )}

        {error && !loading && (
          <div className="text-center text-red-200">{error}</div>
        )}

        {!loading && !error && publishedJobs.length === 0 && (
          <div className="text-center text-slate-200/80">
            No published jobs yet. Check back soon.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {publishedJobs.map((job) => {
            const template = typeof job.templateId === 'object' ? job.templateId : undefined;
            return (
              <Link
                key={job._id}
                href={`/subsystems/recruitment/careers/${job._id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/60 hover:bg-white/10 transition"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-cyan-400/10" />
                <div className="relative space-y-3">
                  <h2 className="text-xl font-semibold">
                    {template?.title || `Requisition ${job.requisitionId}`}
                  </h2>
                  <p className="text-sm text-slate-200/80">
                    {template?.department ? `Department: ${template.department}` : 'Department: N/A'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-blue-200/80">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-400/40">
                      {job.publishStatus || 'draft'}
                    </span>
                    {job.location && <span className="text-slate-200/80">📍 {job.location}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
