"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  DollarSign,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  TrendingUp,
  Users,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates";
import { useRouter } from "next/navigation";

interface Budget {
  id: string;
  projectType: string;
  complexity: string;
  timeline: string;
  features: string | any[];
  integrations: string | any[];
  pages: number;
  estimatedMin: number;
  estimatedMax: number;
  finalValue: number | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  company: string | null;
  details: string | null;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  // Status de orçamentos (fluxo completo)
  "pending": {
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    icon: <Clock className="h-3.5 w-3.5" />,
    label: "Pendente"
  },
  "sent": {
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-500",
    icon: <Mail className="h-3.5 w-3.5" />,
    label: "Enviado"
  },
  "accepted": {
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Aceito"
  },
  "rejected": {
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Rejeitado"
  },
  "user_approved": {
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Aprovado pelo Cliente"
  },
  "contract_sent": {
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    border: "border-indigo-500",
    icon: <FileText className="h-3.5 w-3.5" />,
    label: "Contrato Enviado"
  },
  "contract_signed": {
    color: "text-purple-600",
    bg: "bg-purple-100",
    border: "border-purple-500",
    icon: <FileText className="h-3.5 w-3.5" />,
    label: "Contrato Assinado"
  },
  "down_payment_sent": {
    color: "text-amber-600",
    bg: "bg-amber-100",
    border: "border-amber-500",
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: "Aguardando Entrada"
  },
  "down_payment_paid": {
    color: "text-teal-600",
    bg: "bg-teal-100",
    border: "border-teal-500",
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: "Entrada Paga"
  },
  "final_payment_sent": {
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-500",
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: "Aguardando Final"
  },
  "final_payment_paid": {
    color: "text-lime-600",
    bg: "bg-lime-100",
    border: "border-lime-500",
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: "Final Pago"
  },
  "completed": {
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-600",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Concluído"
  },
};

const projectTypeLabels: Record<string, string> = {
  web: "Site Web",
  mobile: "App Mobile",
  software: "Software",
  landing: "Landing Page",
  ecommerce: "E-commerce",
  dashboard: "Dashboard",
};

export default function OrcamentosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hook de atualizações em tempo real
  const { refresh, hasUpdates } = useRealTimeUpdates("orcamentos", {
    interval: 10000, // 10 segundos
    onNotificationsUpdate: (data) => {
      console.log("[ORÇAMENTOS] 📬 Novas notificações detectadas:", data.unreadCount);
    },
    onResourceUpdate: ({ type, data }) => {
      if (type === "orcamentos") {
        console.log("[ORÇAMENTOS] 📊 Orçamentos atualizados, recarregando...");
        fetchBudgets();
      }
    },
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/orcamentos`);
      if (!response.ok) throw new Error("Erro ao buscar orçamentos");
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetStatus = async (budgetId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/orcamentos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ budgetId, status: newStatus }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      setBudgets((prev) =>
        prev.map((b) => (b.id === budgetId ? { ...b, status: newStatus } : b))
      );

      toast({
        title: "Status atualizado!",
        description: "O status do orçamento foi atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.clientName.toLowerCase().includes(search.toLowerCase()) ||
      budget.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      budget.company?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "todos" || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
  const paginatedBudgets = filteredBudgets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: budgets.length,
    pending: budgets.filter((b) => b.status === "pending").length,
    sent: budgets.filter((b) => b.status === "sent").length,
    accepted: budgets.filter((b) => b.status === "accepted").length,
    contractSigned: budgets.filter((b) => b.status === "contract_signed").length,
    downPaymentPaid: budgets.filter((b) => b.status === "down_payment_paid").length,
    completed: budgets.filter((b) => b.status === "completed").length,
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Orçamentos</h1>
              <p className="text-muted-foreground">
                Gerencie as solicitações de orçamento recebidas
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
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total de Orçamentos</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Pendentes</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Enviados</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.sent}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Contratos Assinados</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{stats.contractSigned}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Entrada Paga</p>
                  <p className="text-3xl font-bold mt-1 text-teal-600">{stats.downPaymentPaid}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-teal-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Concluídos</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.completed}</p>
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
                  placeholder="Buscar por cliente, email ou empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["todos", "pending", "sent", "contract_signed", "down_payment_paid", "completed"].map((statusKey) => {
                  const config = statusConfig[statusKey];
                  const labelMap: Record<string, string> = {
                    "todos": "Todos",
                    "pending": "Pendentes",
                    "sent": "Enviados",
                    "contract_signed": "Contratos Assinados",
                    "down_payment_paid": "Entrada Paga",
                    "completed": "Concluídos",
                  };
                  return (
                    <Button
                      key={statusKey}
                      variant={statusFilter === statusKey ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setStatusFilter(statusKey);
                        setCurrentPage(1);
                      }}
                      className={statusFilter === statusKey ? "" : "hover:bg-gray-50"}
                    >
                      {config?.icon}
                      <span className="ml-1.5">{labelMap[statusKey]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budgets List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            </CardContent>
          </Card>
        ) : paginatedBudgets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FileText className="h-12 w-12 mb-2 opacity-50" />
                <p>Nenhum orçamento encontrado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {paginatedBudgets.map((budget) => (
                <Card
                  key={budget.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/orcamentos/${budget.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{budget.clientName}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {budget.clientEmail}
                            </span>
                            {budget.company && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {budget.company}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${statusConfig[budget.status]?.color} ${statusConfig[budget.status]?.bg}`} variant="secondary">
                        {statusConfig[budget.status]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Projeto</p>
                        <p className="font-medium">{projectTypeLabels[budget.projectType] || budget.projectType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Complexidade</p>
                        <p className="font-medium capitalize">{budget.complexity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prazo</p>
                        <p className="font-medium capitalize">{budget.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Estimado</p>
                        <p className="font-medium text-primary">
                          R$ {budget.estimatedMin.toLocaleString("pt-BR")} - R$ {budget.estimatedMax.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {budget.details && (
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground mb-1">Detalhes</p>
                        <p className="text-sm">{budget.details}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex gap-2">
                        {budget.status === "sent" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBudgetStatus(budget.id, "accepted")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aceitar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBudgetStatus(budget.id, "rejected")}
                            >
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
