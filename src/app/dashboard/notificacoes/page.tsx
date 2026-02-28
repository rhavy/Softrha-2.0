"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Bell,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
  RefreshCcw,
  Calendar,
  DollarSign,
  FileText,
  User,
  Projector,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  read: boolean;
  link: string | null;
  metadata: any;
  createdAt: string;
}

const typeConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  info: {
    color: "text-blue-600 bg-blue-100 border-blue-500",
    icon: <Info className="h-4 w-4" />,
    label: "Informação",
  },
  success: {
    color: "text-green-600 bg-green-100 border-green-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Sucesso",
  },
  warning: {
    color: "text-amber-600 bg-amber-100 border-amber-500",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Atenção",
  },
  error: {
    color: "text-red-600 bg-red-100 border-red-500",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Erro",
  },
};

const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  general: { color: "text-gray-600", icon: <Bell className="h-3.5 w-3.5" /> },
  project: { color: "text-blue-600", icon: <Projector className="h-3.5 w-3.5" /> },
  client: { color: "text-purple-600", icon: <User className="h-3.5 w-3.5" /> },
  budget: { color: "text-green-600", icon: <DollarSign className="h-3.5 w-3.5" /> },
  task: { color: "text-amber-600", icon: <Clock className="h-3.5 w-3.5" /> },
  payment: { color: "text-emerald-600", icon: <DollarSign className="h-3.5 w-3.5" /> },
  contract: { color: "text-indigo-600", icon: <FileText className="h-3.5 w-3.5" /> },
};

export default function NotificacoesPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchNotifications();
    
    // Atualizar notificações a cada 10 segundos
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notificacoes");
      if (!response.ok) throw new Error("Erro ao buscar notificações");
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${notificationId}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Erro ao marcar como lida");

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );

      toast({
        title: "Notificação lida!",
        description: "A notificação foi marcada como lida.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notificacoes/read-all", {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Erro ao marcar todas como lidas");

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      toast({
        title: "Todas lidas!",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir notificação");

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      toast({
        title: "Excluída!",
        description: "A notificação foi excluída.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notificações
            </h1>
            <p className="text-muted-foreground">
              Acompanhe todas as notificações do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchNotifications}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Todas as notificações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">
                Pendentes de leitura
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lidas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {notifications.length - unreadCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Já visualizadas
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
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Não lidas
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-blue-600">{unreadCount}</Badge>
            )}
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("read")}
          >
            Lidas
          </Button>
        </div>

        {/* Lista de Notificações */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">
                {filter === "unread"
                  ? "Nenhuma notificação não lida"
                  : filter === "read"
                  ? "Nenhuma notificação lida"
                  : "Nenhuma notificação"}
              </p>
              <p className="text-sm">
                {filter === "unread"
                  ? "Você está em dia com suas notificações!"
                  : "As notificações aparecerão aqui"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.info;
              const categoryConfigItem = categoryConfig[notification.category] || categoryConfig.general;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read
                        ? "border-l-4 border-l-blue-600 bg-blue-50/50 dark:bg-blue-950/10"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Ícone */}
                        <div
                          className={`p-2 rounded-full ${config.color} flex-shrink-0`}
                        >
                          {config.icon}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.read && (
                                <Badge className="bg-blue-600 text-xs">Nova</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(notification.createdAt).toLocaleString("pt-BR")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <Badge variant="outline" className="text-xs">
                              {categoryConfigItem.icon}
                              <span className="ml-1 capitalize">{notification.category}</span>
                            </Badge>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Marcar como lida
                              </Button>
                            )}
                            {notification.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = notification.link!;
                                }}
                              >
                                Abrir
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
    </DashboardLayout>
  );
}
