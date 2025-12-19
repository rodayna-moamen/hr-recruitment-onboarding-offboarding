import { JobRequisition } from '../../types/recruitment';
import React from 'react';

export interface JobsTableProps {
  jobs: JobRequisition[];
  loading: boolean;
  error: string | null;
  onEdit: (job: JobRequisition) => void;
  onPublish: (job: JobRequisition) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, loading, error, onEdit, onPublish }) => {
  if (loading) return <div className="py-10 text-center">Loading jobs...</div>;
  if (error) return <div className="py-10 text-center text-red-500">{error}</div>;
  if (!jobs.length) return <div className="py-10 text-center">No jobs found.</div>;

  return (
    <div className="overflow-x-auto rounded-lg bg-white/5">
      <table className="min-w-full text-sm text-gray-100">
        <thead>
          <tr className="bg-blue-950/80 text-xs uppercase tracking-wide">
            <th className="p-3 text-left">Req. ID</th>
            <th className="p-3 text-left">Template ID</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-center">Openings</th>
            <th className="p-3 text-center">Start Date</th>
            <th className="p-3 text-center">End Date</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job._id} className="border-b border-slate-800 hover:bg-slate-900/60">
              <td className="p-3 font-mono">{job.requisitionId}</td>
              <td className="p-3">{
                typeof job.templateId === 'string' ? job.templateId : job.templateId?._id || '-'
              }</td>
              <td className="p-3">{job.location || '-'}</td>
              <td className="p-3 text-center">{job.openings}</td>
              <td className="p-3 text-center">{job.postingDate ? job.postingDate.substring(0,10) : '-'}</td>
              <td className="p-3 text-center">{job.expiryDate ? job.expiryDate.substring(0,10) : '-'}</td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  job.publishStatus === 'published' ? 'bg-green-800/60 text-green-200' : 'bg-slate-800/60 text-slate-400'
                }`}>
                  {job.publishStatus ? job.publishStatus.charAt(0).toUpperCase() + job.publishStatus.slice(1) : '-'}
                </span>
              </td>
              <td className="p-3 text-center space-x-2">
                <button className="text-blue-300 hover:underline" onClick={() => onEdit(job)}>Edit</button>
                <button
                  className="text-green-300 hover:underline disabled:text-gray-400"
                  disabled={job.publishStatus === 'published'}
                  onClick={() => onPublish(job)}
                >Publish</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

