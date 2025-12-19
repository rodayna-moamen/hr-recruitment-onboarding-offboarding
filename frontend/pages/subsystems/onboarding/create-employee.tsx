import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';

interface Candidate {
  _id: string;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  nationalId: string;
  phone?: string;
  address?: any;
}

interface Offer {
  _id: string;
  candidateId: string;
  role: string;
  department?: string;
  grossSalary: number;
  applicantResponse: string; // Fixed: Use applicantResponse, not candidateResponse
}

export default function CreateEmployee() {
  const router = useRouter();
  const [candidatesWithOffers, setCandidatesWithOffers] = useState<Array<{
    candidate: Candidate;
    offer: Offer;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [formData, setFormData] = useState({
    employeeNumber: '',
    workEmail: '',
    dateOfHire: '',
    primaryDepartmentId: '',
    primaryPositionId: '',
    contractType: '',
    workType: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidatesWithAcceptedOffers();
  }, []);

  useEffect(() => {
    if (selectedCandidateId) {
      const selected = candidatesWithOffers.find(c => c.candidate._id === selectedCandidateId);
      if (selected) {
        const candidate = selected.candidate;
        const offer = selected.offer;
        
        // Convert CAND to EMP
        const candidateNumber = candidate.candidateNumber;
        const employeeNumber = candidateNumber.replace('CAND', 'EMP');
        
        setFormData({
          employeeNumber,
          workEmail: candidate.email,
          dateOfHire: new Date().toISOString().split('T')[0],
          primaryDepartmentId: offer.department || '',
          primaryPositionId: '',
          contractType: '',
          workType: '',
        });
      }
    }
  }, [selectedCandidateId, candidatesWithOffers]);

  const fetchCandidatesWithAcceptedOffers = async () => {
    try {
      setLoading(true);
      
      // Fetch all offers
      const offersResponse = await apiClient.get<Offer[]>('/offers');
      const offers = offersResponse.data.filter(o => o.applicantResponse === 'accepted' || o.applicantResponse === 'ACCEPTED');
      
      // Fetch candidates for these offers
      const candidatesData: Array<{ candidate: Candidate; offer: Offer }> = [];
      
      for (const offer of offers) {
        try {
          // Fetch candidate details
          const candidateId = (offer.candidateId as any)?._id || offer.candidateId;
          const candidateResponse = await apiClient.get<Candidate>(`/employee-profile/candidates/${candidateId}`);
          const candidate = candidateResponse.data;
          
          // Check if employee already exists
          try {
            await apiClient.get(`/employee-profile/employee/${candidate.candidateNumber.replace('CAND', 'EMP')}`);
            // Employee already exists, skip
            continue;
          } catch {
            // Employee doesn't exist, include in list
            candidatesData.push({ candidate, offer });
          }
        } catch (err) {
          console.error('Error fetching candidate:', err);
        }
      }
      
      setCandidatesWithOffers(candidatesData);
    } catch (err: any) {
      console.error('Error fetching candidates with offers:', err);
      // Handle network errors gracefully
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        setError('Cannot connect to the server. Please ensure the backend is running on port 4000.');
      } else {
        setError(err?.response?.data?.message || 'Failed to load candidates');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidateId) {
      alert('Please select a candidate');
      return;
    }

    const selected = candidatesWithOffers.find(c => c.candidate._id === selectedCandidateId);
    if (!selected) return;

    try {
      setSubmitting(true);
      
      const candidate = selected.candidate;
      const offer = selected.offer;
      
      // Create employee using candidate data
      const employeeData = {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        nationalId: candidate.nationalId,
        employeeNumber: formData.employeeNumber,
        dateOfHire: formData.dateOfHire,
        workEmail: formData.workEmail,
        personalEmail: candidate.email,
        primaryDepartmentId: formData.primaryDepartmentId,
        primaryPositionId: formData.primaryPositionId || undefined,
        contractType: formData.contractType || undefined,
        workType: formData.workType || undefined,
        address: candidate.address || undefined,
        mobilePhone: candidate.phone || undefined,
        // Password will be the same as candidate's password (handled by backend)
        // The backend should fetch the candidate's password hash
      };

      await apiClient.post('/employee-profile/employees', employeeData);
      alert('Employee created successfully! The candidate ID has been converted from CAND to EMP.');
      router.push('/subsystems/onboarding');
    } catch (err: any) {
      console.error('Error creating employee:', err);
      alert(err?.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Create Employee from Candidate</h1>
            <p className="text-slate-200/80 mt-2">
              Convert candidates who accepted offers to employees (CAND → EMP)
            </p>
          </div>
          <Link
            href="/subsystems/onboarding"
            className="text-blue-300 hover:text-blue-200 underline text-sm"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-center">
            <p className="text-red-300">{error}</p>
            <p className="text-sm text-slate-300/60 mt-2">
              Please ensure the backend server is running on port 4000.
            </p>
          </div>
        )}

        {!error && candidatesWithOffers.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
            <p className="text-slate-300">No candidates with accepted offers found.</p>
          </div>
        ) : !error && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Candidate Selection */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">Select Candidate</h2>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                required
              >
                <option value="">Select a candidate...</option>
                {candidatesWithOffers.map(({ candidate, offer }) => (
                  <option key={candidate._id} value={candidate._id}>
                    {candidate.firstName} {candidate.lastName} ({candidate.candidateNumber}) - {offer.role}
                  </option>
                ))}
              </select>
            </div>

            {selectedCandidateId && (
              <>
                {/* Employee Information */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
                  <h2 className="text-2xl font-semibold mb-4">Employee Information</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Employee Number *</label>
                      <input
                        type="text"
                        value={formData.employeeNumber}
                        onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                        required
                        placeholder="EMP12345"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Automatically converted from CAND to EMP
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Work Email *</label>
                      <input
                        type="email"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Hire *</label>
                      <input
                        type="date"
                        value={formData.dateOfHire}
                        onChange={(e) => setFormData({ ...formData, dateOfHire: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Department ID *</label>
                      <input
                        type="text"
                        value={formData.primaryDepartmentId}
                        onChange={(e) => setFormData({ ...formData, primaryDepartmentId: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                        required
                        placeholder="Department ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Position ID</label>
                      <input
                        type="text"
                        value={formData.primaryPositionId}
                        onChange={(e) => setFormData({ ...formData, primaryPositionId: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                        placeholder="Position ID (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contract Type</label>
                      <select
                        value={formData.contractType}
                        onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                      >
                        <option value="">Select...</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Work Type</label>
                      <select
                        value={formData.workType}
                        onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                      >
                        <option value="">Select...</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-300">
                      <strong>Note:</strong> The employee will be created with the same password as the candidate.
                      The username will change from {candidatesWithOffers.find(c => c.candidate._id === selectedCandidateId)?.candidate.candidateNumber} to {formData.employeeNumber || 'EMP...'}.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Employee'}
                  </button>
                  <Link
                    href="/subsystems/onboarding"
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

