import Link from 'next/link';

const sections = [
  { href: '/subsystems/recruitment/careers', title: 'Careers Portal', desc: 'Public listings and apply flow' },
  { href: '/subsystems/recruitment/jobs', title: 'Job Requisitions', desc: 'Create, publish, and manage jobs' },
  { href: '/subsystems/recruitment/applications', title: 'Applications Pipeline', desc: 'Track candidates through stages' },
  { href: '/subsystems/recruitment/interviews', title: 'Interviews', desc: 'Schedule and collect feedback' },
  { href: '/subsystems/recruitment/offers', title: 'Offers', desc: 'Draft, approve, and send offers' },
  { href: '/subsystems/recruitment/analytics', title: 'Analytics', desc: 'Hiring KPIs and funnel metrics' },
];

export default function Recruitment() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
          <h1 className="text-4xl lg:text-5xl font-semibold">Hire pipeline, end-to-end</h1>
          <p className="text-lg text-slate-200/80">
            Navigate to the area you want to build next: public careers, internal jobs, applications, interviews,
            offers, and analytics.
          </p>
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
