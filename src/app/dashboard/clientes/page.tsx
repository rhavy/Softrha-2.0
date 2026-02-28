"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Building,
  RefreshCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates";
import { useRouter } from "next/navigation";
import { hasToastBeenShown, markToastAsShown } from "@/lib/toast-dedup";
import { NovoClienteModal } from "@/components/modals/novo-cliente-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { formatCNPJ, formatCPF } from "@/lib/validators";

export default function DashboardClientes() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionType, setDeletionType] = useState("");
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchClients();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        
        // Verificar se é ADMIN
        if (data.role !== "ADMIN") {
          const toastId = "clientes-access-denied";
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

  // Hook de atualizações em tempo real
  const { refresh, hasUpdates } = useRealTimeUpdates("clientes", {
    interval: 10000, // 10 segundos
    onNotificationsUpdate: (data) => {
      console.log("[CLIENTES] 📬 Novas notificações detectadas:", data.unreadCount);
    },
    onResourceUpdate: ({ type, data }) => {
      if (type === "clientes") {
        console.log("[CLIENTES] 📊 Clientes atualizados, recarregando...");
        fetchClients();
      }
    },
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clientes");
      if (!response.ok) throw new Error("Erro ao buscar clientes");
      const data = await response.json();
      setClientsList(data);
    } catch (error) {
      console.error("Erro:", error);
      setClientsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleNewClient = async (data: any) => {
    try {
      // Enviar arrays diretamente (a API faz a conversão para string JSON)
      const payload = {
        ...data,
      };

      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "Erro ao criar cliente");

      toast({
        title: "Cliente cadastrado!",
        description: "O cliente foi cadastrado com sucesso.",
        variant: "success",
      });

      await fetchClients();
      setModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateClient = async (data: any) => {
    if (!clientToEdit?.id) return;
    try {
      // Enviar arrays diretamente (a API faz a conversão para string JSON)
      const payload = {
        ...data,
        id: clientToEdit.id,
      };

      const response = await fetch(`/api/clientes/${clientToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "Erro ao atualizar");

      toast({
        title: "Cliente atualizado!",
        description: "As informações foram atualizadas com sucesso.",
        variant: "success",
      });

      await fetchClients();
      setModalOpen(false);
      setClientToEdit(null);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete?.id) return;
    if (!deletionType) return;
    
    try {
      const response = await fetch(`/api/clientes/${clientToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clientToDelete.id,
          reason: `${deletionType}${deletionReason ? ` - ${deletionReason}` : ""}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: "Cliente excluído!",
        description: "O cliente foi marcado como excluído.",
        variant: "success",
      });

      await fetchClients();
      setDeleteDialogOpen(false);
      setDeletionReason("");
      setDeletionType("");
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: (error as any).message,
        variant: "destructive",
      });
    }
  };

  const filteredClients = clientsList.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.includes(searchTerm) ||
      client.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clientsList.length,
    active: clientsList.filter(c => c.status === "active").length,
    inactive: clientsList.filter(c => c.status === "inactive").length,
  };

  if (loading || (currentUser && currentUser.role !== "ADMIN")) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie sua base de clientes</p>
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
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
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
                  <p className="text-sm text-muted-foreground">Ativos</p>
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
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
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
                  placeholder="Buscar por nome, documento ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["todos", "active", "inactive"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "todos" ? "Todos" : status === "active" ? "Ativos" : "Inativos"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.documentType === "cpf" ? `CPF: ${formatCPF(String(client.document || ""))}` : `CNPJ: ${formatCNPJ(String(client.document || ""))}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {client.emails?.[0] && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{client.emails[0].value}</span>
                      </div>
                    )}
                    {client.phones?.[0] && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{client.phones[0].value}</span>
                      </div>
                    )}
                    {client.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{client.city} - {client.state}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Projetos</span>
                    <Badge variant="outline">{client.projectsCount || 0}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/clientes/${client.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setClientToEdit(client);
                        setModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        setClientToDelete(client);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                {clientsList.length === 0 ? "Comece cadastrando seu primeiro cliente!" : "Tente ajustar os filtros"}
              </p>
              {clientsList.length === 0 && (
                <Button className="mt-4" onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <NovoClienteModal
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setClientToEdit(null); }}
          onSubmit={clientToEdit ? handleUpdateClient : handleNewClient}
          clientToEdit={clientToEdit}
        />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão de Cliente</DialogTitle>
              <DialogDescription className="flex flex-col gap-2 text-left">
                <span>
                  Tem certeza que deseja excluir <strong>"{clientToDelete?.name}"</strong>?
                </span>
                <span className="text-amber-600 font-medium">
                  ⚠️ Esta ação é um soft delete - o cliente ficará oculto para usuários não ADMIN.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Motivo da Exclusão <span className="text-red-500">*</span>
                </label>
                <Select value={deletionType} onValueChange={setDeletionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente-solicitou">Cliente solicitou a exclusão</SelectItem>
                    <SelectItem value="projeto-cancelado">Projeto cancelado</SelectItem>
                    <SelectItem value="dados-incorretos">Dados incorretos/cadastrados por engano</SelectItem>
                    <SelectItem value="cliente-inativo">Cliente inativo há muito tempo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição Adicional (opcional)</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Informe mais detalhes sobre o motivo da exclusão..."
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletionReason("");
                  setDeletionType("");
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteClient}
                disabled={!deletionType}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
