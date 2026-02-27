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
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  Trash2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Log {
  id: string;
  type: string;
  category: string;
  level: string;
  userId: string | null;
  entityId: string | null;
  entityType: string | null;
  action: string;
  description: string | null;
  metadata: any;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

const typeLabels: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Exclusão",
  VIEW: "Visualização",
  LOGIN: "Login",
  LOGOUT: "Logout",
  PAYMENT: "Pagamento",
  CONTRACT: "Contrato",
  SCHEDULE: "Agendamento",
  NOTIFICATION: "Notificação",
  SYSTEM: "Sistema",
};

const categoryLabels: Record<string, string> = {
  PROJECT: "Projeto",
  BUDGET: "Orçamento",
  CLIENT: "Cliente",
  TASK: "Tarefa",
  CONTRACT: "Contrato",
  PAYMENT: "Pagamento",
  SCHEDULE: "Agendamento",
  USER: "Usuário",
  SYSTEM: "Sistema",
  NOTIFICATION: "Notificação",
};

const levelConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  INFO: {
    color: "text-blue-600 bg-blue-100 border-blue-500",
    icon: <Info className="h-3.5 w-3.5" />,
    label: "Informação",
  },
  WARNING: {
    color: "text-amber-600 bg-amber-100 border-amber-500",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Atenção",
  },
  ERROR: {
    color: "text-red-600 bg-red-100 border-red-500",
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Erro",
  },
  SUCCESS: {
    color: "text-green-600 bg-green-100 border-green-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Sucesso",
  },
};

const typeIcons: Record<string, React.ReactNode> = {
  CREATE: <CheckCircle2 className="h-3.5 w-3.5" />,
  UPDATE: <RefreshCcw className="h-3.5 w-3.5" />,
  DELETE: <Trash2 className="h-3.5 w-3.5" />,
  VIEW: <Eye className="h-3.5 w-3.5" />,
  LOGIN: <User className="h-3.5 w-3.5" />,
  LOGOUT: <User className="h-3.5 w-3.5" />,
  PAYMENT: <Activity className="h-3.5 w-3.5" />,
  CONTRACT: <FileText className="h-3.5 w-3.5" />,
  SCHEDULE: <Calendar className="h-3.5 w-3.5" />,
  NOTIFICATION: <Activity className="h-3.5 w-3.5" />,
  SYSTEM: <Activity className="h-3.5 w-3.5" />,
};

export default function LogsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [levelFilter, setLevelFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, typeFilter, categoryFilter, levelFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (typeFilter !== "todos") params.append("type", typeFilter);
      if (categoryFilter !== "todos") params.append("category", categoryFilter);
      if (levelFilter !== "todos") params.append("level", levelFilter);
      if (dateFilter) {
        params.append("startDate", new Date(dateFilter).toISOString());
        params.append("endDate", new Date(dateFilter + "T23:59:59").toISOString());
      }

      const response = await fetch(`/api/logs?${params}`);
      if (!response.ok) throw new Error("Erro ao buscar logs");
      const data = await response.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (log: Log) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Tem certeza que deseja excluir este log?")) return;

    try {
      const response = await fetch(`/api/logs/${logId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao excluir log");

      toast({
        title: "Log excluído!",
        description: "O log foi excluído com sucesso.",
      });

      fetchLogs();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o log",
        variant: "destructive",
      });
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      ["Data", "Tipo", "Categoria", "Nível", "Ação", "Usuário", "Entidade"],
      ...logs.map((log) => [
        new Date(log.createdAt).toLocaleString("pt-BR"),
        typeLabels[log.type] || log.type,
        categoryLabels[log.category] || log.category,
        levelConfig[log.level]?.label || log.level,
        log.action,
        log.user?.name || "Sistema",
        `${log.entityType || ""} ${log.entityId || ""}`,
      ]),
    ]
      .map((row) => row.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado!",
      description: "Logs exportados para CSV com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Logs do Sistema</h1>
            <p className="text-muted-foreground">
              Rastreamento completo de todas as ações no sistema
            </p>
          </div>
          <Button onClick={handleExportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">
                Na página atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Criações</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.type === "CREATE").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
              <RefreshCcw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.type === "UPDATE").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exclusões</CardTitle>
              <Trash2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.type === "DELETE").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ação, descrição..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nível</label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {Object.entries(levelConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Logs</CardTitle>
            <CardDescription>
              Todas as ações registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {typeIcons[log.type]}
                            {typeLabels[log.type] || log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{categoryLabels[log.category] || log.category}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={levelConfig[log.level]?.color}>
                            {levelConfig[log.level]?.icon}
                            {levelConfig[log.level]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {log.action}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.user?.name || "Sistema"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.entityType ? (
                            <span className="text-muted-foreground">
                              {log.entityType}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(log)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Paginação */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Detalhe do Log */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes do Log
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre o registro
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={levelConfig[selectedLog.level]?.color}>
                    {levelConfig[selectedLog.level]?.icon}
                    {levelConfig[selectedLog.level]?.label}
                  </Badge>
                  <Badge variant="outline">
                    {typeLabels[selectedLog.type]}
                  </Badge>
                  <Badge variant="secondary">
                    {categoryLabels[selectedLog.category]}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedLog.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>

              {/* Informações */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold">Ação</label>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>

                {selectedLog.description && (
                  <div>
                    <label className="text-sm font-semibold">Descrição</label>
                    <Textarea
                      value={selectedLog.description || ""}
                      readOnly
                      rows={3}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold">Usuário</label>
                    <p className="text-sm">
                      {selectedLog.user?.name || "Sistema"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLog.user?.email || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Entidade</label>
                    <p className="text-sm">
                      {selectedLog.entityType || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLog.entityId || "—"}
                    </p>
                  </div>
                </div>

                {selectedLog.ipAddress && (
                  <div>
                    <label className="text-sm font-semibold">IP Address</label>
                    <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                  </div>
                )}

                {selectedLog.changes && (
                  <div>
                    <label className="text-sm font-semibold">Mudanças</label>
                    <div className="mt-2 space-y-2">
                      {selectedLog.changes.before && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs">
                          <p className="font-semibold text-red-700">Antes:</p>
                          <pre className="mt-1 text-red-600 overflow-auto">
                            {JSON.stringify(selectedLog.changes.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.changes.after && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-xs">
                          <p className="font-semibold text-green-700">Depois:</p>
                          <pre className="mt-1 text-green-600 overflow-auto">
                            {JSON.stringify(selectedLog.changes.after, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-semibold">Metadados</label>
                    <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedLog.entityId && selectedLog.entityType) {
                      // Redirecionar para a entidade
                      const routes: Record<string, string> = {
                        Project: `/dashboard/projetos/${selectedLog.entityId}`,
                        Budget: `/dashboard/orcamentos/${selectedLog.entityId}`,
                        Client: `/dashboard/clientes/${selectedLog.entityId}`,
                      };
                      const route = routes[selectedLog.entityType];
                      if (route) router.push(route);
                    }
                  }}
                  disabled={!selectedLog.entityId}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Entidade
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteLog(selectedLog.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Log
                </Button>
                <Button onClick={() => setIsDetailDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
