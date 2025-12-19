import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type UserRole = 'Job Candidate' | 'HR Employee' | 'HR Manager' | 'HR Admin' | 'Recruiter' | null;

export default function Recruitment() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role');
    if (role) {
      // Map backend role to frontend role
      const normalizedRole = role.trim();
      if (normalizedRole === 'Job Candidate' || normalizedRole === 'JOB_CANDIDATE') {
        setUserRole('Job Candidate');
      } else if (normalizedRole === 'HR Employee' || normalizedRole === 'HR_EMPLOYEE') {
        setUserRole('HR Employee');
      } else if (normalizedRole === 'HR Manager' || normalizedRole === 'HR_MANAGER') {
        setUserRole('HR Manager');
      } else if (normalizedRole === 'HR Admin' || normalizedRole === 'HR_ADMIN') {
        setUserRole('HR Admin');
      } else if (normalizedRole === 'Recruiter' || normalizedRole === 'RECRUITER') {
        setUserRole('Recruiter');
      }
    }
    setLoading(false);
  }, []);

  // Candidate sections
  const candidateSections = [
    { href: '/subsystems/recruitment/careers', title: 'Browse Jobs', desc: 'View and apply for open positions' },
    { href: '/subsystems/recruitment/my-applications', title: 'My Applications', desc: 'Track your application status' },
    { href: '/subsystems/recruitment/consent-management', title: 'Consent Management', desc: 'View and manage your data processing consent' },
    { href: '/subsystems/recruitment/onboarding', title: 'Onboarding Tracker', desc: 'View and complete onboarding tasks' },
    { href: '/subsystems/recruitment/resignation', title: 'Resignation Request', desc: 'Submit and track resignation requests' },
  ];

  // HR Employee sections
  const hrEmployeeSections = [
    { href: '/subsystems/recruitment/careers', title: 'Careers Portal', desc: 'Preview and publish jobs' },
    { href: '/subsystems/recruitment/jobs', title: 'Job Requisitions', desc: 'Create, publish, and manage jobs' },
    { href: '/subsystems/recruitment/applications', title: 'Applications Pipeline', desc: 'Track candidates through stages' },
    { href: '/subsystems/recruitment/interviews', title: 'Interviews', desc: 'Schedule and collect feedback' },
    { href: '/subsystems/recruitment/offers', title: 'Offers', desc: 'Draft, approve, and send offers' },
    { href: '/subsystems/recruitment/referrals', title: 'Referrals', desc: 'Tag candidates as referrals' },
  ];

  // HR Manager sections
  const hrManagerSections = [
    { href: '/subsystems/recruitment/templates', title: 'Job Templates', desc: 'Create and manage reusable job templates' },
    { href: '/subsystems/recruitment/jobs', title: 'Job Requisitions', desc: 'Create, publish, and manage jobs' },
    { href: '/subsystems/recruitment/applications', title: 'Applications Pipeline', desc: 'Track candidates through stages' },
    { href: '/subsystems/recruitment/interviews', title: 'Interviews', desc: 'Schedule and collect feedback' },
    { href: '/subsystems/recruitment/offers', title: 'Offers', desc: 'Draft, approve, and send offers' },
    { href: '/subsystems/recruitment/analytics', title: 'Analytics', desc: 'Monitor recruitment progress and KPIs' },
    { href: '/subsystems/recruitment/referrals', title: 'Referrals', desc: 'Tag candidates as referrals' },
    { href: '/subsystems/recruitment/terminations', title: 'Terminations', desc: 'Initiate termination reviews and manage offboarding' },
  ];

  // Determine which sections to show
  const getSections = () => {
    if (userRole === 'Job Candidate') {
      return candidateSections;
    } else if (userRole === 'HR Employee' || userRole === 'Recruiter') {
      return hrEmployeeSections;
    } else if (userRole === 'HR Manager' || userRole === 'HR Admin') {
      return hrManagerSections;
    }
    // Default: show all (for unauthenticated or unknown roles)
    return [
      { href: '/subsystems/recruitment/careers', title: 'Careers Portal', desc: 'Public listings and apply flow' },
      { href: '/subsystems/recruitment/templates', title: 'Job Templates', desc: 'Create and manage reusable job templates' },
      { href: '/subsystems/recruitment/jobs', title: 'Job Requisitions', desc: 'Create, publish, and manage jobs' },
      { href: '/subsystems/recruitment/applications', title: 'Applications Pipeline', desc: 'Track candidates through stages' },
      { href: '/subsystems/recruitment/interviews', title: 'Interviews', desc: 'Schedule and collect feedback' },
      { href: '/subsystems/recruitment/offers', title: 'Offers', desc: 'Draft, approve, and send offers' },
      { href: '/subsystems/recruitment/referrals', title: 'Referrals', desc: 'Tag candidates as referrals for priority screening' },
      { href: '/subsystems/recruitment/analytics', title: 'Analytics', desc: 'Hiring KPIs and funnel metrics' },
    ];
  };

  const getRoleTitle = () => {
    if (userRole === 'Job Candidate') {
      return 'Candidate Portal';
    } else if (userRole === 'HR Employee' || userRole === 'Recruiter') {
      return 'HR Employee Dashboard';
    } else if (userRole === 'HR Manager' || userRole === 'HR Admin') {
      return 'HR Manager Dashboard';
    }
    return 'Recruitment';
  };

  const getRoleDescription = () => {
    if (userRole === 'Job Candidate') {
      return 'Browse open positions, apply for jobs, and track your application status.';
    } else if (userRole === 'HR Employee' || userRole === 'Recruiter') {
      return 'Manage applications, schedule interviews, and process offers.';
    } else if (userRole === 'HR Manager' || userRole === 'HR Admin') {
      return 'Define templates, monitor recruitment progress, and manage the hiring pipeline.';
    }
    return 'Navigate to the area you want to build next: public careers, internal jobs, applications, interviews, offers, and analytics.';
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
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
      </div>
    </div>
  );
}
