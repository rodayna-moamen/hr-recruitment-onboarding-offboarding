import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import { Offer, OfferResponseStatus } from '../../../types/recruitment';

export default function MyOffers() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string>('');

  useEffect(() => {
    const userId = localStorage.getItem('userId') || localStorage.getItem('candidateId');
    if (userId) {
      setCandidateId(userId);
      fetchMyOffers(userId);
    } else {
      setError('Could not identify candidate. Please ensure you are logged in.');
      setLoading(false);
    }
  }, []);

  const fetchMyOffers = async (candidateId: string) => {
    try {
      setLoading(true);
      // Fetch all offers and filter by candidate
      const res = await apiClient.get<Offer[]>('/offers');
      const allOffers = Array.isArray(res.data) ? res.data : [];
      
      // Filter offers for this candidate
      const myOffers = allOffers.filter(offer => {
        if (!offer.candidateId) return false;
        
        const offerCandidateId = (offer.candidateId as any)?._id || offer.candidateId;
        if (!offerCandidateId) return false;
        
        // Safely convert to string
        const offerIdStr = offerCandidateId.toString();
        
        return offerIdStr === candidateId;
      });
      
      setOffers(myOffers);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err?.response?.data?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToOffer = async (offerId: string, response: 'accept' | 'reject') => {
    try {
      await apiClient.post(`/offers/${offerId}/${response}`, {});
      alert(`Offer ${response === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      await fetchMyOffers(candidateId);
    } catch (err: any) {
      console.error('Error responding to offer:', err);
      alert(err?.response?.data?.message || 'Failed to respond to offer');
    }
  };

  const getResponseStatusColor = (status: OfferResponseStatus) => {
    switch (status) {
      case OfferResponseStatus.ACCEPTED:
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case OfferResponseStatus.REJECTED:
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading offers...</p>
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">My Offers</h1>
            <p className="text-slate-200/80 mt-2">
              View and respond to job offers
            </p>
          </div>
          <Link
            href="/subsystems/recruitment"
            className="text-blue-300 hover:text-blue-200 underline text-sm"
          >
            ← Back
          </Link>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <p className="text-slate-300">No offers received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white/5 rounded-lg p-6 border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Job Offer</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Position:</strong> {offer.role || 'N/A'}
                      </p>
                      <p>
                        <strong>Department:</strong> N/A
                      </p>
                      <p>
                        <strong>Gross Salary:</strong> ${offer.grossSalary?.toLocaleString() || 'N/A'}
                      </p>
                      {offer.signingBonus && (
                        <p>
                          <strong>Signing Bonus:</strong> ${offer.signingBonus.toLocaleString()}
                        </p>
                      )}
                      {offer.conditions && (
                        <p>
                          <strong>Notes:</strong> {offer.conditions}
                        </p>
                      )}
                      {offer.createdAt && (
                        <p className="text-xs text-slate-400 mt-2">
                          Received: {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getResponseStatusColor(offer.applicantResponse || OfferResponseStatus.PENDING)}`}
                  >
                    {offer.applicantResponse
                      ? offer.applicantResponse.toUpperCase()
                      : 'PENDING'}
                  </span>
                </div>

                {/* Action buttons - only show if pending */}
                {offer.applicantResponse === OfferResponseStatus.PENDING && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleRespondToOffer(offer._id, 'accept')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition"
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={() => handleRespondToOffer(offer._id, 'reject')}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition"
                    >
                      Reject Offer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

