import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJobRequisitions, fetchJobTemplates, createJobRequisition, updateJobRequisition, publishJobRequisition } from '../../../services/recruitment';
import { JobRequisition, JobTemplate } from '../../../types/recruitment';
import { JobsTable } from './_components/JobsTable';
import { JobForm, JobFormValues } from './_components/JobForm';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // For Create Job
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [templatesError, setTemplatesError] = useState(false);

  // For Edit Job
  const [editing, setEditing] = useState<JobRequisition|null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editTemplates, setEditTemplates] = useState<JobTemplate[]>([]);
  const [editTemplatesError, setEditTemplatesError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchJobRequisitions()
      .then(res => {
        setJobs(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = async (job: JobRequisition) => {
    setEditing(job);
    setEditTemplatesError(false);
    try {
      const res = await fetchJobTemplates();
      setEditTemplates(res.data);
    } catch (e) {
      setEditTemplates([]);
      setEditTemplatesError(true);
    }
  };

  const handleEditJob = async (values: JobFormValues) => {
    if (!editing) return;
    setEditLoading(true);
    setError(null);
    try {
      const res = await updateJobRequisition(editing._id, values);
      setJobs(jobs => jobs.map(j => (j._id === editing._id ? res.data : j)));
      setEditing(null);
      setSuccess('Job updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError('Failed to update job');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePublish = async (job: JobRequisition) => {
    if (!window.confirm('Are you sure you want to publish this job?')) return;
    const prevStatus = job.publishStatus;
    setJobs(js => js.map(j => j._id === job._id ? { ...j, publishStatus: 'published'} : j));
    try {
      await publishJobRequisition(job._id);
      setSuccess('Job published!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setJobs(js => js.map(j => j._id === job._id ? { ...j, publishStatus: prevStatus } : j));
      setError('Publish failed');
    }
  };

  const openCreate = async () => {
    setShowCreate(true);
    setTemplatesError(false);
    try {
      const res = await fetchJobTemplates();
      setTemplates(res.data || []);
      if (!res.data || res.data.length === 0) {
        console.warn('No job templates found. You may need to create templates first or seed the database.');
      }
    } catch (e: any) {
      console.error('Failed to fetch templates:', e);
      setTemplates([]);
      setTemplatesError(true);
      // Show error if it's not just an empty result
      if (e?.response?.status !== 404) {
        setError(`Failed to load templates: ${e?.response?.data?.message || e?.message || 'Unknown error'}`);
      }
    }
  };

  const handleCreateJob = async (values: JobFormValues) => {
    setCreating(true);
    setError(null);
    try {
      const res = await createJobRequisition(values);
      setJobs(jobs => [res.data, ...jobs]);
      setShowCreate(false);
      setSuccess('Job created!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      // Show more detailed error message
      const errorMsg = e?.response?.data?.message || e?.message || 'Failed to create job';
      setError(`Failed to create job: ${errorMsg}`);
      console.error('Create job error:', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Requisitions</h1>
            <p className="text-xs text-blue-300/80 uppercase tracking-widest">Recruitment - Internal HR</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm"
            >
              ← Back
            </Link>
            <button
              className="bg-blue-700 hover:bg-blue-800 transition text-white py-2 px-4 rounded shadow font-medium"
              onClick={openCreate}
            >
              + Create Job
            </button>
          </div>
        </div>
        {success && <div className="mb-2 p-2 bg-green-800/60 text-green-200 rounded">{success}</div>}
        {error && <div className="mb-2 p-2 bg-red-800/60 text-red-200 rounded">{error}</div>}
        <JobsTable jobs={jobs} loading={loading} error={error} onEdit={handleEdit} onPublish={handlePublish} />
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center">
          <div className="bg-slate-900 p-8 rounded-lg shadow-xl min-w-[340px] max-w-md w-full relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Job</h2>
            </div>
            <JobForm
              onSubmit={handleCreateJob}
              onCancel={() => setShowCreate(false)}
              loading={creating}
              templates={templates}
              templatesError={templatesError}
            />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center">
          <div className="bg-slate-900 p-8 rounded-lg shadow-xl min-w-[340px] max-w-md w-full relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Job</h2>
            </div>
            <JobForm
              onSubmit={handleEditJob}
              onCancel={() => setEditing(null)}
              loading={editLoading}
              defaultValues={{
                requisitionId: editing.requisitionId,
                templateId: typeof editing.templateId === 'string' ? editing.templateId : editing.templateId?._id,
                openings: editing.openings,
                location: editing.location,
                hiringManagerId: editing.hiringManagerId || '',
                postingDate: editing.postingDate ? editing.postingDate.slice(0,10) : '',
                expiryDate: editing.expiryDate ? editing.expiryDate.slice(0,10) : '',
                publishStatus: editing.publishStatus === 'closed' ? 'draft' : (editing.publishStatus || 'draft') as 'draft' | 'published',
              }}
              templates={editTemplates}
              templatesError={editTemplatesError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
