import React from 'react';
import { Application, ApplicationStage, ApplicationStatus } from '../../types/recruitment';

export interface ApplicationsTableProps {
  apps: Application[];
  loading: boolean;
  error: string | null;
  onView: (app: Application) => void;
  filterStage: string;
  setFilterStage: (stage: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const stageLabels: Record<string, string> = {
  screening: 'Screening',
  department_interview: 'Dept. Interview',
  hr_interview: 'HR Interview',
  offer: 'Offer',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  in_process: 'In Process',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  apps, loading, error, onView, filterStage, setFilterStage, filterStatus, setFilterStatus }) => {
  
  return (
    <div>
      {/* Filters - Always visible */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <label className="space-y-2">
          <span className="text-sm text-slate-100">Stage</span>
          <select 
            value={filterStage} 
            onChange={e => setFilterStage(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stages</option>
            {Object.entries(stageLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-100">Status</span>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Loading/Error/Empty States */}
      {loading && <div className="py-10 text-center">Loading applications...</div>}
      {error && <div className="py-10 text-center text-red-500">{error}</div>}
      {!loading && !error && !apps.length && (
        <div className="py-10 text-center">
          <p className="text-slate-300 mb-2">No applications found.</p>
          <p className="text-sm text-slate-400">Try adjusting your filters above.</p>
        </div>
      )}

      {/* Table - Only show when there's data */}
      {!loading && !error && apps.length > 0 && (
      <div className="overflow-x-auto rounded bg-white/5 mt-2">
        <table className="min-w-full text-sm text-gray-100">
          <thead>
            <tr className="bg-blue-950/80 text-xs uppercase tracking-wide">
              <th className="p-3 text-left">App ID</th>
              <th className="p-3 text-left">Candidate</th>
              <th className="p-3 text-left">Requisition ID</th>
              <th className="p-3 text-center">Stage</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Created</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app._id} className="border-b border-slate-800 hover:bg-slate-900/60">
                <td className="p-3 font-mono text-xs">{app._id?.toString().slice(-8) || 'N/A'}</td>
                <td className="p-3 font-mono text-xs">
                  {typeof app.candidateId === 'object' && app.candidateId
                    ? (app.candidateId as any)?._id || (app.candidateId as any)?.candidateNumber || String(app.candidateId)
                    : app.candidateId || 'N/A'}
                </td>
                <td className="p-3">{
                  typeof app.requisitionId === 'string' ? app.requisitionId : app.requisitionId?.requisitionId || '-'
                }</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-1 rounded bg-slate-800/60 text-xs font-semibold">
                    {stageLabels[app.currentStage] || app.currentStage}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${app.status === 'rejected' ? 'bg-red-800/60 text-red-200' : app.status === 'hired' ? 'bg-green-800/60 text-green-200' : 'bg-slate-800/60 text-slate-400'}`}>
                    {statusLabels[app.status] || app.status}
                  </span>
                </td>
                <td className="p-3 text-center">{app.createdAt ? app.createdAt.substring(0,10) : '-'}</td>
                <td className="p-3 text-center">
                  <button className="text-blue-300 hover:underline" onClick={() => onView(app)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

