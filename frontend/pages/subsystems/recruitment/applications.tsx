import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApplications, fetchApplicationById, updateApplicationStatus, rejectApplication } from '../../../services/recruitment';
import { Application, ApplicationStatus } from '../../../types/recruitment';
import { ApplicationsTable } from './_components/ApplicationsTable';
import { ApplicationDetailDrawer } from './_components/ApplicationDetailDrawer';

const Applications: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerApp, setDrawerApp] = useState<Application | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const res = await fetchApplications({
          stage: filterStage as any,
          status: filterStatus as any,
        });
        setApps(res.data);
        setError(null);
      } catch (err: any) {
        if (err?.code === 'ERR_NETWORK' || err?.code === 'ERR_CONNECTION_REFUSED') {
          setError('Cannot connect to server. Please ensure the backend is running.');
        } else {
          setError(err?.response?.data?.message || 'Failed to fetch applications');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadApplications();
  }, [filterStage, filterStatus]);

  const handleView = async (app: Application) => {
    setDrawerApp(null);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError(null);
    try {
      const res = await fetchApplicationById(app._id);
      setDrawerApp(res.data);
    } catch {
      setDrawerError('Failed to fetch details');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!drawerApp) return;
    try {
      await updateApplicationStatus(drawerApp._id, newStatus);
      setDrawerApp(a => (a ? { ...a, status: newStatus as any } : a));
      setApps(apps => apps.map(a => a._id === drawerApp._id ? { ...a, status: newStatus as any } : a));
    } catch (err) {
      throw err;
    }
  };

  const handleReject = async () => {
    if (!drawerApp) return;
    // The rejection is now handled in ApplicationDetailDrawer with template
    // This function is called after successful rejection
    setDrawerApp(a => a ? { ...a, status: 'rejected' as ApplicationStatus } : a);
    setApps(apps => apps.map(a => a._id === drawerApp._id ? { ...a, status: 'rejected' as ApplicationStatus } : a));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold">Applications Pipeline</h1>
            <p className="text-xs text-blue-300/80 uppercase tracking-widest">Recruitment - Internal HR</p>
          </div>
          <Link
            href="/subsystems/recruitment"
            className="text-blue-300 hover:text-blue-200 underline text-sm"
          >
            ← Back
          </Link>
        </div>
        <ApplicationsTable
          apps={apps}
          loading={loading}
          error={error}
          onView={handleView}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      </div>
      <ApplicationDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        application={drawerApp}
        onStatusUpdated={handleStatusUpdate}
        onRejected={handleReject}
      />
      {drawerLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-slate-800 p-8 text-white rounded shadow-xl text-lg">Loading details...</div>
        </div>
      )}
      {drawerError && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-red-800 p-8 text-red-200 rounded shadow-xl text-lg">{drawerError}</div>
        </div>
      )}
    </div>
  );
};

export default Applications;
