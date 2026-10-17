import React from 'react';
import { Rocket, Sparkles, Code2, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const FounderDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <DisclaimerBanner
          message="Founder Pods & Venture Bounties are scheduled for development in Phase 3. The interface below outlines planned operational workflows."
          variant="info"
        />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-100">
            <Rocket className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Phase 3 Concept
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Founder Pods & Product Labs
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              We are constructing high-impact channels for early-stage startup founders to collaborate directly with verified student engineering talent.
            </p>
          </div>

          {/* Planned Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Task Pods</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post scoped 2–4 week engineering sprints to evaluate student builders on real-world product repositories prior to equity or full-time offers.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Product Feedback Loops</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distribute alpha releases and developer APIs directly to active collegiate builders for deep architectural feedback and telemetry.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200">
              <span>Status: Active Roadmapping for Phase 3</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Founder Pods &bull; Phase 3 Concept Stub
      </footer>
    </div>
  );
};

export default FounderDashboard;
