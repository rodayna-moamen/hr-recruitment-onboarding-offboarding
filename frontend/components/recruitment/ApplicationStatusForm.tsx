import React from 'react';
import { ApplicationStatus } from '../../types/recruitment';

const nextStatuses = [
  { value: 'in_process', label: 'In Process' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  // Rejection handled separately
];

export interface ApplicationStatusFormProps {
  currentStatus: ApplicationStatus;
  onUpdateStatus: (newStatus: ApplicationStatus | string) => void;
  loading: boolean;
  disabled?: boolean;
}

export const ApplicationStatusForm: React.FC<ApplicationStatusFormProps> = ({ currentStatus, onUpdateStatus, loading, disabled }) => {
  return (
    <form
      className="flex gap-2 items-center"
      onSubmit={e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const value = (form.elements.namedItem('status') as HTMLSelectElement).value;
        onUpdateStatus(value);
      }}
    >
      <select
        className="px-2 py-1 rounded bg-slate-700 text-slate-100"
        name="status"
        disabled={disabled || loading}
        defaultValue={''}
      >
        <option value="" disabled>
          Choose next status
        </option>
        {nextStatuses.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.value === currentStatus}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-3 py-1 bg-blue-700 text-white rounded font-semibold disabled:bg-gray-600"
        disabled={loading || disabled}
      >
        {loading ? 'Saving...' : 'Update'}
      </button>
    </form>
  );
};

