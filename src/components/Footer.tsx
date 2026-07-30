import React from 'react';
import { ShieldCheck, Code, Building2, Sparkles, Award, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#07090d] text-slate-400 py-10 mt-16 text-xs relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main credits grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/60">
          {/* Software Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight">
              <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/40 rounded-lg text-indigo-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span>CaninGroom Pro System</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sistema integral de gestión de turnos, fichas médicas de mascotas, clientes, inventario de insumos y finanzas para peluquerías caninas y estéticas de mascotas.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Base de Datos Firestore Nube aislada por cuenta</span>
            </div>
          </div>

          {/* Developers Credits */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Desarrollado Por</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-[#11141c] border border-indigo-500/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    La Clave Argentina
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-mono border border-indigo-500/30">
                    Software Dev
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Desarrollo de Software de Gestión para Empresas & Sistemas ERP.
                </p>
              </div>

              <div className="p-3 bg-[#11141c] border border-purple-500/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Tienda SSH
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full font-mono border border-purple-500/30">
                    Sistemas Tech
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Plataformas Digitales, Soluciones Web & Tecnología Empresarial.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Rights & Protection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Marco Legal & Licencia</span>
            </div>

            <div className="p-3 bg-[#0e1017] border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong className="text-slate-200">Derechos Reservados:</strong> Este sistema y su código fuente son propiedad exclusiva de <strong className="text-indigo-300">La Clave Argentina</strong> y <strong className="text-purple-300">Tienda SSH</strong>.
              </p>
              <p className="text-[10px] text-slate-500">
                Protegido por las leyes de propiedad intelectual y marcas registradas. Queda prohibida la reproducción, distribución o ingeniería inversa no autorizada.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 pt-2">
          <p>© {new Date().getFullYear()} <strong className="text-slate-300">La Clave Argentina & Tienda SSH</strong>. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sistemas de Gestión Empresarial</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">CaninGroom Pro v2.5</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
