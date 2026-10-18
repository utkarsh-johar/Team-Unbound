import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Play,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900 flex flex-col justify-between selection:bg-[#238480] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Top Disclaimer Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <DisclaimerBanner
            message="SkillBridge MVP: Activity data is evidence for review, not proof of authorship. Dual scoring architecture (Overall Merit + Technology Skill Scores) is live."
            variant="info"
          />
        </div>

        {/* Hero Section with Exact Patch Aesthetic */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#065861] via-[#125b63] to-[#151717] text-white py-20 sm:py-28 lg:py-36 shadow-2xl">
          {/* Subtle natural organic lighting wave */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#238480] via-[#063f4a] to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#fd5800] animate-pulse" />
                <span>Verified Developer Career Opportunities</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05]">
                Don’t bet on the future. <br />
                <span className="text-white">Build it.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-200 max-w-xl font-medium leading-relaxed">
                SkillBridge is the evidence-based network powering verified developer skills toward sustainable career growth. Transform genuine GitHub commit telemetry into guaranteed alumni referrals.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/referrals"
                  className="px-8 py-4 bg-[#fd5800] hover:bg-[#e04e00] text-white text-sm font-bold rounded-xl shadow-xl transition-all flex items-center justify-center gap-2.5 group"
                >
                  <span>Talk to an alumni mentor</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-sm font-bold rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Verify your Code-DNA</span>
                </Link>
              </div>

              <div className="pt-8 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238480]" />
                  Dual Scoring Architecture
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238480]" />
                  Fairness Gate Protected
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238480]" />
                  Transparent Alumni Reputation
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Client Partners Bar from Image */}
        <section className="bg-[#151717] border-b border-white/10 py-7 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center gap-6 sm:gap-10 opacity-75 font-black text-sm sm:text-base tracking-wider uppercase">
              <span>Reformation</span>
              <span>MARSH</span>
              <span>Swiss Re</span>
              <span>MIRAKL</span>
              <span>Capgemini</span>
              <span>T-Mobile</span>
              <span>Workday</span>
            </div>
          </div>
        </section>


        {/* Value Proposition Cards from Screenshot */}
        <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#151717] rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#238480]">
                The SkillBridge System
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Sustainable career growth requires systems thinking
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you're entering engineering markets for the first time or scaling across resources, SkillBridge aligns your verified commit history with verified institutional sponsors.
              </p>
              <div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition"
                >
                  <span>Learn how SkillBridge works</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[11px] font-mono text-[#238480] uppercase tracking-wider font-bold">01. Strategy & Code-DNA</span>
                <h3 className="text-lg font-bold text-white">Deterministic Evaluation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Repository commit frequency, languages, and library usage form an audited Code-DNA skill score (0-100) per technology.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[11px] font-mono text-[#fd5800] uppercase tracking-wider font-bold">02. Fairness Gate</span>
                <h3 className="text-lg font-bold text-white">Weighted 3-Part Match</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Formula: 45% Code-DNA + 35% Sandbox Baseline + 20% Fit. Anti-gaming cooldown guards ensure rotation.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[11px] font-mono text-[#34807f] uppercase tracking-wider font-bold">03. Execution</span>
                <h3 className="text-lg font-bold text-white">Alumni Reputation Impact</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Alumni sponsor referrals with real credibility stakes (+15 on hire, -20 on screening fail).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Card with Clean Canvas */}
        <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ready to power your career with verified skills?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Sign in with your email or Google account to immediately calculate your Overall Merit Score.
              </p>
            </div>
            <Link
              to="/login"
              className="px-8 py-4 bg-[#fd5800] hover:bg-[#e04e00] text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span>Get started with email</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        SkillBridge &bull; Inspired by modern evidence-based architecture
      </footer>
    </div>
  );
};

export default LandingPage;
