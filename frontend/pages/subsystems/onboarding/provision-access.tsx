import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAllOnboarding, provisionSystemAccess, type Onboarding } from '../../../services/recruitment';

export default function ProvisionSystemAccess() {
  const router = useRouter();
  const [onboardingList, setOnboardingList] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provisioning, setProvisioning] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Check if user is System Admin
    const role = localStorage.getItem('role');
    if (role !== 'System Admin' && role !== 'SYSTEM_ADMIN') {
      router.push('/subsystems/onboarding');
      return;
    }

    fetchOnboardingList();
  }, []);

  const fetchOnboardingList = async () => {
    try {
      setLoading(true);
      const response = await getAllOnboarding();
      // Filter for onboarding records that need provisioning
      const needsProvisioning = response.data.filter((onboarding: any) => {
        const hasProvisioningTasks = onboarding.tasks?.some(
          (task: any) => task.systemAdminTask === true && task.provisioningRequired === true
        );
        return hasProvisioningTasks;
      });
      setOnboardingList(needsProvisioning);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching onboarding:', err);
      setError(err?.response?.data?.message || 'Failed to load onboarding records');
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionAccess = async (employeeId: string) => {
    if (!confirm('Are you sure you want to provision system access for this employee? This will create email accounts, SSO access, payroll access, and internal system access.')) {
      return;
    }

    try {
      setProvisioning({ ...provisioning, [employeeId]: true });
      const response = await provisionSystemAccess(employeeId);
      alert(`System access provisioned successfully!\n\nActions completed:\n${response.actions.map((a: string) => `- ${a}`).join('\n')}`);
      await fetchOnboardingList(); // Refresh list
    } catch (err: any) {
      console.error('Error provisioning access:', err);
      alert(err?.response?.data?.message || 'Failed to provision system access');
    } finally {
      setProvisioning({ ...provisioning, [employeeId]: false });
    }
  };

  const getEmployeeInfo = (onboarding: any) => {
    const employee = onboarding.employeeId;
    if (typeof employee === 'object' && employee !== null) {
      return {
        id: employee._id?.toString() || '',
        number: employee.employeeNumber || 'N/A',
        name: employee.firstName && employee.lastName 
          ? `${employee.firstName} ${employee.lastName}` 
          : employee.employeeNumber || 'N/A',
        email: employee.workEmail || employee.personalEmail || 'N/A',
      };
    }
    return {
      id: String(employee || onboarding.employeeId || ''),
      number: 'N/A',
      name: 'N/A',
      email: 'N/A',
    };
  };

  const hasPendingProvisioning = (onboarding: any) => {
    return onboarding.tasks?.some(
      (task: any) => 
        task.systemAdminTask === true && 
        task.provisioningRequired === true && 
        (task.status === 'pending' || task.status === 'PENDING' || task.status === 'in_progress' || task.status === 'IN_PROGRESS')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">System Admin</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Provision System Access</h1>
              <p className="text-lg text-slate-200/80">
                Provision system access (payroll, email, internal systems) for new hires
              </p>
            </div>
            <Link href="/subsystems/onboarding" className="text-blue-300 hover:text-blue-200 underline text-sm self-start">
              ← Back
            </Link>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!loading && onboardingList.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-200/80">No onboarding records require system access provisioning at this time.</p>
          </div>
        )}

        {!loading && onboardingList.length > 0 && (
          <div className="grid gap-6">
            {onboardingList.map((onboarding: any) => {
              const employee = getEmployeeInfo(onboarding);
              const needsProvisioning = hasPendingProvisioning(onboarding);
              const isProvisioning = provisioning[employee.id];

              return (
                <div
                  key={onboarding._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{employee.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-200/80">
                        <span>Employee: <span className="font-mono">{employee.number}</span></span>
                        <span>Email: {employee.email}</span>
                      </div>
                    </div>
                    {needsProvisioning && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/50">
                        Pending Provisioning
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleProvisionAccess(employee.id)}
                      disabled={isProvisioning || !needsProvisioning}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        isProvisioning || !needsProvisioning
                          ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isProvisioning ? 'Provisioning...' : 'Provision System Access'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center pt-6">
          <Link
            href="/subsystems/onboarding"
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg shadow-blue-900/40"
          >
            ← Back to Onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}

