import React from 'react';
import {
  Building2,
  Award,
  Sparkles,
  ShieldCheck,
  Lock,
  Code,
  CheckCircle2,
  Dog,
  FileText,
  Server,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';

export const SobreNosotrosManager: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/80 via-[#12151c] to-purple-950/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>Información del Sistema & Marco Legal</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">CaninGroom Pro</span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Plataforma profesional de alto rendimiento diseñada para la gestión integral de peluquerías caninas, centros de estética de mascotas y spas veterinarios.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 font-medium">
              <Server className="w-3.5 h-3.5 text-emerald-400" /> Versión 2.5 Nube
            </span>
            <span className="px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Servidor Nube Encriptado
            </span>
          </div>
        </div>
      </div>

      {/* Grid Features & Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Software Overview */}
        <div className="bg-[#12151c] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Qué es CaninGroom Pro?</h3>
              <p className="text-xs text-slate-400">Herramienta integral de productividad canina</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            CaninGroom Pro centraliza la agenda de turnos, el historial médico-estético de mascotas, el control de vacunas, el stock de productos de aseo y la contabilidad financiera en una interfaz ultra-rápida optimizada para computadoras y dispositivos móviles.
          </p>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Aislación de datos:</strong> Cada peluquería accede a su propia base de datos protegida.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Fichas completas:</strong> Registro de fotos de cortes, bozal, alergias, peso y vacunas.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Gestión de WhatsApp:</strong> Notificaciones directas a clientes con un solo clic.</span>
            </li>
          </ul>
        </div>

        {/* Module 2: Developers & Tech Partners */}
        <div className="bg-[#12151c] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Desarrollado Por</h3>
              <p className="text-xs text-slate-400">Créditos de autoría y desarrollo de software</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Dev 1 */}
            <div className="p-4 bg-[#0a0c10] border border-indigo-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  La Clave Argentina
                </span>
                <span className="text-[10px] px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-mono font-semibold border border-indigo-500/30">
                  Software Dev
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Empresa especializada en ingeniería de software empresarial, sistemas ERP y herramientas de gestión a medida para negocios de alto rendimiento.
              </p>
            </div>

            {/* Dev 2 */}
            <div className="p-4 bg-[#0a0c10] border border-purple-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Tienda SSH
                </span>
                <span className="text-[10px] px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full font-mono font-semibold border border-purple-500/30">
                  Sistemas Tech
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Líderes en plataformas digitales, infraestructura web de alta disponibilidad y soluciones de transformación tecnológica.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Terms Section */}
      <div className="bg-[#12151c] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Términos de Servicio, Licencia & Legales</h3>
            <p className="text-xs text-slate-400">Condiciones de uso y propiedad intelectual del software</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2 p-4 bg-[#0a0c10] rounded-xl border border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              1. Derechos de Propiedad Intelectual
            </h4>
            <p className="text-slate-400">
              Todos los derechos de autor, diseño de interfaz, marcas y código fuente correspondientes a <strong>CaninGroom Pro</strong> son propiedad exclusiva de <strong>La Clave Argentina</strong> y <strong>Tienda SSH</strong>. Queda estrictamente prohibida la copia, reproducción, ingeniería inversa o comercialización no autorizada.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-[#0a0c10] rounded-xl border border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              2. Privacidad y Seguridad de Datos
            </h4>
            <p className="text-slate-400">
              La información cargada por los usuarios (datos de clientes, mascotas, finanzas y turnos) se almacena bajo encriptación SSL/TLS en la infraestructura segura de servidores en la nube. La Clave Argentina y Tienda SSH garantizan la confidencialidad de sus registros comerciales.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-[#0a0c10] rounded-xl border border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-400" />
              3. Licencia de Uso Comercial
            </h4>
            <p className="text-slate-400">
              Se otorga una licencia de uso personal y comercial para la administración de peluquerías caninas. El usuario es responsable de mantener la seguridad de sus credenciales de acceso a la cuenta.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-[#0a0c10] rounded-xl border border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              4. Soporte Técnico y Actualizaciones
            </h4>
            <p className="text-slate-400">
              El sistema recibe actualizaciones continuas de rendimiento y seguridad. Para consultas comerciales o soporte técnico personalizado, contáctese con los canales oficiales de La Clave Argentina o Tienda SSH.
            </p>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          © {new Date().getFullYear()} <strong>La Clave Argentina & Tienda SSH</strong>. Todos los derechos reservados. CaninGroom Pro v2.5
        </div>
      </div>
    </div>
  );
};
