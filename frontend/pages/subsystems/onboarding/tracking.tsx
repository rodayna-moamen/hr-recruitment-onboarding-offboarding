import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAllOnboarding, type Onboarding } from '../../../services/recruitment';

interface NewHireProgress {
  employeeId: string;
  employeeNumber: string;
  name: string;
  email: string;
  onboarding: Onboarding;
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

export default function OnboardingTracking() {
  const router = useRouter();
  const [newHires, setNewHires] = useState<NewHireProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOnboarding();
  }, []);

  const fetchAllOnboarding = async () => {
    try {
      setLoading(true);
      const response = await getAllOnboarding();
      const onboardingList = response.data;
      
      const newHiresData: NewHireProgress[] = onboardingList.map((onboarding: any) => {
        const employee = onboarding.employeeId;
        const employeeId = (employee?._id || onboarding.employeeId)?.toString() || String(onboarding.employeeId || '');
        const employeeNumber = employee?.employeeNumber || employeeId;
        const firstName = employee?.firstName || '';
        const lastName = employee?.lastName || '';
        const name = firstName && lastName ? `${firstName} ${lastName}` : employeeNumber;
        const email = employee?.workEmail || employee?.personalEmail || 'N/A';
        
        const completedTasks = onboarding.tasks.filter((t: any) => t.status === 'completed' || t.status === 'COMPLETED').length;
        const totalTasks = onboarding.tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          employeeId,
          employeeNumber,
          name,
          email,
          onboarding,
          progress,
          completedTasks,
          totalTasks,
        };
      });
      
      setNewHires(newHiresData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching onboarding:', err);
      setError(err?.response?.data?.message || 'Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading onboarding data...</p>
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
            href="/subsystems/onboarding"
            className="text-blue-300 hover:text-blue-200 underline"
          >
            ← Back to Onboarding
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Onboarding</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">New Hires Tracking</h1>
              <p className="text-lg text-slate-200/80">
                Track onboarding progress for all new hires
              </p>
            </div>
            <Link
              href="/subsystems/onboarding"
              className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
            >
              ← Back
            </Link>
          </div>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">Total New Hires</p>
            <p className="text-2xl font-semibold mt-1">{newHires.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="text-2xl font-semibold mt-1">
              {newHires.filter(n => n.progress > 0 && n.progress < 100).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-semibold mt-1">
              {newHires.filter(n => n.progress === 100).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">Avg. Progress</p>
            <p className="text-2xl font-semibold mt-1">
              {newHires.length > 0
                ? Math.round(newHires.reduce((sum, n) => sum + n.progress, 0) / newHires.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* New Hires List */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold">All New Hires</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tasks</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {newHires.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No new hires with onboarding tasks found
                    </td>
                  </tr>
                ) : (
                  newHires.map((newHire) => (
                    <tr key={newHire.employeeId} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{newHire.name}</p>
                          <p className="text-sm text-slate-400">{newHire.employeeNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{newHire.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {newHire.completedTasks} / {newHire.totalTasks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(newHire.progress)}`}
                              style={{ width: `${newHire.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {newHire.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            newHire.progress === 100
                              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                              : newHire.progress > 0
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                          }`}
                        >
                          {newHire.progress === 100 ? 'Completed' : newHire.progress > 0 ? 'In Progress' : 'Not Started'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

