import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  Clock,
  Globe2,
  Mail,
  Send,
  AlertCircle,
  Tag,
  FileText,
} from 'lucide-react';
import { useReferrals } from '../hooks/useReferrals';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

const SUGGESTED_SKILLS = [
  'Python',
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'PostgreSQL',
  'Java',
  'Docker',
  'Kubernetes',
  'C++',
  'Rust',
  'AWS',
];

export const CreateReferralPage: React.FC = () => {
  const navigate = useNavigate();
  const { createReferral } = useReferrals();

  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<number>(2);
  const [openToOtherColleges, setOpenToOtherColleges] = useState(false);
  const [recruiterEmail, setRecruiterEmail] = useState('');

  // Technology Tags
  const [techList, setTechList] = useState<string[]>(['TypeScript', 'React']);
  const [techInput, setTechInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim();
      if (val && !techList.includes(val)) {
        setTechList([...techList, val]);
        setTechInput('');
      }
    }
  };

  const removeTech = (item: string) => {
    setTechList(techList.filter((t) => t !== item));
  };

  const toggleSuggestedSkill = (skill: string) => {
    if (techList.includes(skill)) {
      setTechList(techList.filter((t) => t !== skill));
    } else {
      setTechList([...techList, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !roleTitle.trim() || !description.trim()) {
      setError('Please fill out all mandatory referral details.');
      return;
    }
    if (techList.length === 0) {
      setError('Please specify at least one required technology tag.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Compute expiry 7 days from now (default)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const created = await createReferral({
        company,
        roleTitle,
        requiredTechnologies: techList,
        slots: Number(slots),
        slotsRemaining: Number(slots),
        description,
        expiresAt,
        openToOtherColleges,
        recruiterEmail: recruiterEmail.trim() || undefined,
        status: 'open',
      });

      if (created && created.id) {
        navigate(`/referrals/${created.id}`);
      } else {
        navigate('/referrals');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
        : 'Failed to create flash referral.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#151717] tracking-tight">
            Create Flash Referral Slot
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Post an exclusive short-lived opportunity for qualified student engineers at your alma mater.
          </p>
        </div>

        <DisclaimerBanner
          message="Expiry Policy: Flash referrals close automatically after 7 days to preserve hiring velocity. Screening outcomes impact your Alumni Credibility Score (+15 for success, -20 for failed screening)."
          variant="info"
        />

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Company & Role Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Google, Datadog"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Software Engineer (Backend)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] bg-slate-50/50"
                required
              />
            </div>
          </div>

          {/* Required Technologies */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Required Technologies & Stacks
            </label>
            <p className="text-xs text-slate-500 mb-2.5">
              Matching candidates must have verified Code-DNA evidence in these technologies.
            </p>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {techList.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#125b63]/10 text-[#125b63] border border-[#125b63]/20 rounded-lg text-xs font-bold"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-[#063f4a] ml-1 font-black"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested quick pills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {SUGGESTED_SKILLS.map((skill) => {
                const isSelected = techList.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSuggestedSkill(skill)}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${
                      isSelected
                        ? 'bg-[#125b63] text-white border-[#125b63]'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {skill}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
              placeholder="Type technology name and press Enter or comma..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#125b63] bg-white"
            />
          </div>

          {/* Slots & Expiry Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Number of Referral Slots
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={slots}
                onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] bg-slate-50/50"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Number of candidates you intend to sponsor.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Duration / Expiry Window
              </label>
              <input
                type="text"
                value="7 Days (System Default)"
                disabled
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">Configured per PRD referral policy.</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Opportunity Description & Scope
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the team, technical challenges, responsibilities, and screening expectations..."
              className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] bg-slate-50/50"
              required
            />
          </div>

          {/* Recruiter Email for Direct Invite Token */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Recruiter / Hiring Manager Email
            </label>
            <input
              type="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              placeholder="recruiter@company.com"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#125b63] bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Creates a secure, one-click outcome confirmation token sent directly to the hiring partner.
            </p>
          </div>

          {/* Checkbox: Open to other supported colleges */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="openColleges"
              checked={openToOtherColleges}
              onChange={(e) => setOpenToOtherColleges(e.target.checked)}
              className="mt-0.5 text-[#125b63] rounded focus:ring-[#125b63] w-4 h-4"
            />
            <label htmlFor="openColleges" className="text-xs text-slate-700 cursor-pointer">
              <strong className="text-slate-900 block flex items-center gap-1.5 mb-0.5">
                <Globe2 className="w-3.5 h-3.5 text-[#125b63]" />
                Also open to other supported colleges
              </strong>
              If home campus candidate supply is exhausted, allow ranked students from other verified universities to match.
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/referrals')}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#fd5800] hover:bg-[#e04e00] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publishing Flash Referral...' : 'Publish Flash Referral'}</span>
            </button>
          </div>
        </form>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Referral Gateway &bull; 7-Day Auto Closure Enforced
      </footer>
    </div>
  );
};

export default CreateReferralPage;
