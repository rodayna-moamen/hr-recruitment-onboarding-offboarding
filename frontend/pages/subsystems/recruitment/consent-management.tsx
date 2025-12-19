import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsentHistory, withdrawConsent } from '../../../services/recruitment';

type ConsentHistoryItem = {
  type: string;
  timestamp: string;
  applicationId?: string;
  consentGiven?: boolean;
  consentWithdrawn?: boolean;
};

export default function ConsentManagement() {
  const [consentHistory, setConsentHistory] = useState<ConsentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string>('');

  useEffect(() => {
    // Get candidate ID from localStorage or profile
    const userId = localStorage.getItem('userId') || localStorage.getItem('candidateId');
    if (userId) {
      setCandidateId(userId);
      fetchConsentHistory(userId);
    } else {
      setError('Candidate ID not found. Please ensure you are logged in.');
      setLoading(false);
    }
  }, []);

  const fetchConsentHistory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConsentHistory(id);
      setConsentHistory(response.data || []);
    } catch (err: any) {
      console.error('Error fetching consent history:', err);
      setError(err?.response?.data?.message || 'Failed to load consent history');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw consent for this application? This action may affect your application status.')) {
      return;
    }

    try {
      await withdrawConsent(applicationId, candidateId);
      alert('Consent withdrawn successfully. Your data will be anonymized per GDPR requirements.');
      // Refresh consent history
      fetchConsentHistory(candidateId);
    } catch (err: any) {
      console.error('Error withdrawing consent:', err);
      alert(err?.response?.data?.message || 'Failed to withdraw consent');
    }
  };

  const getConsentTypeLabel = (type: string) => {
    if (type === 'consent_given') return 'Consent Given';
    if (type === 'consent_withdrawn') return 'Consent Withdrawn';
    return type;
  };

  const getConsentTypeColor = (type: string) => {
    if (type === 'consent_given') return 'bg-green-500/20 text-green-300 border-green-500/40';
    if (type === 'consent_withdrawn') return 'bg-red-500/20 text-red-300 border-red-500/40';
    return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading consent history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Consent Management</h1>
              <p className="text-lg text-slate-200/80">
                View and manage your data processing consent (GDPR Compliance)
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

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Consent History</h2>
          <p className="text-sm text-slate-200/70">
            All consent-related activities are logged for GDPR compliance. You can withdraw consent for any application.
          </p>

          {consentHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-200/60">No consent history found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {consentHistory.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-slate-900/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm border ${getConsentTypeColor(item.type)}`}>
                        {getConsentTypeLabel(item.type)}
                      </span>
                      {item.applicationId && (
                        <span className="text-sm text-slate-300">Application: {item.applicationId}</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {item.consentGiven && item.type === 'consent_given' && item.applicationId && (
                    <button
                      onClick={() => handleWithdrawConsent(item.applicationId!)}
                      className="text-sm text-red-400 hover:text-red-300 underline"
                    >
                      Withdraw Consent
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-6">
          <h3 className="text-lg font-semibold mb-2">Your Rights (GDPR)</h3>
          <ul className="space-y-2 text-sm text-slate-200/80">
            <li>• You have the right to withdraw consent at any time</li>
            <li>• Withdrawing consent will anonymize your data per GDPR requirements</li>
            <li>• Your application status may be affected if consent is withdrawn</li>
            <li>• All consent activities are logged for compliance purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

