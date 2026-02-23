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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  accepted: "Aceito",
  rejected: "Rejeitado",
  user_approved: "Aprovado pelo Cliente",
  contract_sent: "Contrato Enviado",
  contract_signed: "Contrato Assinado",
  down_payment_sent: "Aguardando Entrada",
  down_payment_paid: "Entrada Paga",
  final_payment_sent: "Aguardando Final",
  final_payment_paid: "Final Pago",
  completed: "Concluído",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  user_approved: "bg-emerald-500",
  contract_sent: "bg-indigo-500",
  contract_signed: "bg-purple-500",
  down_payment_sent: "bg-amber-500",
  down_payment_paid: "bg-teal-500",
  final_payment_sent: "bg-orange-500",
  final_payment_paid: "bg-lime-500",
  completed: "bg-green-600",
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

  useEffect(() => {
    fetchBudgets();
  }, [statusFilter]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/orcamentos?status=${statusFilter}`);
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
    return matchesSearch;
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
          <div>
            <h1 className="text-2xl font-bold">Orçamentos</h1>
            <p className="text-muted-foreground">
              Gerencie as solicitações de orçamento recebidas
            </p>
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
                <FileText className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                  <p className="text-2xl font-bold">{stats.sent}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aceitos</p>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
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
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, email ou empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["todos", "pending", "sent", "accepted", "contract_signed", "down_payment_paid", "completed"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                  >
                    {status === "todos" ? "Todos" : statusLabels[status]}
                  </Button>
                ))}
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
                      <Badge className={statusColors[budget.status]}>
                        {statusLabels[budget.status]}
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
                        {budget.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBudgetStatus(budget.id, "sent")}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Marcar como Enviado
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBudgetStatus(budget.id, "accepted")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Aceitar
                            </Button>
                          </>
                        )}
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
