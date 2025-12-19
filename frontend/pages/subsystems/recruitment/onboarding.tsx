import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getOnboardingByEmployee,
  updateOnboardingTask,
  uploadDocument,
  type Onboarding,
  type OnboardingTask,
} from '../../../services/recruitment';

export default function OnboardingTracker() {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Get employee ID from localStorage or user context
    // In a real app, this would come from the authenticated user
    const employeeId = localStorage.getItem('employeeId') || localStorage.getItem('userId');
    
    if (!employeeId) {
      setError('Employee ID not found. Please log in.');
      setLoading(false);
      return;
    }

    fetchOnboarding(employeeId);
  }, []);

  const fetchOnboarding = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await getOnboardingByEmployee(employeeId);
      setOnboarding(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching onboarding:', err);
      setError(err?.response?.data?.message || 'Failed to load onboarding tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskIndex: number, status: 'pending' | 'in_progress' | 'completed') => {
    if (!onboarding) return;

    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      const response = await updateOnboardingTask(onboarding._id, taskIndex, updateData);
      setOnboarding(response.data);
    } catch (err: any) {
      console.error('Error updating task:', err);
      alert(err?.response?.data?.message || 'Failed to update task');
    }
  };

  const handleFileUpload = async (taskIndex: number, file: File, documentType: 'contract' | 'id' | 'certificate') => {
    if (!onboarding) return;

    try {
      setUploading({ ...uploading, [taskIndex]: true });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);

      // Upload file using FormData
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/onboarding/${onboarding.employeeId}/documents`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
      }

      const result = await response.json();

      // Update the task with the document
      const taskResponse = await updateOnboardingTask(onboarding._id, taskIndex, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        documentId: result.data?._id || result._id,
      });

      setOnboarding(taskResponse.data);
      alert('Document uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading document:', err);
      alert(err?.message || 'Failed to upload document');
    } finally {
      setUploading({ ...uploading, [taskIndex]: false });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  const getProgressPercentage = () => {
    if (!onboarding || onboarding.tasks.length === 0) return 0;
    const completed = onboarding.tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / onboarding.tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading onboarding tasks...</p>
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

  if (!onboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg">No onboarding tasks found.</p>
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

  const progress = getProgressPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold">Onboarding Tracker</h1>
              <p className="text-slate-200/80 mt-2">
                Complete your onboarding tasks to get started
              </p>
            </div>
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm"
            >
              ← Back
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-300/60 mt-2">
              {onboarding.tasks.filter((t) => t.status === 'completed').length} of{' '}
              {onboarding.tasks.length} tasks completed
            </p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          {onboarding.tasks.map((task, index) => (
            <div
              key={index}
              className={`bg-white/5 rounded-lg p-6 border ${getStatusColor(task.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{task.name}</h3>
                  {task.department && (
                    <p className="text-sm text-slate-300/60 mb-2">Department: {task.department}</p>
                  )}
                  {task.notes && (
                    <p className="text-sm text-slate-200/80">{task.notes}</p>
                  )}
                  {task.deadline && (
                    <p className="text-xs text-slate-300/60 mt-2">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  )}
                  {task.completedAt && (
                    <p className="text-xs text-green-300/80 mt-1">
                      Completed: {new Date(task.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Task Actions */}
              <div className="flex items-center gap-3 mt-4">
                {task.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => handleTaskUpdate(index, 'in_progress')}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-sm transition"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleTaskUpdate(index, 'completed')}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-sm transition"
                    >
                      Mark Complete
                    </button>
                  </>
                )}

                {/* Document Upload */}
                {task.name.toLowerCase().includes('document') || task.name.toLowerCase().includes('contract') ? (
                  <label className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm transition cursor-pointer">
                    {uploading[index] ? 'Uploading...' : 'Upload Document'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          let docType: 'contract' | 'id' | 'certificate' = 'contract';
                          if (task.name.toLowerCase().includes('id')) docType = 'id';
                          if (task.name.toLowerCase().includes('certificate')) docType = 'certificate';
                          handleFileUpload(index, file, docType);
                        }
                      }}
                      disabled={uploading[index]}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {onboarding.completed && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-green-300">
              🎉 Congratulations! You've completed all onboarding tasks!
            </p>
            <p className="text-sm text-slate-200/80 mt-2">
              Your onboarding was completed on{' '}
              {onboarding.completedAt
                ? new Date(onboarding.completedAt).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

