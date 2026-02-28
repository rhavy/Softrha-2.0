import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, Sparkles, Rocket, Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-cyan-400/20 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-blue-500/5" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Glowing orbs */}
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-lg blur-sm" />
                <img src="/logo.png" alt="SoftRha" className="h-8 w-auto relative z-10" />
              </div>
              <span className="text-xl font-bold text-white drop-shadow-lg">SoftRha</span>
            </div>
            <p className="text-sm text-cyan-100/70">
              Transformando ideias em soluções digitais de alta performance com
              <span className="text-cyan-300 font-medium"> Next.js</span>,
              <span className="text-blue-300 font-medium"> TypeScript</span> e tecnologias modernas.
            </p>
            
            {/* Tech badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs">
                <Zap className="h-3 w-3" /> Next.js
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs">
                <Rocket className="h-3 w-3" /> TypeScript
              </span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/servicos"
                  className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                  Serviços
                </Link>
              </li>
              <li>
                <Link
                  href="/projetos"
                  className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                  Projetos
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-cyan-300" />
              Serviços
            </h3>
            <ul className="space-y-2">
              <li className="text-sm text-cyan-100/70 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                Desenvolvimento Web
              </li>
              <li className="text-sm text-cyan-100/70 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                Aplicativos Mobile
              </li>
              <li className="text-sm text-cyan-100/70 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                Software Sob Medida
              </li>
              <li className="text-sm text-cyan-100/70 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                Consultoria Técnica
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-300" />
              Contato
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:contato@softrha.com"
                className="flex items-center gap-2 text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors"
              >
                <Mail className="h-4 w-4" />
                contato@softrha.com
              </a>
              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="text-cyan-100/70 hover:text-cyan-300 transition-colors p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 hover:border-cyan-400/40"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-cyan-100/70 hover:text-cyan-300 transition-colors p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 hover:border-cyan-400/40"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-cyan-100/70 hover:text-cyan-300 transition-colors p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 hover:border-cyan-400/40"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cyan-400/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-cyan-100/60">
              © {currentYear} SoftRha. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-cyan-100/50">
                <Sparkles className="h-3 w-3" />
                Feito com
              </span>
              <span className="text-cyan-400">💙</span>
              <span className="text-xs text-cyan-100/50">e tecnologia</span>
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                href="#"
                className="text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors"
              >
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
