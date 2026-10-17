import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  GitBranch,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Top Disclaimer Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <DisclaimerBanner
            message="SkillBridge is a concept platform. No real customers or results exist. All profiles and metrics shown are simulated demo data."
            variant="info"
          />
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Evidence-Based Career Acceleration
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
              From verified skills to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500">
                real career opportunities
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              SkillBridge transforms genuine GitHub coding evidence into transparent referrals and career pipelines through trusted alumni networks.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-base group"
              >
                <span>Get Started with College Email</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition-all text-base"
              >
                Learn How it Works
              </a>
            </div>

            {/* Quick value badges */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Consent-First Telemetry
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Fairness Gate Protected
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Human-in-the-Loop Decisions
              </span>
            </div>
          </div>
        </section>

        {/* 3-Step Flow: VERIFY -> MATCH -> CONVERT */}
        <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Predictable Merit Architecture
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                The 3-Step SkillBridge Pipeline
              </p>
              <p className="text-slate-500 text-sm mt-3">
                Replacing subjective resumes with structured code activity and transparent alumni sponsorship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1: VERIFY */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative group hover:border-indigo-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-indigo-200">
                  1
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">VERIFY</h3>
                </div>
                <p className="text-xs font-semibold text-indigo-600 mb-3">
                  Code-DNA Ingestion & Telemetry
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Students connect GitHub with explicit, least-privilege consent. We analyze commit history, language distribution, and library depth to compute verifiable 0–100 Technology Skill Scores.
                </p>
              </div>

              {/* Step 2: MATCH */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative group hover:border-indigo-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-indigo-200">
                  2
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">MATCH</h3>
                </div>
                <p className="text-xs font-semibold text-indigo-600 mb-3">
                  Flash Referrals & Fairness Gate
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Alumni post short-lived flash referrals. The Fairness Gate checks eligibility, active cooldowns, and anti-favoritism rotation before presenting a weighted top five ranking.
                </p>
              </div>

              {/* Step 3: CONVERT */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative group hover:border-indigo-300 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-indigo-200">
                  3
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">CONVERT</h3>
                </div>
                <p className="text-xs font-semibold text-indigo-600 mb-3">
                  Screening & Credibility Loop
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Recruiters review candidate code evidence without cold outreach friction. Outcomes feed back into the Alumni Credibility Score (+15 for success, with full appeal recourse for anomalies).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                Engineered for Integrity
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Designed to Solve Structural Hiring Inefficiencies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1: Code-DNA Profile */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Code-DNA Profiling</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  No buzzwords or inflated bullet points. Each technology score maps directly to inspectable repositories and commit activity for instant technical credibility.
                </p>
              </div>

              {/* Feature 2: Flash Referrals */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Flash Referral Slots</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Time-boxed referral slots (default 7 days) create immediate momentum and prevent candidate pools from languishing in stale review queues.
                </p>
              </div>

              {/* Feature 3: Fairness Gate */}
              <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Fairness Gate Rotation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Automatic cooldown policies prevent referral monopolies. When a candidate secures referrals, fair rotation ensures other qualified students gain access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to turn verified code into opportunity?
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Join students and alumni bridging the gap between raw engineering talent and real industry placement.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
              >
                <span>Enter SkillBridge Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">SkillBridge &mdash; Concept Platform MVP</p>
          <p className="max-w-2xl mx-auto text-slate-400">
            Disclaimers: Activity data is evidence for review, not proof of authorship or AI use. CGPA is self-reported and unverified in the MVP.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
