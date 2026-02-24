"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  DollarSign,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NovoProjetoModal } from "@/components/modals/novo-projeto-modal";
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  // Status em português (frontend)
  "Em Desenvolvimento": { 
    color: "text-blue-600", 
    bg: "bg-blue-50", 
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Em Desenvolvimento"
  },
  "Em Revisão": { 
    color: "text-yellow-600", 
    bg: "bg-yellow-50", 
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    label: "Em Revisão"
  },
  "Planejamento": { 
    color: "text-gray-600", 
    bg: "bg-gray-50", 
    icon: <Filter className="h-3.5 w-3.5" />,
    label: "Planejamento"
  },
  "Concluído": { 
    color: "text-green-600", 
    bg: "bg-green-50", 
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Concluído"
  },
  "Aguardando Pagamento": { 
    color: "text-amber-600", 
    bg: "bg-amber-50", 
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: "Aguardando Pagamento"
  },
  // Status em inglês (banco de dados - fallback)
  "development": { 
    color: "text-blue-600", 
    bg: "bg-blue-50", 
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Em Desenvolvimento"
  },
  "review": { 
    color: "text-yellow-600", 
    bg: "bg-yellow-50", 
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    label: "Em Revisão"
  },
  "planning": { 
    color: "text-gray-600", 
    bg: "bg-gray-50", 
    icon: <Filter className="h-3.5 w-3.5" />,
    label: "Planejamento"
  },
  "completed": { 
    color: "text-green-600", 
    bg: "bg-green-50", 
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Concluído"
  },
  "waiting_payment": { 
    color: "text-amber-600", 
    bg: "bg-amber-50", 
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: "Aguardando Pagamento"
  },
};

export default function DashboardProjetos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hook de atualizações em tempo real
  const { refresh, hasUpdates } = useRealTimeUpdates("projetos", {
    interval: 10000, // 10 segundos
    onNotificationsUpdate: (data) => {
      console.log("[PROJETOS] 📬 Novas notificações detectadas:", data.unreadCount);
    },
    onResourceUpdate: ({ type, data }) => {
      if (type === "projetos") {
        console.log("[PROJETOS] 📊 Projetos atualizados, recarregando...");
        fetchProjects();
      }
    },
  });

  // Carregar projetos do banco de dados
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log("Buscando projetos...");
      const response = await fetch("/api/projetos");
      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar projetos");
      }

      const data = await response.json();
      console.log("Projetos carregados:", data);
      setProjectsList(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
      setProjectsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleNewProject = async (data: any) => {
    try {
      console.log("Criando projeto:", data);
      const response = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("Resposta da criação:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao criar projeto");
      }

      await fetchProjects();
      setModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar projeto: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: any) => {
    setProjectToEdit(project);
    setModalOpen(true);
  };

  const handleUpdateProject = async (data: any) => {
    if (!projectToEdit?.id) return;

    try {
      console.log("Atualizando projeto:", projectToEdit.id, data);
      const response = await fetch(`/api/projetos/${projectToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("Resposta da atualização:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao atualizar projeto");
      }

      await fetchProjects();
      setModalOpen(false);
      setProjectToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (project: any) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete?.id) return;

    try {
      console.log("Excluindo projeto:", projectToDelete.id);
      const response = await fetch(`/api/projetos/${projectToDelete.id}`, {
        method: "DELETE",
      });

      const responseData = await response.json();
      console.log("Resposta da exclusão:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao excluir projeto");
      }

      await fetchProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projectsList.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projectsList.length,
    emDesenvolvimento: projectsList.filter(p => p.status === "Em Desenvolvimento").length,
    emRevisao: projectsList.filter(p => p.status === "Em Revisão").length,
    concluido: projectsList.filter(p => p.status === "Concluído").length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-2xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os projetos em um só lugar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUpdates && (
              <Badge variant="destructive" className="animate-pulse">
                <RefreshCcw className="h-3 w-3 mr-1" />
                Atualizações disponíveis
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total de Projetos</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Em Desenvolvimento</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.emDesenvolvimento}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Em Revisão</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.emRevisao}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Concluídos</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.concluido}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["todos", "Em Desenvolvimento", "Em Revisão", "Concluído", "Planejamento"].map((status) => {
                  const config = statusConfig[status];
                  return (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? "" : "hover:bg-gray-50"}
                    >
                      {config?.icon}
                      <span className="ml-1.5">{status === "todos" ? "Todos" : status}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => {
            const status = statusConfig[project.status] || statusConfig["planning"];
            console.log(`[PROJETO] ${project.name}: status="${project.status}"`, status ? "✓ encontrado" : "✗ não encontrado");
            return (
              <Link
                key={project.id}
                href={`/dashboard/projetos/${project.id}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    {/* Card Header with Status */}
                    <div className={`${status.bg} px-4 py-3 border-b`}>
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 ${status.color} font-semibold text-sm`}>
                          {status.icon}
                          <span>{status.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {new Date(project.dueDate).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>

                    <CardContent className="pt-4 pb-4">
                      {/* Project Name & Client */}
                      <div className="mb-4">
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{project.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <FolderKanban className="h-3.5 w-3.5" />
                          {project.client}
                        </p>
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[32px]">
                        {project.tech?.slice(0, 4).map((tech: string, i: number) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.tech?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tech.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Progresso</span>
                          <span className="text-xs font-bold">{project.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Tasks & Team */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{project.tasks?.completed || 0}/{project.tasks?.total || 0} tarefas</span>
                        </div>
                        <div className="flex -space-x-2">
                          {project.team?.slice(0, 3).map((member: string, i: number) => (
                            <div
                              key={i}
                              className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm"
                              title={member}
                            >
                              {member.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {project.team?.length > 3 && (
                            <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                              +{project.team.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-16 pb-16">
              <div className="text-center">
                <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <FolderKanban className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {projectsList.length === 0 ? "Nenhum projeto cadastrado" : "Nenhum projeto encontrado"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {projectsList.length === 0
                    ? "Comece criando seu primeiro projeto e organize seu trabalho de forma eficiente."
                    : "Tente ajustar os filtros de busca ou crie um novo projeto."}
                </p>
                {projectsList.length === 0 ? (
                  <Button className="gap-2 h-11 px-6" onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Projeto
                  </Button>
                ) : (
                  <Button variant="outline" className="gap-2" onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Criar Novo Projeto
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <NovoProjetoModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setProjectToEdit(null);
          }}
          onSubmit={projectToEdit ? handleUpdateProject : handleNewProject}
          projectToEdit={projectToEdit}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o projeto "{projectToDelete?.name}"?
                Esta ação não pode ser desfeita e todos os dados relacionados serão excluídos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
