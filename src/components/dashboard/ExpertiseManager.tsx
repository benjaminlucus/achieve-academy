'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, Search } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { DEFAULT_TEACHING_LANGUAGES } from '@/lib/constants';

export interface IExpertiseCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IExpertiseSubject {
  _id: string;
  category: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IEducationLevel {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface IExpertise {
  _id: string;
  tutor: string;
  category: string | IExpertiseCategory;
  subject: string | IExpertiseSubject;
  teachingLevels: (string | IEducationLevel)[];
  teachingLanguages: string[];
  experience: number;
  hourlyRate?: number;
  certificates?: any[];
  specialNotes?: string;
  isActive: boolean;
  visibility: 'public' | 'private' | 'connections';
  createdAt: string;
  updatedAt: string;
}

interface ExpertiseManagerProps {
  currentUserId: string;
}

export const ExpertiseManager: React.FC<ExpertiseManagerProps> = ({ currentUserId }) => {
  const [categories, setCategories] = useState<IExpertiseCategory[]>([]);
  const [subjects, setSubjects] = useState<IExpertiseSubject[]>([]);
  const [levels, setLevels] = useState<IEducationLevel[]>([]);
  const [expertises, setExpertises] = useState<IExpertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpertise, setEditingExpertise] = useState<IExpertise | null>(null);
  const [languageSearch, setLanguageSearch] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    teachingLevels: [] as string[],
    teachingLanguages: ['English'],
    experience: 0,
    hourlyRate: 0,
    specialNotes: '',
    visibility: 'public' as 'public' | 'private' | 'connections',
  });

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoriesRes, levelsRes, expertiseRes] = await Promise.all([
          fetch('/api/expertise-categories'),
          fetch('/api/education-levels'),
          fetch('/api/expertise'),
        ]);
        if (categoriesRes.ok) {
          const { data } = await categoriesRes.json();
          setCategories(data);
        }
        if (levelsRes.ok) {
          const { data } = await levelsRes.json();
          setLevels(data);
        }
        if (expertiseRes.ok) {
          const { data } = await expertiseRes.json();
          setExpertises(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch subjects when category changes
  useEffect(() => {
    if (!formData.category) {
      setSubjects([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await fetch(`/api/expertise-subjects?categoryId=${formData.category}`);
        if (res.ok) {
          const { data } = await res.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, [formData.category]);

  const handleOpenModal = (expertise?: IExpertise) => {
    if (expertise) {
      setEditingExpertise(expertise);
      setFormData({
        category: typeof expertise.category === 'object' ? expertise.category._id : expertise.category,
        subject: typeof expertise.subject === 'object' ? expertise.subject._id : expertise.subject,
        teachingLevels: expertise.teachingLevels.map(l =>
          typeof l === 'object' ? l._id : l
        ),
        teachingLanguages: expertise.teachingLanguages,
        experience: expertise.experience,
        hourlyRate: expertise.hourlyRate || 0,
        specialNotes: expertise.specialNotes || '',
        visibility: expertise.visibility,
      });
    } else {
      setEditingExpertise(null);
      setFormData({
        category: '',
        subject: '',
        teachingLevels: [],
        teachingLanguages: ['English'],
        experience: 0,
        hourlyRate: 0,
        specialNotes: '',
        visibility: 'public',
      });
    }
    setIsModalOpen(true);
    setLanguageSearch('');
  };

  const toggleLanguage = (lang: string) => {
    if (formData.teachingLanguages.includes(lang)) {
      setFormData({
        ...formData,
        teachingLanguages: formData.teachingLanguages.filter(l => l !== lang)
      });
    } else {
      setFormData({
        ...formData,
        teachingLanguages: [...formData.teachingLanguages, lang]
      });
    }
  };

  const removeLanguage = (e: React.MouseEvent, lang: string) => {
    e.stopPropagation();
    setFormData({
      ...formData,
      teachingLanguages: formData.teachingLanguages.filter(l => l !== lang)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.subject || formData.teachingLevels.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch(
        editingExpertise ? `/api/expertise/${editingExpertise._id}` : '/api/expertise',
        {
          method: editingExpertise ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        const { data } = await res.json();
        // Update the list
        if (editingExpertise) {
          setExpertises(prev =>
            prev.map(e => e._id === data._id ? data : e)
          );
        } else {
          setExpertises(prev => [...prev, data]);
        }
        toast.success(
          `Expertise ${editingExpertise ? 'updated' : 'created'} successfully`
        );
        setIsModalOpen(false);
      } else {
        toast.error('Failed to save expertise');
      }
    } catch (error) {
      console.error('Error saving expertise:', error);
      toast.error('Failed to save expertise');
    }
  };

  const handleDelete = async (expertiseId: string) => {
    if (!confirm('Are you sure you want to delete this expertise?')) return;

    try {
      const res = await fetch(`/api/expertise/${expertiseId}`, { method: 'DELETE' });
      if (res.ok) {
        setExpertises(prev => prev.filter(e => e._id !== expertiseId));
        toast.success('Expertise deleted successfully');
      } else {
        toast.error('Failed to delete expertise');
      }
    } catch (error) {
      console.error('Error deleting expertise:', error);
      toast.error('Failed to delete expertise');
    }
  };

  const filteredLanguages = DEFAULT_TEACHING_LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-dark-navy/5 p-8 space-y-8">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
          My Expertise
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-coral text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Expertise
        </button>
      </div>

      {/* Expertise List */}
      <div className="grid gap-6">
        {expertises.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">
              You haven't added any expertise yet
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Add your expertise to start getting student requests
            </p>
          </div>
        ) : (
          expertises.map(expertise => {
            const category =
              typeof expertise.category === 'object'
                ? expertise.category
                : categories.find(c => c._id === expertise.category);
            const subject =
              typeof expertise.subject === 'object'
                ? expertise.subject
                : subjects.find(s => s._id === expertise.subject);
            return (
              <div
                key={expertise._id}
                className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-dark-navy">
                        {subject?.name || 'Subject'}
                      </h3>
                      <span className="px-3 py-1 bg-coral/10 text-coral text-xs font-black rounded-lg uppercase">
                        {category?.name || 'Category'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Experience:</span> {expertise.experience} years
                      </p>
                      <p>
                        <span className="font-semibold">Rate:</span> ${expertise.hourlyRate || 'N/A'}/hour
                      </p>
                      <p>
                        <span className="font-semibold">Languages:</span> {expertise.teachingLanguages.join(', ')}
                      </p>
                      {expertise.specialNotes && (
                        <p className="mt-2 italic text-gray-500">{expertise.specialNotes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenModal(expertise)}
                      className="p-2 text-gray-600 hover:text-dark-navy hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expertise._id)}
                      className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for adding/editing expertise */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-xl font-black text-dark-navy mb-6 uppercase tracking-tight">
                {editingExpertise ? 'Edit' : 'Add New'} Expertise
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                      value={formData.category}
                      onChange={e =>
                        setFormData({ ...formData, category: e.target.value, subject: '' })
                      }
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                      Subject *
                    </label>
                    <select
                      required
                      disabled={!formData.category}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy disabled:opacity-50"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="">Select subject</option>
                      {subjects.map(subj => (
                        <option key={subj._id} value={subj._id}>
                          {subj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                    Teaching Levels *
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {levels.map(level => (
                      <label key={level._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.teachingLevels.includes(level._id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                teachingLevels: [...formData.teachingLevels, level._id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                teachingLevels: formData.teachingLevels.filter(
                                  l => l !== level._id
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 text-coral"
                        />
                        <span className="text-sm font-bold text-dark-navy">{level.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                    Teaching Languages
                  </label>
                  {/* Selected languages chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.teachingLanguages.map(lang => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-coral/10 text-coral text-sm font-bold rounded-full"
                      >
                        {lang}
                        <button type="button" onClick={(e) => removeLanguage(e, lang)} className="hover:text-coral/80">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Search bar */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search languages..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                    />
                  </div>
                  {/* Language options */}
                  <div className="grid gap-2 md:grid-cols-3">
                    {filteredLanguages.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-2 text-sm font-bold rounded-lg transition-all text-left ${
                          formData.teachingLanguages.includes(lang)
                            ? 'bg-coral text-white'
                            : 'bg-gray-100 text-dark-navy hover:bg-gray-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                      value={formData.hourlyRate}
                      onChange={e =>
                        setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                    Visibility
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                    value={formData.visibility}
                    onChange={e => setFormData({ ...formData, visibility: e.target.value as any })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="connections">Connections Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-steel-blue uppercase tracking-[0.2em]">
                    Special Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any additional notes about this expertise"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy resize-none"
                    value={formData.specialNotes}
                    onChange={e => setFormData({ ...formData, specialNotes: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-gray-100 text-dark-navy font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-coral text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all"
                  >
                    {editingExpertise ? 'Update' : 'Add'} Expertise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
