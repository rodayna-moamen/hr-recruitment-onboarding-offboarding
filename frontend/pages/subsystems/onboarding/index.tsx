import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type UserRole = 'HR Employee' | 'HR Manager' | 'HR Admin' | 'Employee' | 'Job Candidate' | 'System Admin' | null;

export default function Onboarding() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role');
    if (role) {
      const normalizedRole = role.trim();
      if (normalizedRole === 'HR Employee' || normalizedRole === 'HR_EMPLOYEE') {
        setUserRole('HR Employee');
      } else if (normalizedRole === 'HR Manager' || normalizedRole === 'HR_MANAGER') {
        setUserRole('HR Manager');
      } else if (normalizedRole === 'HR Admin' || normalizedRole === 'HR_ADMIN') {
        setUserRole('HR Admin');
      } else if (normalizedRole === 'Job Candidate' || normalizedRole === 'JOB_CANDIDATE') {
        setUserRole('Job Candidate');
      } else if (normalizedRole === 'System Admin' || normalizedRole === 'SYSTEM_ADMIN') {
        setUserRole('System Admin');
      } else {
        setUserRole('Employee');
      }
    }
    setLoading(false);
  }, []);

  // New Hire / Employee sections
  const employeeSections = [
    { href: '/subsystems/onboarding/tracker', title: 'My Onboarding Tasks', desc: 'View onboarding steps, track progress, and upload documents (ID, contracts, certifications)' },
  ];

  // Candidate sections - can upload signed contract and forms
  const candidateSections = [
    { href: '/subsystems/onboarding/tracker', title: 'My Onboarding Tasks', desc: 'Upload signed contract and required forms' },
  ];

  // HR Employee, Manager, Admin sections
  const hrSections = [
    { href: '/subsystems/onboarding/checklists', title: 'Create Onboarding Checklists', desc: 'Create task checklists for new hire onboarding' },
    { href: '/subsystems/onboarding/create-employee', title: 'Create Employee from Candidate', desc: 'Convert candidates to employees using signed contracts (CAND → EMP)' },
    { href: '/subsystems/onboarding/tracking', title: 'New Hires Tracking', desc: 'Monitor onboarding progress for all new hires' },
    { href: '/subsystems/onboarding/tracker', title: 'Manage Onboarding & Equipment', desc: 'View onboarding processes and reserve equipment, desks, and access cards' },
  ];

  // System Admin sections
  const systemAdminSections = [
    { href: '/subsystems/onboarding/provision-access', title: 'Provision System Access', desc: 'Provision system access (payroll, email, internal systems) for new hires' },
  ];

  // Determine which sections to show
  const getSections = () => {
    if (userRole === 'System Admin') {
      return systemAdminSections;
    } else if (userRole === 'HR Employee' || userRole === 'HR Manager' || userRole === 'HR Admin') {
      return hrSections;
    } else if (userRole === 'Job Candidate') {
      return candidateSections;
    } else {
      return employeeSections;
    }
  };

  const getRoleTitle = () => {
    if (userRole === 'System Admin') {
      return 'System Access Provisioning';
    } else if (userRole === 'HR Employee' || userRole === 'HR Manager' || userRole === 'HR Admin') {
      return 'Onboarding Management';
    }
    return 'Onboarding Portal';
  };

  const getRoleDescription = () => {
    if (userRole === 'System Admin') {
      return 'Provision system access (payroll, email, internal systems) for new hires.';
    } else if (userRole === 'HR Employee' || userRole === 'HR Manager' || userRole === 'HR Admin') {
      return 'Create onboarding checklists, reserve equipment and access cards, and track new hire onboarding progress.';
    }
    return 'View your onboarding steps, track progress, receive reminders, and upload required documents.';
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

  const sections = getSections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Onboarding</p>
          <h1 className="text-4xl lg:text-5xl font-semibold">{getRoleTitle()}</h1>
          <p className="text-lg text-slate-200/80">{getRoleDescription()}</p>
          {userRole && (
            <p className="text-sm text-blue-300/60">
              Logged in as: <span className="font-semibold">{userRole}</span>
            </p>
          )}
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/60 hover:bg-white/10 transition"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-cyan-400/10" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <span className="text-sm text-blue-200/80 group-hover:text-blue-100">Open →</span>
                </div>
                <p className="text-sm text-slate-200/80">{section.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center pt-10">
          <Link
            href="/"
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold text-white shadow-lg shadow-blue-900/40"
          >
            ← Back to Modules
          </Link>
        </div>
      </div>
    </div>
  );
}

