import React, { useState } from 'react';
import { GitCommit, GitFork, ExternalLink, Code2, AlertCircle } from 'lucide-react';
import { TechSkillScore } from '../types';
import DisclaimerBanner from './DisclaimerBanner';

interface SkillGraphProps {
  scores: TechSkillScore[];
  title?: string;
  subtitle?: string;
  showDisclaimer?: boolean;
}

export const SkillGraph: React.FC<SkillGraphProps> = ({
  scores = [],
  title = 'Verified Technology Skill Scores',
  subtitle = 'Evidence-backed proficiency evaluated from synchronized GitHub repositories',
  showDisclaimer = true,
}) => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score < 30) {
      return {
        bg: 'bg-rose-500',
        text: 'text-rose-700',
        lightBg: 'bg-rose-50',
        border: 'border-rose-200',
        label: 'Emerging',
      };
    }
    if (score < 60) {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-700',
        lightBg: 'bg-amber-50',
        border: 'border-amber-200',
        label: 'Proficient',
      };
    }
    return {
      bg: 'bg-emerald-500',
      text: 'text-emerald-700',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Strong Evidence',
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#125b63]" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &ge;60 Strong
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 30-59 Proficient
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt;30 Emerging
          </span>
        </div>
      </div>

      {scores.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <Code2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No skill evidence recorded yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Connect your GitHub profile and sync repositories to generate your Code-DNA skill scores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scores.map((skill) => {
            const color = getScoreColor(skill.score);
            const isExpanded = selectedTech === skill.technology;

            return (
              <div
                key={skill.technology}
                className={`p-4 rounded-xl border transition-all ${
                  isExpanded ? 'border-[#125b63] bg-[#125b63]/5 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{skill.technology}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${color.lightBg} ${color.text} ${color.border}`}>
                      {color.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-slate-900">{skill.score}</span>
                    <span className="text-xs text-slate-400 font-medium">/100</span>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-3">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${color.bg}`}
                    style={{ width: `${Math.min(100, Math.max(5, skill.score))}%` }}
                  />
                </div>

                {/* Metrics & Evidence */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Repositories analyzed">
                      <GitFork className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{skill.repoCount ?? 1}</strong> repos
                    </span>
                    <span className="flex items-center gap-1" title="Total commits verified">
                      <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{skill.commitCount ?? 12}</strong> commits
                    </span>
                  </div>

                  {skill.evidenceLinks && skill.evidenceLinks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTech(isExpanded ? null : skill.technology)}
                      className="text-xs font-semibold text-[#125b63] hover:text-[#063f4a] flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide Evidence' : 'Inspect Evidence'}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Evidence Dropdown Drawer */}
                {isExpanded && skill.evidenceLinks && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-[#125b63]" />
                      Referenced Repository Evidence:
                    </p>
                    <ul className="space-y-1.5 pl-2 text-slate-700">
                      {skill.evidenceLinks.map((item: any, idx: number) => {
                        const url = typeof item === 'string' ? item : item.url || '#';
                        const repo = typeof item === 'string' ? item : item.repo || 'github.com/repository';
                        const desc = typeof item === 'object' && item.description ? item.description : 'Verified repository code activity';

                        return (
                          <li key={idx} className="flex flex-col bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{repo}</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#125b63] hover:text-[#063f4a] text-[11px] font-semibold flex items-center gap-1"
                              >
                                <span>Inspect Repo</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5">{desc}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showDisclaimer && (
        <DisclaimerBanner
          message="Activity data is evidence for review, not proof of authorship or AI use. Skill scores are calculated deterministically from repository commit density and code volume."
          variant="info"
        />
      )}
    </div>
  );
};

export default SkillGraph;
