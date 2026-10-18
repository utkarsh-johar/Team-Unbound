import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Sparkles, School, GraduationCap, Award, Compass, FileText, Briefcase, Plus, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Profile, ExperienceItem } from '../types';

interface ProfileFormProps {
  initialProfile?: Profile | null;
  onSave: (data: Partial<Profile>) => Promise<void>;
}

const COMMON_CAREER_TAGS = [
  'Full Stack Development',
  'Backend Systems',
  'Frontend Engineering',
  'Distributed Systems',
  'Machine Learning / AI',
  'DevOps & Cloud',
  'Mobile App Development',
  'Data Engineering',
  'Security & Cryptography',
];

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSave }) => {
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState<number | ''>(2026);
  const [cgpa, setCgpa] = useState<number | ''>(8.5);
  const [summary, setSummary] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Experience and Internship states
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpDuration, setNewExpDuration] = useState<number | ''>(3);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpLink, setNewExpLink] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setCollege(initialProfile.college || '');
      setBranch(initialProfile.branch || '');
      setGraduationYear(initialProfile.graduationYear ?? 2026);
      setCgpa(initialProfile.cgpa ?? 8.5);
      setSummary(initialProfile.summary || '');

      if (Array.isArray(initialProfile.careerIntent)) {
        setSelectedTags(initialProfile.careerIntent);
      } else if (typeof initialProfile.careerIntent === 'string') {
        setSelectedTags(
          initialProfile.careerIntent
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }

      if (initialProfile.experience && Array.isArray(initialProfile.experience)) {
        setExperiences(initialProfile.experience);
      } else if (typeof initialProfile.experience === 'string') {
        try {
          setExperiences(JSON.parse(initialProfile.experience));
        } catch {
          setExperiences([]);
        }
      }
    }
  }, [initialProfile]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = customTagInput.trim();
      if (trimmed && !selectedTags.includes(trimmed)) {
        setSelectedTags((prev) => [...prev, trimmed]);
        setCustomTagInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddExperience = () => {
    if (!newExpCompany.trim() || !newExpRole.trim()) {
      return;
    }

    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: newExpCompany.trim(),
      role: newExpRole.trim(),
      durationMonths: Number(newExpDuration) || 3,
      description: newExpDesc.trim(),
      verificationLink: newExpLink.trim() || undefined,
    };

    setExperiences((prev) => [...prev, newItem]);
    setNewExpCompany('');
    setNewExpRole('');
    setNewExpDuration(3);
    setNewExpDesc('');
    setNewExpLink('');
    setShowAddExp(false);
  };

  const handleRemoveExperience = (id?: string) => {
    if (!id) return;
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const totalExperienceMonths = experiences.reduce(
    (acc, exp) => acc + (Number(exp.durationMonths) || 0),
    0
  );
  const calculatedBoost = experiences.length > 0
    ? Math.min(25, 10 + Math.floor(totalExperienceMonths / 3) * 5)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (cgpa !== '' && (cgpa < 0 || cgpa > 10)) {
      setError('CGPA must be between 0.0 and 10.0');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        college,
        branch,
        graduationYear: graduationYear === '' ? undefined : Number(graduationYear),
        cgpa: cgpa === '' ? undefined : Number(cgpa),
        careerIntent: selectedTags,
        summary,
        experience: experiences,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to update profile details.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-[#125b63]" />
            Academic & Professional Background
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep your profile accurate to qualify for targeted alumni referral opportunities.
          </p>
        </div>
        {success && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile changes saved!
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* College Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-slate-400" />
            College / Institution
          </label>
          <input
            type="text"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="e.g. Indian Institute of Technology, Bombay"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] focus:border-[#125b63] bg-slate-50/50"
            required
          />
        </div>

        {/* Branch / Program */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Branch / Program
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. Computer Science and Engineering"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] focus:border-[#125b63] bg-slate-50/50"
            required
          />
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Graduation Year
          </label>
          <input
            type="number"
            min={2000}
            max={2035}
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value === '' ? '' : parseInt(e.target.value))}
            placeholder="2026"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] focus:border-[#125b63] bg-slate-50/50"
            required
          />
        </div>

        {/* CGPA with Disclaimer Label */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Cumulative GPA (Scale of 10)
            </span>
            <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
              self-reported, not verified
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={10}
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="8.50"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] focus:border-[#125b63] bg-slate-50/50"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Note: Per PRD Section 10, CGPA is self-reported in MVP and contributes to Fit score normalization.
          </p>
        </div>
      </div>

      {/* Career Intent Tags */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          Career Intent & Domain Interests
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Select target engineering domains to help alumni match relevant referral slots.
        </p>

        {/* Selected Tags Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#125b63]/10 border border-[#125b63]/20 text-[#125b63] text-xs font-bold rounded-lg shadow-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-[#063f4a] ml-1 text-sm font-black leading-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        {/* Suggested Quick Tags */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Suggested Domains:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_CAREER_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#125b63] text-white border-[#125b63]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Tag Input */}
        <input
          type="text"
          value={customTagInput}
          onChange={(e) => setCustomTagInput(e.target.value)}
          onKeyDown={handleAddCustomTag}
          placeholder="Type custom role or domain and press Enter..."
          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#125b63] bg-white"
        />
      </div>

      {/* Real-world Work Experience & Internships Section */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#125b63]" />
              Industry Experience & Internships
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Hands-on engineering roles or technical internships directly increment your Fit & Placement standing.
            </p>
          </div>

          {calculatedBoost > 0 && (
            <span className="self-start sm:self-auto px-3 py-1 text-xs font-bold bg-[#fd5800]/10 text-[#fd5800] rounded-full border border-[#fd5800]/25 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              +{calculatedBoost} pts Experience Boost Active ({totalExperienceMonths} mos)
            </span>
          )}
        </div>

        {/* Existing Experience Cards */}
        {experiences.length > 0 ? (
          <div className="space-y-3 my-3">
            {experiences.map((exp) => (
              <div
                key={exp.id || exp.company}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-[#125b63]/40 transition-all space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {exp.role}
                      <span className="text-slate-400 font-normal">&bull;</span>
                      <span className="text-[#125b63] font-semibold">{exp.company}</span>
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {exp.durationMonths} month{exp.durationMonths === 1 ? '' : 's'} duration
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {exp.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                )}

                {exp.verificationLink && (
                  <a
                    href={exp.verificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#125b63] hover:underline pt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Proof / Pull Request / Repo
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 text-center my-3">
            <Briefcase className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-medium text-slate-500">
              No real-world internships added yet. Add industry experience to increment your referral rank.
            </p>
          </div>
        )}

        {/* Add Experience Toggle / Form */}
        {showAddExp ? (
          <div className="p-4 rounded-xl border border-[#125b63]/30 bg-[#125b63]/5 space-y-3 mt-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#125b63]">
              Add New Technical Internship / Work Experience
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  placeholder="e.g. Razorpay, Swiggy, Startup"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#125b63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  value={newExpRole}
                  onChange={(e) => setNewExpRole(e.target.value)}
                  placeholder="e.g. Backend Engineering Intern"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#125b63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newExpDuration}
                  onChange={(e) => setNewExpDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="3"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#125b63]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Contributions & Technical Highlights
              </label>
              <textarea
                rows={2}
                value={newExpDesc}
                onChange={(e) => setNewExpDesc(e.target.value)}
                placeholder="Mention technologies used (e.g. React, PostgreSQL, Docker) and system impacts..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#125b63]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Verification / Artifact URL (Optional)
              </label>
              <input
                type="url"
                value={newExpLink}
                onChange={(e) => setNewExpLink(e.target.value)}
                placeholder="https://github.com/... or live deployment link"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#125b63]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddExp(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddExperience}
                disabled={!newExpCompany.trim() || !newExpRole.trim()}
                className="px-4 py-1.5 bg-[#125b63] hover:bg-[#063f4a] text-white text-xs font-bold rounded-lg disabled:opacity-50 transition"
              >
                Add Experience to Profile
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddExp(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#125b63] bg-[#125b63]/10 hover:bg-[#125b63]/20 rounded-xl border border-[#125b63]/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Internship / Real-world Work Experience
          </button>
        )}
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Technical Summary / Bio
        </label>
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Briefly describe your core areas of expertise, favorite projects, and what engineering problems excite you..."
          className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#125b63] bg-slate-50/50"
        />
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#fd5800] hover:bg-[#e04e00] text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
