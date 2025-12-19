import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../../lib/apiClient';
import { JobTemplate } from '../../../types/recruitment';

export default function Templates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check if user has HR Manager or HR Admin role
    const role = localStorage.getItem('role');
    setUserRole(role);
    
    const allowedRoles = ['HR Manager', 'HR_MANAGER', 'HR Admin', 'HR_ADMIN'];
    if (!role || !allowedRoles.includes(role)) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }
    
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      fetchTemplates();
    }
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    qualifications: [] as string[],
    skills: [] as string[],
  });

  // Removed duplicate useEffect - now handled above

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<JobTemplate[]>('/templates');
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err?.response?.data?.message || 'Could not load templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        qualifications: formData.qualifications.filter((q) => q.trim()),
        skills: formData.skills.filter((s) => s.trim()),
      };

      if (editingTemplate) {
        await apiClient.put(`/templates/${editingTemplate._id}`, payload);
      } else {
        await apiClient.post('/templates', payload);
      }

      setShowCreateForm(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (err: any) {
      console.error('Error saving template:', err);
      alert(err?.response?.data?.message || 'Failed to save template.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await apiClient.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err: any) {
      console.error('Error deleting template:', err);
      alert(err?.response?.data?.message || 'Failed to delete template.');
    }
  };

  const handleEdit = (template: JobTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      department: template.department,
      description: template.description || '',
      qualifications: template.qualifications || [],
      skills: template.skills || [],
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      description: '',
      qualifications: [],
      skills: [],
    });
  };

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [...formData.qualifications, ''],
    });
  };

  const updateQualification = (index: number, value: string) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = value;
    setFormData({ ...formData, qualifications: newQualifications });
  };

  const removeQualification = (index: number) => {
    const newQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData({ ...formData, qualifications: newQualifications });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ''],
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <h1 className="text-4xl font-semibold text-red-300">Access Denied</h1>
          <p className="text-lg text-slate-200/80">
            This page is only accessible to HR Managers and HR Admins.
          </p>
          <Link
            href="/subsystems/recruitment"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Return to Recruitment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Recruitment</p>
              <h1 className="text-4xl lg:text-5xl font-semibold">Job Templates</h1>
              <p className="text-lg text-slate-200/80">
                Create and manage reusable job templates for requisitions.
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

        <button
          onClick={() => {
            resetForm();
            setEditingTemplate(null);
            setShowCreateForm(true);
          }}
          className="rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
        >
          + Create New Template
        </button>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Title *</span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Department *</span>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm text-slate-100">Description</span>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                  />
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-100">Qualifications</span>
                    <button
                      type="button"
                      onClick={addQualification}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add Qualification
                    </button>
                  </div>
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={qual}
                        onChange={(e) => updateQualification(index, e.target.value)}
                        placeholder="Qualification requirement"
                        className="flex-1 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-100">Skills</span>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add Skill
                    </button>
                  </div>
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder="Required skill"
                        className="flex-1 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="px-3 py-2 text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition px-4 py-2 font-semibold text-white"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <div className="text-center text-slate-200/80">Loading templates...</div>}

        {error && !loading && (
          <div className="text-center text-red-200 rounded-2xl border border-red-400/40 bg-red-500/10 p-6">
            {error}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="rounded-2xl border border-blue-400/40 bg-blue-500/10 p-6 text-center">
            <p className="text-slate-200">No templates found. Create your first template above.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-blue-400/60 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{template.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="px-2 py-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="px-2 py-1 text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-200/80">Department: {template.department}</p>
                {template.description && (
                  <p className="text-sm text-slate-200/60 line-clamp-2">{template.description}</p>
                )}
                {template.qualifications && template.qualifications.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Qualifications:</p>
                    <p className="text-xs text-slate-300">{template.qualifications.length} listed</p>
                  </div>
                )}
                {template.skills && template.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Skills:</p>
                    <p className="text-xs text-slate-300">{template.skills.length} listed</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

