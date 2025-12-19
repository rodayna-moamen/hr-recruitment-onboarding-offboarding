import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type UserRole = 'HR Employee' | 'HR Manager' | 'HR Admin' | 'Employee' | 'System Admin' | null;

export default function Offboarding() {
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
      } else if (normalizedRole === 'System Admin' || normalizedRole === 'SYSTEM_ADMIN') {
        setUserRole('System Admin');
      } else {
        setUserRole('Employee');
      }
    }
    setLoading(false);
  }, []);

  // Employee sections
  const employeeSections = [
    { href: '/subsystems/offboarding/resignation', title: 'Submit Resignation', desc: 'Submit resignation request and track status' },
    { href: '/subsystems/offboarding/my-offboarding', title: 'My Offboarding Tasks', desc: 'View and complete offboarding tasks' },
  ];

  // HR Employee, Manager, Admin sections
  const hrSections = [
    { href: '/subsystems/offboarding/resignation', title: 'Resignation Requests', desc: 'Review and manage employee resignation requests' },
    { href: '/subsystems/offboarding/terminations', title: 'Termination Management', desc: 'Initiate terminations based on performance data and manager requests' },
    { href: '/subsystems/offboarding/offboarding-tasks', title: 'Offboarding Checklists', desc: 'Manage clearance checklists and multi-department sign-offs' },
  ];
  
  // HR Manager only sections (additional features)
  const hrManagerOnlySections = [
    { href: '/subsystems/offboarding/terminations', title: 'Benefits & Final Pay', desc: 'Trigger benefits termination and final pay calculations' },
  ];

  // System Admin sections
  const systemAdminSections = [
    { href: '/subsystems/offboarding/revoke-access', title: 'Revoke System Access', desc: 'Revoke system and account access upon termination for security' },
  ];

  // Determine which sections to show
  const getSections = () => {
    if (userRole === 'System Admin') {
      return systemAdminSections;
    } else if (userRole === 'HR Employee' || userRole === 'HR Manager' || userRole === 'HR Admin') {
      // HR Managers get additional sections
      if (userRole === 'HR Manager' || userRole === 'HR Admin') {
        return [...hrSections, ...hrManagerOnlySections];
      }
      return hrSections;
    } else {
      return employeeSections;
    }
  };

  const getRoleTitle = () => {
    if (userRole === 'System Admin') {
      return 'System Access Revocation';
    } else if (userRole === 'HR Employee' || userRole === 'HR Manager' || userRole === 'HR Admin') {
      return 'Offboarding Management';
    }
    return 'Offboarding Portal';
  };

  const getRoleDescription = () => {
    if (userRole === 'System Admin') {
      return 'Revoke system and account access upon termination to maintain security.';
    } else if (userRole === 'HR Employee' || userRole === 'HR Manager' || userRole === 'HR Admin') {
      return 'Initiate termination reviews, manage offboarding checklists, coordinate multi-department clearance sign-offs, and trigger benefits termination and final pay calculations.';
    }
    return 'Submit resignation requests and track your offboarding tasks.';
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
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Offboarding</p>
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

