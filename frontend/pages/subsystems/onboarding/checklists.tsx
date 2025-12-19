import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createOnboardingChecklist, type CreateOnboardingChecklistData } from '../../../services/recruitment';

export default function CreateOnboardingChecklist() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOnboardingChecklistData>({
    name: '',
    description: '',
    tasks: [{ name: '', department: '', notes: '', deadline: '' }],
  });

  const handleAddTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { name: '', department: '', notes: '', deadline: '' }],
    });
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = formData.tasks.filter((_, i) => i !== index);
    setFormData({ ...formData, tasks: newTasks });
  };

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setFormData({ ...formData, tasks: newTasks });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please provide a checklist name');
      return;
    }

    if (formData.tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    // Validate tasks
    for (let i = 0; i < formData.tasks.length; i++) {
      const task = formData.tasks[i];
      if (!task.name.trim()) {
        alert(`Please provide a name for task ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      // Transform tasks to match backend format
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        tasks: formData.tasks.map(task => ({
          name: task.name,
          department: task.department || undefined,
          notes: task.notes || undefined,
          deadline: task.deadline ? new Date(task.deadline).toISOString() : undefined,
        })),
      };

      await createOnboardingChecklist(payload);
      alert('Onboarding checklist created successfully!');
      router.push('/subsystems/onboarding');
    } catch (err: any) {
      console.error('Error creating checklist:', err);
      alert(err?.response?.data?.message || 'Failed to create checklist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Create Onboarding Checklist</h1>
            <p className="text-slate-200/80 mt-2">
              Create a checklist template with tasks for new hires
            </p>
          </div>
          <Link
            href="/subsystems/onboarding"
            className="text-blue-300 hover:text-blue-200 underline text-sm"
          >
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Checklist Info */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Checklist Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Checklist Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                required
                placeholder="e.g., Standard Onboarding Checklist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                rows={3}
                placeholder="Optional description for this checklist..."
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Tasks</h2>
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
              >
                + Add Task
              </button>
            </div>

            {formData.tasks.map((task, index) => (
              <div key={`task-${index}-${task.name || task.department || Date.now()}`} className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Task {index + 1}</h3>
                  {formData.tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Task Name *</label>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    required
                    placeholder="e.g., Sign Employment Contract"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <input
                      type="text"
                      value={task.department}
                      onChange={(e) => handleTaskChange(index, 'department', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                      placeholder="e.g., IT, HR, Finance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <input
                      type="date"
                      value={task.deadline}
                      onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={task.notes}
                    onChange={(e) => handleTaskChange(index, 'notes', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                    rows={2}
                    placeholder="Additional instructions or notes..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Checklist'}
            </button>
            <Link
              href="/subsystems/onboarding"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

