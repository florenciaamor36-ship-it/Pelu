import React, { useState } from 'react';
import { ShieldCheck, Info, Heart, Building2, Sparkles, Award, Lock, X } from 'lucide-react';
import { SobreNosotrosManager } from './SobreNosotrosManager';

interface FooterProps {
  onOpenSobreNosotros?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSobreNosotros }) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => {
    if (onOpenSobreNosotros) {
      onOpenSobreNosotros();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <footer className="border-t border-[#c3c4c7] dark:border-slate-800 bg-white dark:bg-[#161b22] text-[#1d2327] dark:text-slate-100 py-4 mt-8 text-xs relative z-10 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <span>© {new Date().getFullYear()} <strong>CaninGroom Pro</strong></span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">v2.5</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={handleOpen}
              className="text-[#2271b1] dark:text-[#72aee6] hover:text-[#135e96] dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 px-3 py-1 bg-[#f0f6fc] dark:bg-indigo-950/40 border border-[#2271b1]/30 dark:border-indigo-800/40 rounded"
            >
              <Info className="w-3.5 h-3.5 text-[#2271b1] dark:text-[#72aee6]" />
              <span>Sobre Nosotros / Legales</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal for Sobre Nosotros if opened from LoginScreen */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-[#161b22] border border-[#c3c4c7] dark:border-slate-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl transition-colors">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-300 hover:text-[#1d2327] dark:hover:text-white bg-[#f6f7f7] dark:bg-[#0e1117] hover:bg-[#f0f0f1] dark:hover:bg-slate-800 rounded-full transition-colors border border-[#c3c4c7] dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <SobreNosotrosManager />
          </div>
        </div>
      )}
    </>
  );
};
