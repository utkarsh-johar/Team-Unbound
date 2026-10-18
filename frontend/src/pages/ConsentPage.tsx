import React from 'react';
import Navbar from '../components/Navbar';
import ConsentManager from '../components/ConsentManager';
import DisclaimerBanner from '../components/DisclaimerBanner';

export const ConsentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#151717] flex flex-col justify-between selection:bg-[#fd5800] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#151717] tracking-tight">
            Consent & Privacy Preferences
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            SkillBridge gives you granular authority over repository ingestion. You may inspect permissions, revoke access, or purge your account data at any time.
          </p>
        </div>

        <DisclaimerBanner
          message="Zero-Retention Source Policy: SkillBridge evaluates high-level syntax and commit frequency. We do not store or mirror your private application source code."
          variant="info"
        />

        <ConsentManager />
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SkillBridge Consent Center &bull; Least-privilege data access
      </footer>
    </div>
  );
};

export default ConsentPage;
