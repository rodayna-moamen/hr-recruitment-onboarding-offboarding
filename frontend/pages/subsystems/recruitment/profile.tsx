import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';

export default function CandidateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    personalEmail: '',
    mobilePhone: '',
    homePhone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationalId: '',
    address: {
      city: '',
      streetAddress: '',
      country: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || localStorage.getItem('candidateId');
      if (!userId) {
        setError('User ID not found. Please log in.');
        setLoading(false);
        return;
      }

      // Try to fetch candidate profile
      try {
        const response = await apiClient.get(`/employee-profile/candidates/${userId}`);
        const candidate = response.data;
        setFormData({
          firstName: candidate.firstName || '',
          lastName: candidate.lastName || '',
          middleName: candidate.middleName || '',
          personalEmail: candidate.personalEmail || '',
          mobilePhone: candidate.mobilePhone || '',
          homePhone: candidate.homePhone || '',
          dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split('T')[0] : '',
          gender: candidate.gender || '',
          maritalStatus: candidate.maritalStatus || '',
          nationalId: candidate.nationalId || '',
          address: {
            city: candidate.address?.city || '',
            streetAddress: candidate.address?.streetAddress || '',
            country: candidate.address?.country || '',
          },
        });
      } catch (err: any) {
        // If endpoint doesn't exist or fails, show form with empty data
        console.warn('Could not fetch candidate profile:', err);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const userId = localStorage.getItem('userId') || localStorage.getItem('candidateId');
      if (!userId) {
        setError('User ID not found. Please log in.');
        return;
      }

      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      };

      // Try to update candidate profile
      try {
        await apiClient.patch(`/employee-profile/candidates/${userId}`, payload);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        // If endpoint doesn't exist, show a message
        if (err?.response?.status === 404) {
          setError('Profile update endpoint not available. Please contact support.');
        } else {
          setError(err?.response?.data?.message || 'Failed to update profile');
        }
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading profile...</p>
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
              <h1 className="text-4xl lg:text-5xl font-semibold">My Profile</h1>
              <p className="text-lg text-slate-200/80">
                Update your personal information and contact details
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
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Middle Name</label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Personal Email *</label>
              <input
                type="email"
                required
                value={formData.personalEmail}
                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mobile Phone</label>
              <input
                type="tel"
                value={formData.mobilePhone}
                onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Home Phone</label>
              <input
                type="tel"
                value={formData.homePhone}
                onChange={(e) => setFormData({ ...formData, homePhone: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Marital Status</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">National ID</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address.streetAddress}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, streetAddress: e.target.value }
                  })}
                  className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                  className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value }
                  })}
                  className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/subsystems/recruitment"
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

