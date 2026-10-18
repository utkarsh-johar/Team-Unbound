import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
  Award,
  Terminal,
  ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#071519] text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Top Disclaimer Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <DisclaimerBanner
            message="SkillBridge MVP: Activity data is evidence for review, not proof of authorship. Dual scoring architecture (Overall Merit + Technology Skill Scores) is live."
            variant="info"
          />
        </div>

        {/* Hero Section inspired by Patch aesthetic */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          {/* Ambient lighting glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-copper-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-800/60 text-brand-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-copper-400" />
              Verified Developer Career Infrastructure
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
              Don’t bet on the future.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-teal-200 to-copper-400">
                Build it.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              SkillBridge is the evidence-based platform powering verified engineering skills toward sustainable career growth. Transform genuine GitHub commit telemetry into guaranteed alumni referrals.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-copper-600 hover:bg-copper-500 text-white font-bold rounded-2xl shadow-xl shadow-copper-950/60 transition-all flex items-center justify-center gap-2.5 text-sm group"
              >
                <span>Get Started with Email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/referrals"
                className="w-full sm:w-auto px-8 py-4 bg-[#0a1f24] hover:bg-[#0d2a31] text-brand-300 font-bold rounded-2xl border border-teal-800/60 shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Explore Open Referrals</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Quick trust badges */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Dual Scoring Architecture
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Fairness Gate Protected
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                Transparent Alumni Reputation
              </span>
            </div>
          </div>
        </section>

        {/* Company Network Logos Bar */}
        <section className="py-8 bg-[#061013] border-y border-teal-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-6">
              Verified Referral Opportunities from Alumni at Top Teams
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 opacity-75">
              <span className="text-lg font-black tracking-tight text-slate-300">STRIPE</span>
              <span className="text-lg font-black tracking-tight text-slate-300">GOOGLE</span>
              <span className="text-lg font-black tracking-tight text-slate-300">ACME CORP</span>
              <span className="text-lg font-black tracking-tight text-slate-300">CLOUDSCALE</span>
              <span className="text-lg font-black tracking-tight text-slate-300">VERCEL</span>
              <span className="text-lg font-black tracking-tight text-slate-300">SUPABASE</span>
            </div>
          </div>
        </section>

        {/* 3-Step Flow: VERIFY -> MATCH -> CONVERT */}
        <section id="how-it-works" className="py-20 bg-[#0a191e] border-b border-teal-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-copper-400 mb-2">
                Predictable Merit Architecture
              </h2>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                The 3-Step SkillBridge Pipeline
              </p>
              <p className="text-slate-400 text-sm mt-3">
                Replacing subjective resumes with structured code activity and transparent alumni sponsorship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-[#0a1f24] p-8 rounded-3xl border border-teal-900/60 shadow-xl space-y-4 hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-brand-400 flex items-center justify-center font-black text-lg">
                  01
                </div>
                <h3 className="text-xl font-bold text-white">VERIFY: Code-DNA</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consent-first GitHub telemetry scans public repositories to index technologies, commit frequency, and recent repository activity with zero subjective bias.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-brand-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Deterministic Skill Derivation</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#0a1f24] p-8 rounded-3xl border border-teal-900/60 shadow-xl space-y-4 hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-copper-400 flex items-center justify-center font-black text-lg">
                  02
                </div>
                <h3 className="text-xl font-bold text-white">MATCH: Fairness Gate</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dual scores combine technology depth and academic merit. Flash referral candidates are ranked in an audited top-5 pool with strict cooldown enforcement.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-copper-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Weighted Ranking: 45% + 35% + 20%</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#0a1f24] p-8 rounded-3xl border border-teal-900/60 shadow-xl space-y-4 hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-800 text-emerald-400 flex items-center justify-center font-black text-lg">
                  03
                </div>
                <h3 className="text-xl font-bold text-white">CONVERT: Sponsorship</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verified alumni sponsor candidates directly to hiring recruiters. Confirmed interview outcomes update the alumni credibility score (+15 on hire, -20 on screening fail).
                </p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Transparent Alumni Reputation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action card */}
        <section className="py-20 bg-[#071519]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-[#0a1f24] to-[#0d2a31] p-10 sm:p-14 rounded-3xl border border-teal-800/60 shadow-2xl text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to turn genuine code into career referrals?
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Join students and alumni across participating institutions. Verify your Code-DNA in under two minutes with your email address.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-copper-600 hover:bg-copper-500 text-white font-bold rounded-2xl shadow-xl shadow-copper-950 transition-all text-sm"
                >
                  <span>Launch SkillBridge</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500 border-t border-teal-900/40 bg-[#061013]">
        SkillBridge Platform &bull; Transforming developer activity into career opportunity
      </footer>
    </div>
  );
};

export default LandingPage;
