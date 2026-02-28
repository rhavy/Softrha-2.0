"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Briefcase,
  Edit2,
  Trash2,
  Bell,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { hasToastBeenShown, markToastAsShown } from "@/lib/toast-dedup";
import { NovoMembroModal } from "@/components/modals/novo-membro-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  busy: "bg-yellow-500",
  away: "bg-gray-500",
};

const statusLabels: Record<string, string> = {
  active: "Disponível",
  busy: "Ocupado",
  away: "Ausente",
};

export default function DashboardEquipe() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<any>(null);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberProjects, setMemberProjects] = useState<Record<string, { current: number; past: number }>>({});
  const [memberRatings, setMemberRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchMembers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        
        // Verificar se é ADMIN
        if (data.role !== "ADMIN") {
          const toastId = "equipe-access-denied";
          if (!hasToastBeenShown(toastId)) {
            markToastAsShown(toastId);
            toast({
              title: "Acesso Restrito",
              description: "Esta página é exclusiva para administradores",
              variant: "destructive",
            });
            setTimeout(() => router.push("/dashboard"), 2000);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
    }
  };

  // Carregar membros do banco de dados
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/equipe");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar equipe");
      }
      const data = await response.json();
      setMembersList(data);

      // Carregar projetos de cada membro
      data.forEach((member: any) => {
        fetchMemberProjects(member.id);
        fetchMemberRatings(member.id);
      });
    } catch (error) {
      console.error("Erro ao carregar equipe:", error);
      setMembersList([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar projetos de um membro
  const fetchMemberProjects = async (userId: string) => {
    try {
      const response = await fetch(`/api/equipe/${userId}/projetos`);
      if (response.ok) {
        const data = await response.json();
        setMemberProjects(prev => ({
          ...prev,
          [userId]: {
            current: data.currentProjects || 0,
            past: data.pastProjects || 0,
          },
        }));
      }
    } catch (error) {
      console.error(`Erro ao buscar projetos do membro ${userId}:`, error);
    }
  };

  // Buscar avaliações de um membro
  const fetchMemberRatings = async (userId: string) => {
    try {
      const response = await fetch(`/api/equipe/${userId}/avaliacoes`);
      if (response.ok) {
        const data = await response.json();
        setMemberRatings(prev => ({
          ...prev,
          [userId]: {
            average: data.averageRating || 0,
            count: data.totalEvaluations || 0,
          },
        }));
      }
    } catch (error) {
      console.error(`Erro ao buscar avaliações do membro ${userId}:`, error);
    }
  };

  // Atualizar projetos e avaliações de todos os membros a cada 5 segundos
  useEffect(() => {
    if (membersList.length === 0) return;

    // Atualiza imediatamente
    membersList.forEach((member) => {
      fetchMemberProjects(member.id);
      fetchMemberRatings(member.id);
    });

    // Atualiza a cada 5 segundos
    const interval = setInterval(() => {
      membersList.forEach((member) => {
        fetchMemberProjects(member.id);
        fetchMemberRatings(member.id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [membersList]);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Buscar notificações não lidas
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notificacoes");
      if (response.ok) {
        const data = await response.json();
        const allNotifications = data.notifications || [];
        const unreadNotifications = allNotifications.filter((n: any) => !n.read);
        setNotifications(unreadNotifications.slice(0, 5)); // Últimas 5 não lidas
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notificacoes/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Buscar notificações ao abrir o popover
  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

  // Atualizar notificações a cada 10 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNewMember = async (data: any) => {
    try {
      // Buscar dados do usuário selecionado
      const userResponse = await fetch(`/api/equipe/usuarios-disponiveis`);
      let users = [];
      if (userResponse.ok) {
        users = await userResponse.json();
      }
      
      const selectedUser = users.find((u: any) => u.id === data.userId);
      
      if (!selectedUser) {
        throw new Error("Usuário selecionado não encontrado");
      }

      // Atualizar usuário para TEAM_MEMBER com os dados fornecidos
      const response = await fetch(`/api/equipe/${data.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: data.role, // Cargo
          area: data.area,
          skills: data.technologies,
          status: data.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao adicionar membro");
      }

      await fetchMembers();
      setModalOpen(false);
      toast({
        title: "Membro adicionado!",
        description: `${selectedUser.name} foi adicionado à equipe como ${data.role}.`,
      });
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleEditMember = (member: any) => {
    setMemberToEdit(member);
    setModalOpen(true);
  };

  const handleUpdateMember = async (data: any) => {
    if (!memberToEdit?.id) return;

    try {
      const response = await fetch(`/api/equipe/${memberToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar membro");
      }

      await fetchMembers();
      setModalOpen(false);
      setMemberToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (member: any) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete?.id) return;

    try {
      const response = await fetch(`/api/equipe/${memberToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir membro");
      }

      await fetchMembers();
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      toast({
        title: "Membro removido!",
        description: "O membro foi removido da equipe.",
      });
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const filteredMembers = membersList.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: membersList.length,
    active: membersList.filter(m => m.status === "active").length,
    busy: membersList.filter(m => m.status === "busy").length,
    away: membersList.filter(m => m.status === "away").length,
  };

  if (loading || (currentUser && currentUser.role !== "ADMIN")) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando equipe...</p>
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
            <h1 className="text-2xl font-bold">Equipe</h1>
            <p className="text-muted-foreground">
              Gerencie os membros da sua equipe
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notificações */}
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Notificações</h4>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount} não lidas
                      </Badge>
                    )}
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma notificação não lida</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {unreadCount > 0 && (
                  <div className="p-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        // Marcar todas como lidas
                        setNotifications([]);
                        setUnreadCount(0);
                      }}
                    >
                      Marcar todas como lidas
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Membro
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
                <Users className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                  <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocupados</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.busy}</p>
                </div>
                <Briefcase className="h-8 w-8 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ausentes</p>
                  <p className="text-2xl font-bold text-gray-500">{stats.away}</p>
                </div>
                <UserX className="h-8 w-8 text-gray-500/20" />
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
                  placeholder="Buscar membro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["todos", "active", "busy", "away"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "todos" ? "Todos" : statusLabels[status]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${statusColors[member.status]}`} />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-muted-foreground">Atuais</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {memberProjects[member.id]?.current || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">Passados</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {memberProjects[member.id]?.past || 0}
                      </p>
                    </div>
                  </div>

                  {/* Avaliação */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-muted-foreground">Avaliação</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-2xl font-bold text-yellow-600">
                        {memberRatings[member.id]?.average ? memberRatings[member.id].average.toFixed(1) : "—"}
                      </p>
                      {memberRatings[member.id]?.average && (
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(memberRatings[member.id].average)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {memberRatings[member.id]?.count > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {memberRatings[member.id].count} avaliação{memberRatings[member.id].count > 1 ? "ões" : ""}
                      </p>
                    )}
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {member.skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </Button>
                    {member.phone && (
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Phone className="h-3 w-3" />
                        Ligar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {membersList.length === 0 ? "Nenhum membro cadastrado" : "Nenhum membro encontrado"}
                </h3>
                <p className="text-muted-foreground">
                  {membersList.length === 0
                    ? "Comece adicionando seu primeiro membro!"
                    : "Tente ajustar os filtros ou adicione um novo membro"}
                </p>
                {membersList.length === 0 && (
                  <Button className="mt-4 gap-2" onClick={() => setModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Adicionar Primeiro Membro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <NovoMembroModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setMemberToEdit(null);
          }}
          onSubmit={memberToEdit ? handleUpdateMember : handleNewMember}
          memberToEdit={memberToEdit}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{memberToDelete?.name}"? 
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteMember}>
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
