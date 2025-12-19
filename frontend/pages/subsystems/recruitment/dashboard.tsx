import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import { Application, ApplicationStage, ApplicationStatus } from '../../../types/recruitment';

interface CandidateWithProgress {
  candidateId: string;
  candidateNumber: string;
  name: string;
  email: string;
  applications: Application[];
  overallProgress: number;
  latestStatus: ApplicationStatus;
  latestStage: ApplicationStage;
}

export default function RecruitmentDashboard() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Block candidates from accessing this page
  useEffect(() => {
    const role = localStorage.getItem('role');
    const userType = localStorage.getItem('userType');
    if (userType === 'CANDIDATE' || role === 'Job Candidate' || role === 'JOB_CANDIDATE') {
      router.push('/subsystems/recruitment');
      return;
    }
    fetchCandidatesWithProgress();
  }, [router]);

  const fetchCandidatesWithProgress = async () => {
    try {
      setLoading(true);
      // Fetch all applications
      const applicationsResponse = await apiClient.get<Application[]>('/applications');
      const applications = applicationsResponse.data;

      // Group applications by candidate
      const candidateMap = new Map<string, CandidateWithProgress>();

      // Note: Candidate data should be populated by backend
      // If not populated, we'll show a placeholder that's not an ObjectId

      for (const app of applications) {
        // Handle candidateId - it might be populated or just an ObjectId
        let candidateId: string;
        let candidateNumber: string = 'N/A';
        let firstName: string = '';
        let lastName: string = '';
        let email: string = 'N/A';
        
        if (app.candidateId) {
          if (typeof app.candidateId === 'object' && app.candidateId !== null) {
            // It's populated
            const candidateObj = app.candidateId as any;
            candidateId = candidateObj?._id?.toString() || (candidateObj?.toString ? candidateObj.toString() : String(candidateObj));
            candidateNumber = candidateObj?.candidateNumber || candidateNumber;
            firstName = candidateObj?.firstName || firstName;
            lastName = candidateObj?.lastName || lastName;
            email = candidateObj?.email || candidateObj?.personalEmail || candidateObj?.workEmail || email;
          } else {
            // It's just an ObjectId string
            candidateId = String(app.candidateId);
          }
        } else {
          candidateId = `unknown-${app._id}`;
        }

        // Use candidateNumber as the display identifier - NEVER show ObjectId
        // If candidateNumber is not available, generate a placeholder that looks like a candidate number
        const candidateIdStr = candidateId ? String(candidateId) : '';
        const displayNumber = candidateNumber !== 'N/A' 
          ? candidateNumber 
          : candidateIdStr && candidateIdStr.length >= 6
            ? `CAND${candidateIdStr.slice(-6).toUpperCase()}`
            : `CAND${String(Math.random()).slice(2, 8)}`;
        const name = firstName && lastName 
          ? `${firstName} ${lastName}` 
          : displayNumber;

        if (!candidateMap.has(candidateId)) {
          candidateMap.set(candidateId, {
            candidateId,
            candidateNumber: displayNumber,
            name,
            email,
            applications: [],
            overallProgress: 0,
            latestStatus: app.status,
            latestStage: app.currentStage,
          });
        }

        const candidate = candidateMap.get(candidateId)!;
        candidate.applications.push(app);

        // Update latest status/stage
        if (new Date(app.createdAt || 0) > new Date(candidate.applications[0]?.createdAt || 0)) {
          candidate.latestStatus = app.status;
          candidate.latestStage = app.currentStage;
        }
      }

      // Calculate progress for each candidate
      const candidatesArray = Array.from(candidateMap.values()).map(candidate => {
        // Calculate overall progress based on stage
        const stageProgress = {
          [ApplicationStage.SCREENING]: 20,
          [ApplicationStage.DEPARTMENT_INTERVIEW]: 40,
          [ApplicationStage.HR_INTERVIEW]: 60,
          [ApplicationStage.OFFER]: 80,
        };

        const baseProgress = stageProgress[candidate.latestStage] || 0;
        
        // Add status-based progress
        let statusBonus = 0;
        if (candidate.latestStatus === ApplicationStatus.IN_PROCESS) {
          statusBonus = 10;
        } else if (candidate.latestStatus === ApplicationStatus.OFFER) {
          statusBonus = 15;
        } else if (candidate.latestStatus === ApplicationStatus.HIRED) {
          statusBonus = 20;
        }

        candidate.overallProgress = Math.min(100, baseProgress + statusBonus);
        return candidate;
      });

      setCandidates(candidatesArray);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setError(err?.response?.data?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.HIRED:
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case ApplicationStatus.OFFER:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case ApplicationStatus.IN_PROCESS:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case ApplicationStatus.SUBMITTED:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      case ApplicationStatus.REJECTED:
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
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
          <p className="text-lg">Loading candidates...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Candidates Dashboard</h1>
              <p className="text-lg text-slate-200/80">
                View all candidates with their application progress and status
              </p>
            </div>
            <Link
              href="/subsystems/recruitment"
              className="text-blue-300 hover:text-blue-200 underline text-sm self-start"
            >
              ← Back
            </Link>
          </div>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">Total Candidates</p>
            <p className="text-2xl font-semibold mt-1">{candidates.length}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">In Process</p>
            <p className="text-2xl font-semibold mt-1">
              {candidates.filter(c => c.latestStatus === ApplicationStatus.IN_PROCESS).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">Offers Extended</p>
            <p className="text-2xl font-semibold mt-1">
              {candidates.filter(c => c.latestStatus === ApplicationStatus.OFFER).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-slate-400">Hired</p>
            <p className="text-2xl font-semibold mt-1">
              {candidates.filter(c => c.latestStatus === ApplicationStatus.HIRED).length}
            </p>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold">All Candidates</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Applications</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Current Stage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.candidateId} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-slate-400">{candidate.candidateNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{candidate.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                          {candidate.applications.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getProgressColor(candidate.overallProgress)}`}
                              style={{ width: `${candidate.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {candidate.overallProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm capitalize">
                          {candidate.latestStage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.latestStatus)}`}
                        >
                          {candidate.latestStatus.replace('_', ' ').toUpperCase()}
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

