import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { JobRequisition, JobTemplate } from '../../types/recruitment';

// Validation schema
const jobSchema = z.object({
  requisitionId: z.string().min(1, 'Required'),
  templateId: z.string().optional(),
  openings: z.number().min(1, 'Must be greater than 0'),
  location: z.string().optional(), // Backend has it as optional
  hiringManagerId: z.string().min(1, 'Required'), // Backend requires this
  postingDate: z.string().optional(), // yyyy-mm-dd
  expiryDate: z.string().optional(),
  publishStatus: z.enum(['draft', 'published']),
});

export type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  onSubmit: (data: JobFormValues) => void;
  onCancel: () => void;
  loading: boolean;
  defaultValues?: Partial<JobFormValues>;
  templates: JobTemplate[];
  templatesError: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({ onSubmit, onCancel, loading, defaultValues, templates, templatesError }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<JobFormValues>({
    defaultValues,
    resolver: zodResolver(jobSchema),
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-xs font-bold mb-1">Requisition ID *</label>
        <input className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('requisitionId')} />
        {errors.requisitionId && <span className="text-red-400 text-xs">{errors.requisitionId.message}</span>}
      </div>

      <div>
        <label className="block text-xs font-bold mb-1">Template</label>
        {templatesError ? (
          <input className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('templateId')} />
        ) : (
          <select className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('templateId')} defaultValue="">
            <option value="">-- Select Template --</option>
            {templates.map(t => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold mb-1">Openings *</label>
        <input type="number" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" min={1} {...register('openings', { valueAsNumber: true })} />
        {errors.openings && <span className="text-red-400 text-xs">{errors.openings.message}</span>}
      </div>

      <div>
        <label className="block text-xs font-bold mb-1">Location</label>
        <input className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('location')} />
        {errors.location && <span className="text-red-400 text-xs">{errors.location.message}</span>}
      </div>

      <div>
        <label className="block text-xs font-bold mb-1">Hiring Manager ID *</label>
        <input className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" placeholder="Enter manager ID" {...register('hiringManagerId')} />
        {errors.hiringManagerId && <span className="text-red-400 text-xs">{errors.hiringManagerId.message}</span>}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">Start Date</label>
          <input type="date" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('postingDate')} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold mb-1">End Date</label>
          <input type="date" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('expiryDate')} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1">Publish Status</label>
        <select className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white" {...register('publishStatus')} defaultValue={defaultValues?.publishStatus || 'draft'}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-700 text-white font-bold hover:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
};

