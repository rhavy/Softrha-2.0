"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Mail,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Building,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  projectType: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  contacted: "Contatado",
  resolved: "Resolvido",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  contacted: "default",
  resolved: "outline",
};

const projectTypeLabels: Record<string, string> = {
  web: "Desenvolvimento Web",
  mobile: "Aplicativo Mobile",
  software: "Software Sob Medida",
  consultoria: "Consultoria",
};

const ITEMS_PER_PAGE = 10;

export default function ContatoAdmin() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/contato");
      if (!response.ok) {
        throw new Error("Erro ao buscar mensagens");
      }
      const data = await response.json();
      setMessages(data);
      setFilteredMessages(data);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    if (projectTypeFilter !== "all") {
      filtered = filtered.filter((msg) => msg.projectType === projectTypeFilter);
    }

    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, projectTypeFilter, messages]);

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageMessages = filteredMessages.slice(startIndex, endIndex);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contato/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      toast({
        title: "Status atualizado",
        description: "O status foi atualizado com sucesso.",
      });

      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contato/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir mensagem");
      }

      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso.",
      });

      fetchMessages();
      setDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const headers = ["Nome", "Email", "Empresa", "Telefone", "Tipo", "Status", "Data"];
    const rows = filteredMessages.map((msg) => [
      msg.name,
      msg.email,
      msg.company,
      msg.phone,
      projectTypeLabels[msg.projectType] || msg.projectType,
      statusLabels[msg.status] || msg.status,
      new Date(msg.createdAt).toLocaleDateString("pt-BR"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contatos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Exportação concluída",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  const stats = {
    total: messages.length,
    pending: messages.filter((m) => m.status === "pending").length,
    contacted: messages.filter((m) => m.status === "contacted").length,
    resolved: messages.filter((m) => m.status === "resolved").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Mensagens de Contato</h1>
            <p className="text-cyan-100/60 mt-1">
              Gerencie as mensagens recebidas pelo formulário de contato
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={fetchMessages} variant="secondary" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-slate-900/60 border-cyan-400/20">
              <CardHeader className="pb-3">
                <CardDescription className="text-cyan-100/60 text-xs uppercase tracking-wider">
                  Total
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-white">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-slate-900/60 border-yellow-400/20">
              <CardHeader className="pb-3">
                <CardDescription className="text-yellow-100/60 text-xs uppercase tracking-wider">
                  Pendentes
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-yellow-400">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-slate-900/60 border-blue-400/20">
              <CardHeader className="pb-3">
                <CardDescription className="text-blue-100/60 text-xs uppercase tracking-wider">
                  Contatados
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-blue-400">{stats.contacted}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-slate-900/60 border-green-400/20">
              <CardHeader className="pb-3">
                <CardDescription className="text-green-100/60 text-xs uppercase tracking-wider">
                  Resolvidos
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-green-400">{stats.resolved}</CardTitle>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/60 border-cyan-400/20">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-100/90 text-xs uppercase tracking-wider">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-100/40" />
                  <Input
                    placeholder="Nome, email ou empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-100/90 text-xs uppercase tracking-wider">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-950/50 border-cyan-400/20 text-cyan-100">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-400/20">
                    <SelectItem value="all" className="text-cyan-100">Todos</SelectItem>
                    <SelectItem value="pending" className="text-cyan-100">Pendentes</SelectItem>
                    <SelectItem value="contacted" className="text-cyan-100">Contatados</SelectItem>
                    <SelectItem value="resolved" className="text-cyan-100">Resolvidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-100/90 text-xs uppercase tracking-wider">Tipo de Projeto</Label>
                <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                  <SelectTrigger className="bg-slate-950/50 border-cyan-400/20 text-cyan-100">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-400/20">
                    <SelectItem value="all" className="text-cyan-100">Todos</SelectItem>
                    <SelectItem value="web" className="text-cyan-100">Web</SelectItem>
                    <SelectItem value="mobile" className="text-cyan-100">Mobile</SelectItem>
                    <SelectItem value="software" className="text-cyan-100">Software</SelectItem>
                    <SelectItem value="consultoria" className="text-cyan-100">Consultoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-slate-900/60 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-white">Mensagens Recebidas</CardTitle>
            <CardDescription className="text-cyan-100/60">
              {filteredMessages.length} mensagem(s) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-cyan-100/60">Carregando...</div>
            ) : currentPageMessages.length === 0 ? (
              <div className="text-center py-8 text-cyan-100/60">
                Nenhuma mensagem encontrada
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-cyan-100/60">Nome</TableHead>
                      <TableHead className="text-cyan-100/60">Email</TableHead>
                      <TableHead className="text-cyan-100/60">Empresa</TableHead>
                      <TableHead className="text-cyan-100/60">Tipo</TableHead>
                      <TableHead className="text-cyan-100/60">Status</TableHead>
                      <TableHead className="text-cyan-100/60">Data</TableHead>
                      <TableHead className="text-right text-cyan-100/60">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium text-white">{message.name}</TableCell>
                        <TableCell className="text-cyan-100/70">{message.email}</TableCell>
                        <TableCell className="text-cyan-100/70">{message.company}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-cyan-400/30 text-cyan-100">
                            {projectTypeLabels[message.projectType] || message.projectType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariants[message.status] || "default"}
                            className="text-xs"
                          >
                            {statusLabels[message.status] || message.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-cyan-100/70">
                          {new Date(message.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-cyan-100/60">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-cyan-400/20">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-cyan-400" />
                  Detalhes da Mensagem
                </DialogTitle>
                <DialogDescription className="text-cyan-100/60">
                  {new Date(selectedMessage.createdAt).toLocaleString("pt-BR")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-cyan-100/60 text-xs uppercase flex items-center gap-2">
                      <User className="h-3 w-3" /> Nome
                    </Label>
                    <p className="text-white">{selectedMessage.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-cyan-100/60 text-xs uppercase flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <a href={`mailto:${selectedMessage.email}`} className="text-cyan-400 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-cyan-100/60 text-xs uppercase flex items-center gap-2">
                      <Building className="h-3 w-3" /> Empresa
                    </Label>
                    <p className="text-white">{selectedMessage.company}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-cyan-100/60 text-xs uppercase flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Telefone
                    </Label>
                    <a href={`tel:${selectedMessage.phone}`} className="text-cyan-400 hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-cyan-100/60 text-xs uppercase flex items-center gap-2">
                    <Briefcase className="h-3 w-3" /> Tipo de Projeto
                  </Label>
                  <Badge variant="outline" className="border-cyan-400/30 text-cyan-100 w-fit">
                    {projectTypeLabels[selectedMessage.projectType] || selectedMessage.projectType}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-cyan-100/60 text-xs uppercase flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Mensagem
                  </Label>
                  <Textarea
                    value={selectedMessage.message}
                    readOnly
                    className="bg-slate-950/50 border-cyan-400/20 text-white min-h-[120px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-cyan-100/60 text-xs uppercase">Status</Label>
                  <Select
                    value={selectedMessage.status}
                    onValueChange={(value) => handleUpdateStatus(selectedMessage.id, value)}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-cyan-400/20 text-cyan-100 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-cyan-400/20">
                      <SelectItem value="pending" className="text-cyan-100">Pendente</SelectItem>
                      <SelectItem value="contacted" className="text-cyan-100">Contatado</SelectItem>
                      <SelectItem value="resolved" className="text-cyan-100">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
