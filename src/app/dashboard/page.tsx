"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  FolderKanban,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
  Star,
  BarChart3,
  PieChart,
  Activity,
  RefreshCcw,
  X,
  Calendar,
  User,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  budgets: {
    total: number;
    accepted: number;
    pending: number;
    rejected: number;
    totalValue: number;
    avgTicket: number;
  };
  clients: {
    total: number;
    active: number;
  };
  team: {
    total: number;
    active: number;
    avgRating: number;
  };
  monthlyData: { month: string; projects: number; value: number }[];
  statusData: { name: string; value: number; color: string }[];
  recentProjects?: { id: string; name: string; clientName: string; status: string; budget?: number | null; description?: string | null }[];
}

interface ProjectDetails {
  id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  budget: number | null;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  progress: number;
  dueDate: string | null;
  createdAt: string;
  teamMembers?: { name: string; role: string }[];
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchStats();
  };

  const handleViewProject = async (projectId: string) => {
    try {
      setIsLoadingProject(true);
      setSelectedProject(projectId);
      const response = await fetch(`/api/projetos/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjectDetails(data);
        setIsProjectModalOpen(true);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do projeto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do projeto",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProject(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erro ao buscar stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Visão Geral</h1>
            <p className="text-muted-foreground">
              Acompanhe as métricas principais do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            {currentUser?.role === "ADMIN" && (
              <Link href="/dashboard/projetos">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Projetos Ativos</p>
                  <p className="text-3xl font-bold mt-1">{stats?.projects.active || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {stats?.projects.total || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Orçamentos Aceitos</p>
                  <p className="text-3xl font-bold mt-1">{stats?.budgets.accepted || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor: R$ {(stats?.budgets.totalValue || 0).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Clientes Ativos</p>
                  <p className="text-3xl font-bold mt-1">{stats?.clients.active || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {stats?.clients.total || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Média Equipe</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-amber-600">{stats?.team.avgRating || 0}</p>
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equipe: {stats?.team.total || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Monthly Evolution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evolução Mensal
              </CardTitle>
              <CardDescription>Projetos e valor por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="projects" name="Projetos" fill="#0088FE" />
                  <Bar yAxisId="right" dataKey="value" name="Valor (R$)" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Status dos Projetos
              </CardTitle>
              <CardDescription>Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={stats?.statusData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Projetos Recentes
                </CardTitle>
                <CardDescription>Últimos projetos cadastrados</CardDescription>
              </div>
              <Link href="/dashboard/projetos">
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentProjects?.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {project.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProject(project.id)}
                    >
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
              {(!stats?.recentProjects || stats.recentProjects.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum projeto recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Projeto */}
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{projectDetails?.name || "Detalhes do Projeto"}</span>
                <Badge variant={projectDetails?.status === "completed" ? "default" : "secondary"}>
                  {projectDetails?.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>{projectDetails?.clientName}</DialogDescription>
            </DialogHeader>

            {isLoadingProject ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : projectDetails ? (
              <div className="space-y-6">
                {/* Descrição */}
                {projectDetails.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{projectDetails.description}</p>
                  </div>
                )}

                {/* Informações Principais */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tipo</h4>
                    <p className="text-sm">{projectDetails.type || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Orçamento</h4>
                    <p className="text-sm font-semibold text-primary">
                      {projectDetails.budget ? `R$ ${projectDetails.budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </p>
                  </div>
                </div>

                {/* Progresso */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Progresso</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${projectDetails.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold">{projectDetails.progress || 0}%</span>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="text-sm font-medium">
                        {projectDetails.dueDate ? new Date(projectDetails.dueDate).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Criado em</p>
                      <p className="text-sm font-medium">
                        {new Date(projectDetails.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contato do Cliente */}
                {(projectDetails.clientEmail || projectDetails.clientPhone) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Contato do Cliente</h4>
                    <div className="space-y-2">
                      {projectDetails.clientEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{projectDetails.clientEmail}</span>
                        </div>
                      )}
                      {projectDetails.clientPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{projectDetails.clientPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Equipe */}
                {projectDetails.teamMembers && projectDetails.teamMembers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Equipe</h4>
                    <div className="flex flex-wrap gap-2">
                      {projectDetails.teamMembers.map((member, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          <User className="h-3 w-3" />
                          {member.name}
                          {member.role && <span className="text-xs text-muted-foreground">({member.role})</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setIsProjectModalOpen(false);
                    router.push(`/dashboard/projetos/${projectDetails.id}`);
                  }}>
                    Ver Projeto Completo
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Projeto não encontrado
              </p>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
