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
      <footer className="border-t border-slate-800/80 bg-[#07090d] text-slate-400 py-6 mt-12 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} <strong>CaninGroom Pro</strong></span>
            <span>•</span>
            <span className="text-slate-500">v2.5</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={handleOpen}
              className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Sobre Nosotros / Legales</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal for Sobre Nosotros if opened from LoginScreen */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0e1017] border border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
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
