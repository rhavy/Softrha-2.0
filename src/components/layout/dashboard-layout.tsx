"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useEmailVerification } from "@/hooks/use-email-verification";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Calendar,
  DollarSign,
  Bell,
  BarChart3,
  Star,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: any;
  label: string;
  href: string;
  allowedRoles?: string[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
  { icon: BarChart3, label: "Relatórios", href: "/dashboard/relatorios" },
  { 
    icon: Star, 
    label: "Avaliações", 
    href: "/dashboard/avaliacoes",
    allowedRoles: ["ADMIN"]
  },
  { 
    icon: Users, 
    label: "Clientes", 
    href: "/dashboard/clientes",
    allowedRoles: ["ADMIN"]
  },
  { 
    icon: DollarSign, 
    label: "Orçamentos", 
    href: "/dashboard/orcamentos",
    allowedRoles: ["ADMIN", "TEAM_MEMBER_GERENTE"]
  },
  { icon: FolderKanban, label: "Projetos", href: "/dashboard/projetos" },
  { icon: Bell, label: "Notificações", href: "/dashboard/notificacoes" },
  { 
    icon: Users, 
    label: "Equipe", 
    href: "/dashboard/equipe",
    allowedRoles: ["ADMIN"]
  },
  { icon: FileText, label: "Documentos", href: "/dashboard/documentos" },
  { icon: Calendar, label: "Calendário", href: "/dashboard/calendario" },
  { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se usuário pode acessar item de menu
  const canAccessNavItem = (item: NavItem) => {
    if (!item.allowedRoles) return true;
    if (!currentUser) return false;
    
    // ADMIN tem acesso a tudo
    if (currentUser.role === "ADMIN") return true;
    
    // TEAM_MEMBER com cargo "Gerente de Projetos" tem acesso a Orçamentos
    if (item.allowedRoles.includes("TEAM_MEMBER_GERENTE") && 
        currentUser.role === "TEAM_MEMBER" && 
        currentUser.teamRole === "Gerente de Projetos") {
      return true;
    }
    
    // Outros TEAM_MEMBER e USER não têm acesso a páginas restritas
    return false;
  };

  // Verificação contínua de emailVerified (a cada 5 segundos)
  useEmailVerification();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background pt-16 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex h-full flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>

            <nav className="flex-1 space-y-1 p-4">
              {!isLoading && navItems.filter(canAccessNavItem).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t p-4">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair do Dashboard
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
