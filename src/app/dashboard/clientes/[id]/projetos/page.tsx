"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FolderKanban,
  Eye,
  DollarSign,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  FileText,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatCNPJ, formatCPF } from "@/lib/validators";

const statusColors: Record<string, string> = {
  planning: "bg-gray-500",
  development: "bg-blue-500",
  review: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  planning: "Planejamento",
  development: "Em Desenvolvimento",
  review: "Em Revisão",
  completed: "Concluído",
  cancelled: "Cancelado",
};

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  budget: number;
  progress: number;
  dueDate?: string;
  tasks: {
    total: number;
    completed: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  documentType: string;
  document: string;
  emails: any[];
  phones: any[];
}

export default function ClienteProjetos() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/clientes/${params.id}/projetos`);
        if (!response.ok) throw new Error("Erro ao carregar dados");
        const data = await response.json();

        setClient(data.client);
        setProjects(data.projects);
        setStats(data.stats);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  if (loading || !client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Projetos de {client.name}</h1>
            <p className="text-muted-foreground">
              {client.documentType === "cpf" ? `CPF: ${formatCPF(client.document)}` : `CNPJ: ${formatCNPJ(client.document)}`}
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projetos</p>
                    <p className="text-2xl font-bold">{stats.totalProjects}</p>
                  </div>
                  <FolderKanban className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projetos Ativos</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.activeProjects}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projetos Concluídos</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completedProjects}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {stats.totalBudget.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {project.description || "Sem descrição"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[project.status]} text-white text-xs ml-2 flex-shrink-0`}
                      >
                        {statusLabels[project.status] || project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Orçamento</span>
                      <span className="font-medium text-primary">
                        R$ {project.budget?.toLocaleString("pt-BR") || "0"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tarefas</span>
                      <span className="font-medium">
                        {project.tasks?.completed || 0}/{project.tasks?.total || 0}
                      </span>
                    </div>

                    {project.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(project.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground">
                Este cliente ainda não possui projetos cadastrados.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Project Details Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedProject?.name}</DialogTitle>
              <DialogDescription>
                {selectedProject?.description || "Sem descrição"}
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <div className="space-y-6">
                {/* Status e Tipo */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[selectedProject.status]} text-white`}
                      >
                        {statusLabels[selectedProject.status] || selectedProject.status}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{selectedProject.type || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Orçamento e Progresso */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium">Orçamento</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">
                        R$ {selectedProject.budget?.toLocaleString("pt-BR") || "0"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">{selectedProject.progress || 0}%</p>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${selectedProject.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tarefas */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {selectedProject.tasks?.completed || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          de {selectedProject.tasks?.total || 0} tarefas concluídas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <p className="text-lg font-semibold">
                          {Math.round(
                            ((selectedProject.tasks?.completed || 0) /
                              (selectedProject.tasks?.total || 1)) *
                              100
                          )}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Datas */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedProject.dueDate && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-medium">Data de Entrega</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">
                          {new Date(selectedProject.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {new Date(selectedProject.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={() => setModalOpen(false)}>Fechar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
