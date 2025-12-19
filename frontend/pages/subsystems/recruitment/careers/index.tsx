  import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../../../../lib/apiClient';
import { JobRequisition, JobTemplate } from '../../../../types/recruitment';

type JobWithTemplate = JobRequisition & { templateId?: JobTemplate | string };

export default function Careers() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // filters - default to 'published' for candidates, 'all' for HR
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>(
    'published',
  );
  const [locationFilter, setLocationFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Get user role
    const role = localStorage.getItem('role');
    setUserRole(role);
    
    // Candidates should only see published jobs by default
    if (role === 'Job Candidate' || role === 'JOB_CANDIDATE') {
      setStatusFilter('published');
    } else {
      setStatusFilter('all');
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get<JobWithTemplate[]>('/jobs');
        setJobs(res.data);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Could not load jobs right now.';
        setError(`Error: ${errorMessage}. Check console for details.`);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const template = typeof job.templateId === 'object' ? job.templateId : undefined;
      
      // Candidates can only see published jobs
      const isCandidate = userRole === 'Job Candidate' || userRole === 'JOB_CANDIDATE';
      const statusMatches = isCandidate
        ? (job.publishStatus || 'draft') === 'published'
        : statusFilter === 'all' ? true : (job.publishStatus || 'draft') === statusFilter;
      
      const locationMatches = locationFilter
        ? (job.location || '').toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      const searchMatches = searchTerm
        ? `${template?.title || ''} ${template?.department || ''} ${job.requisitionId}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      return statusMatches && locationMatches && searchMatches;
    });
  }, [jobs, statusFilter, locationFilter, searchTerm, userRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3 text-center flex-1">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Careers</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Open Roles</h1>
              <p className="text-lg text-slate-200/80">
                Browse current openings and apply in one flow.
              </p>
            </div>
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
            >
              ← Back
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Only show status filter for HR roles, candidates only see published */}
          {(userRole !== 'Job Candidate' && userRole !== 'JOB_CANDIDATE') && (
            <label className="space-y-2 text-sm text-slate-100">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          )}

          <label className="space-y-2 text-sm text-slate-100">
            <span>Location</span>
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="e.g., Cairo"
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-100">
            <span>Search</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Title, department, or Req ID"
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        {loading && <div className="text-center text-slate-200/80">Loading jobs...</div>}

        {error && !loading && <div className="text-center text-red-200">{error}</div>}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="text-center text-slate-200/80">
            No jobs match your filters. Try clearing filters or check back soon.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {filteredJobs.map((job) => {
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200/80">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-400/40">
                      {job.publishStatus || 'draft'}
                    </span>
                    {job.location && <span className="text-slate-200/80">📍 {job.location}</span>}
                    {job.postingDate && (
                      <span className="text-slate-200/60">
                        Posted {new Date(job.postingDate).toLocaleDateString()}
                      </span>
                    )}
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
