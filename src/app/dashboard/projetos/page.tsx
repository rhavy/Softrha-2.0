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
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Edit2,
  Trash2,
  DollarSign,
  RefreshCcw,
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

const statusColors: Record<string, string> = {
  "Em Desenvolvimento": "bg-blue-500 text-blue-500",
  "Em Revisão": "bg-yellow-500 text-yellow-500",
  "Planejamento": "bg-gray-500 text-gray-500",
  "Concluído": "bg-green-500 text-green-500",
  "Aguardando Pagamento": "bg-amber-500 text-amber-500",
};

const statusIcons: Record<string, React.ReactNode> = {
  "Em Desenvolvimento": <Clock className="h-3 w-3" />,
  "Em Revisão": <AlertCircle className="h-3 w-3" />,
  "Planejamento": <Filter className="h-3 w-3" />,
  "Concluído": <CheckCircle2 className="h-3 w-3" />,
  "Aguardando Pagamento": <DollarSign className="h-3 w-3" />,
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Desenvolvimento</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.emDesenvolvimento}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Revisão</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.emRevisao}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold text-green-500">{stats.concluido}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["todos", "Em Desenvolvimento", "Em Revisão", "Concluído"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "todos" ? "Todos" : status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="grid gap-4">
          {filteredProjects.map((project, index) => (
            <Link 
              key={project.id}
              href={`/dashboard/projetos/${project.id}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge
                            variant="secondary"
                            className={`${statusColors[project.status]} bg-opacity-10`}
                          >
                            {statusIcons[project.status]}
                            <span className="ml-1">{project.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{project.client}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech?.map((tech: string) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Progresso</p>
                            <p className="text-sm font-medium">{project.progress}%</p>
                          </div>
                          <div className="w-32">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Entrega: {new Date(project.dueDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{project.tasks.completed}/{project.tasks.total} tarefas</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {project.team?.map((member: string, i: number) => (
                              <div
                                key={i}
                                className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary border-2 border-background"
                              >
                                {member}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(project);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {projectsList.length === 0 ? "Nenhum projeto cadastrado" : "Nenhum projeto encontrado"}
                </h3>
                <p className="text-muted-foreground">
                  {projectsList.length === 0
                    ? "Comece criando seu primeiro projeto!"
                    : "Tente ajustar os filtros ou crie um novo projeto"}
                </p>
                {projectsList.length === 0 && (
                  <Button className="mt-4 gap-2" onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Criar Primeiro Projeto
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
