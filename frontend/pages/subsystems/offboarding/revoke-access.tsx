import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAllTerminationRequests, revokeSystemAccess, type TerminationRequest } from '../../../services/recruitment';

export default function RevokeSystemAccess() {
  const router = useRouter();
  const [terminations, setTerminations] = useState<TerminationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Check if user is System Admin
    const role = localStorage.getItem('role');
    if (role !== 'System Admin' && role !== 'SYSTEM_ADMIN') {
      router.push('/subsystems/offboarding');
      return;
    }

    fetchTerminations();
  }, []);

  const fetchTerminations = async () => {
    try {
      setLoading(true);
      const response = await getAllTerminationRequests();
      // Filter for approved terminations that may need access revocation
      const approved = response.data.filter((t: TerminationRequest) => t.status === 'approved');
      setTerminations(approved);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching terminations:', err);
      setError(err?.response?.data?.message || 'Failed to load termination requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (employeeId: string) => {
    if (!confirm('Are you sure you want to revoke system and account access for this employee? This will disable their account and revoke all system access for security.')) {
      return;
    }

    try {
      setRevoking({ ...revoking, [employeeId]: true });
      await revokeSystemAccess(employeeId);
      alert('System access revoked successfully! The employee\'s account has been disabled and all system access has been revoked.');
      await fetchTerminations(); // Refresh list
    } catch (err: any) {
      console.error('Error revoking access:', err);
      alert(err?.response?.data?.message || 'Failed to revoke system access');
    } finally {
      setRevoking({ ...revoking, [employeeId]: false });
    }
  };

  const getEmployeeInfo = (termination: any) => {
    const employee = termination.employeeId;
    if (typeof employee === 'object' && employee !== null) {
      return {
        id: employee._id?.toString() || termination.employeeId?.toString() || '',
        number: employee.employeeNumber || 'N/A',
        name: employee.firstName && employee.lastName 
          ? `${employee.firstName} ${employee.lastName}` 
          : employee.employeeNumber || 'N/A',
        email: employee.workEmail || employee.personalEmail || 'N/A',
      };
    }
    return {
      id: String(termination.employeeId || ''),
      number: 'N/A',
      name: 'N/A',
      email: 'N/A',
    };
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
              <h1 className="text-4xl lg:text-5xl font-semibold">Revoke System Access</h1>
              <p className="text-lg text-slate-200/80">
                Revoke system and account access upon termination to maintain security
              </p>
            </div>
            <Link href="/subsystems/offboarding" className="text-blue-300 hover:text-blue-200 underline text-sm self-start">
              ← Back
            </Link>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!loading && terminations.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-200/80">No approved terminations found. Access revocation is only needed for approved terminations.</p>
          </div>
        )}

        {!loading && terminations.length > 0 && (
          <div className="grid gap-6">
            {terminations.map((termination: any) => {
              const employee = getEmployeeInfo(termination);
              const isRevoking = revoking[employee.id];

              return (
                <div
                  key={termination._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{employee.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-200/80">
                        <span>Employee: <span className="font-mono">{employee.number}</span></span>
                        <span>Email: {employee.email}</span>
                        {termination.terminationDate && (
                          <span>Termination Date: {new Date(termination.terminationDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {termination.reason && (
                        <p className="text-sm text-slate-300/60 mt-2">Reason: {termination.reason}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/50">
                      Approved Termination
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleRevokeAccess(employee.id)}
                      disabled={isRevoking}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        isRevoking
                          ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isRevoking ? 'Revoking Access...' : 'Revoke System Access'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center pt-6">
          <Link
            href="/subsystems/offboarding"
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg shadow-blue-900/40"
          >
            ← Back to Offboarding
          </Link>
        </div>
      </div>
    </div>
  );
}

