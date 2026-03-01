"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  CheckCheck,
  RefreshCcw,
  Calendar,
  MessageSquare,
  User,
  Building,
  Phone,
  FileText,
  Eye,
  Archive,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "text-amber-600 bg-amber-100 border-amber-500",
    icon: <Clock className="h-4 w-4" />,
    label: "Pendente",
  },
  contacted: {
    color: "text-blue-600 bg-blue-100 border-blue-500",
    icon: <Mail className="h-4 w-4" />,
    label: "Contatado",
  },
  resolved: {
    color: "text-green-600 bg-green-100 border-green-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Resolvido",
  },
};

const projectTypeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  web: { label: "Desenvolvimento Web", icon: <FileText className="h-3.5 w-3.5" /> },
  mobile: { label: "Aplicativo Mobile", icon: <Phone className="h-3.5 w-3.5" /> },
  software: { label: "Software Sob Medida", icon: <Building className="h-3.5 w-3.5" /> },
  consultoria: { label: "Consultoria / CTO", icon: <User className="h-3.5 w-3.5" /> },
};

export default function MensagensPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "contacted" | "resolved">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();

    // Atualizar mensagens a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/contact-messages");
      if (!response.ok) throw new Error("Erro ao buscar mensagens");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: messageId,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, status: newStatus } : m
        )
      );

      toast({
        title: "Status atualizado!",
        description: `Mensagem marcada como ${statusConfig[newStatus]?.label}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da mensagem",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact-messages?id=${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir mensagem");

      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      toast({
        title: "Excluída!",
        description: "A mensagem foi excluída.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "all") return true;
    return m.status === filter;
  });

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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              Mensagens
            </h1>
            <p className="text-muted-foreground">
              Gerencie as mensagens enviadas pelo formulário de contato
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchMessages}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Todas as mensagens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando atendimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatados</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
              <p className="text-xs text-muted-foreground">
                Já foram contatados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">
                Atendimentos finalizados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pendentes
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-amber-600">{stats.pending}</Badge>
            )}
          </Button>
          <Button
            variant={filter === "contacted" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("contacted")}
          >
            Contatados
          </Button>
          <Button
            variant={filter === "resolved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("resolved")}
          >
            Resolvidos
          </Button>
        </div>

        {/* Lista de Mensagens */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </CardContent>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">
                {filter === "pending"
                  ? "Nenhuma mensagem pendente"
                  : filter === "contacted"
                  ? "Nenhuma mensagem contatada"
                  : filter === "resolved"
                  ? "Nenhuma mensagem resolvida"
                  : "Nenhuma mensagem"}
              </p>
              <p className="text-sm">
                {filter === "pending"
                  ? "Você está em dia com suas mensagens!"
                  : "As mensagens aparecerão aqui"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => {
              const config = statusConfig[message.status] || statusConfig.pending;
              const typeConfigItem = projectTypeConfig[message.projectType] || projectTypeConfig.web;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card
                    className={`transition-all hover:shadow-md ${
                      message.status === "pending"
                        ? "border-l-4 border-l-amber-600 bg-amber-50/50 dark:bg-amber-950/10"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Ícone de Status */}
                        <div
                          className={`p-2 rounded-full ${config.color} flex-shrink-0`}
                        >
                          {config.icon}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{message.name}</h3>
                              {message.status === "pending" && (
                                <Badge className="bg-amber-600 text-xs">Nova</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(message.createdAt).toLocaleString("pt-BR")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {message.email}
                          </div>

                          <div className="flex items-center gap-4 pt-1">
                            <Badge variant="outline" className="text-xs">
                              {typeConfigItem.icon}
                              <span className="ml-1">{typeConfigItem.label}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Building className="h-3.5 w-3.5 mr-1" />
                              {message.company}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${config.color}`}>
                              {config.icon}
                              <span className="ml-1">{config.label}</span>
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {message.message}
                          </p>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Ver detalhes
                            </Button>
                            {message.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => handleStatusChange(message.id, "contacted")}
                                >
                                  <Mail className="h-3.5 w-3.5 mr-1" />
                                  Marcar como contatado
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => handleStatusChange(message.id, "resolved")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Marcar como resolvido
                                </Button>
                              </>
                            )}
                            {message.status === "contacted" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleStatusChange(message.id, "resolved")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Marcar como resolvido
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de Detalhes da Mensagem */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              Detalhes da Mensagem
            </DialogTitle>
            <DialogDescription>
              Informações completas do contato enviado
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-base">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedMessage.email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                  <p className="text-base">{selectedMessage.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-base">{selectedMessage.phone}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Projeto</p>
                  <div className="text-base flex items-center gap-2">
                    {projectTypeConfig[selectedMessage.projectType]?.icon}
                    {projectTypeConfig[selectedMessage.projectType]?.label}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="text-base">
                    <Badge className={statusConfig[selectedMessage.status]?.color}>
                      {statusConfig[selectedMessage.status]?.icon}
                      <span className="ml-1">{statusConfig[selectedMessage.status]?.label}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Mensagem</p>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-base whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Enviado em: {new Date(selectedMessage.createdAt).toLocaleString("pt-BR")}
                {selectedMessage.updatedAt !== selectedMessage.createdAt && (
                  <>
                    <span>•</span>
                    <span>Atualizado em: {new Date(selectedMessage.updatedAt).toLocaleString("pt-BR")}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                {selectedMessage.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleStatusChange(selectedMessage.id, "contacted");
                        setDialogOpen(false);
                      }}
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Marcar como contatado
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusChange(selectedMessage.id, "resolved");
                        setDialogOpen(false);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar como resolvido
                    </Button>
                  </>
                )}
                {selectedMessage.status === "contacted" && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedMessage.id, "resolved");
                      setDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como resolvido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
