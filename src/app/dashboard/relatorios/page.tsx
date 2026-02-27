"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Download,
  RefreshCcw,
  PieChart,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Budget {
  id: string;
  projectType: string;
  complexity: string;
  timeline: string;
  estimatedMin: number;
  estimatedMax: number;
  finalValue: number | null;
  clientName: string;
  clientEmail: string;
  company: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  sent: number;
  accepted: number;
  rejected: number;
  userApproved: number;
  contractSigned: number;
  downPaymentPaid: number;
  finalPaymentPaid: number;
  completed: number;
  conversionRate: number;
  avgResponseTime: number;
  totalValue: number;
  avgTicket: number;
  lostValue: number;
  potentialValue: number;
  byProjectType: Record<string, number>;
  byComplexity: Record<string, number>;
  byTimeline: Record<string, number>;
  monthlyEvolution: { month: string; count: number; value: number }[];
}

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

export default function RelatoriosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    fetchBudgets();
  }, [period]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/orcamentos");
      if (!response.ok) throw new Error("Erro ao buscar orçamentos");
      const data = await response.json();
      
      // Filtrar por período
      const now = new Date();
      const filteredData = data.filter((budget: Budget) => {
        const budgetDate = new Date(budget.createdAt);
        const diffTime = now.getTime() - budgetDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        
        if (period === "7d") return diffDays <= 7;
        if (period === "30d") return diffDays <= 30;
        if (period === "90d") return diffDays <= 90;
        return true;
      });
      
      setBudgets(filteredData);
      calculateStats(filteredData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Budget[]) => {
    const total = data.length;
    const pending = data.filter((b) => b.status === "pending").length;
    const sent = data.filter((b) => b.status === "sent").length;
    const accepted = data.filter((b) => b.status === "accepted").length;
    const rejected = data.filter((b) => b.status === "rejected").length;
    const userApproved = data.filter((b) => b.status === "user_approved").length;
    const contractSigned = data.filter((b) => b.status === "contract_signed").length;
    const downPaymentPaid = data.filter((b) => b.status === "down_payment_paid").length;
    const finalPaymentPaid = data.filter((b) => b.status === "final_payment_paid").length;
    const completed = data.filter((b) => b.status === "completed").length;

    // Taxa de conversão = Aceitos / (Aceitos + Rejeitados)
    const convertedOrLost = accepted + rejected;
    const conversionRate = convertedOrLost > 0
      ? (accepted / convertedOrLost) * 100
      : 0;

    // Calcular tempo médio de resposta (em dias)
    const responseTimes = data
      .filter((b) => b.status !== "pending")
      .map((b) => {
        const created = new Date(b.createdAt);
        const updated = new Date(b.updatedAt);
        return (updated.getTime() - created.getTime()) / (1000 * 3600 * 24);
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calcular valores
    const acceptedBudgets = data.filter((b) => b.status === "accepted" || b.status === "completed");
    const totalValue = acceptedBudgets.reduce((sum, b) => sum + (b.finalValue || b.estimatedMax), 0);
    const avgTicket = acceptedBudgets.length > 0 ? totalValue / acceptedBudgets.length : 0;

    // Valor perdido (rejeitados)
    const rejectedBudgets = data.filter((b) => b.status === "rejected");
    const lostValue = rejectedBudgets.reduce((sum, b) => sum + (b.finalValue || b.estimatedMax), 0);

    // Valor potencial (pendentes)
    const pendingBudgets = data.filter((b) => b.status === "pending");
    const potentialValue = pendingBudgets.reduce((sum, b) => sum + (b.estimatedMax), 0);

    // Distribuição por tipo de projeto
    const byProjectType: Record<string, number> = {};
    data.forEach((b) => {
      byProjectType[b.projectType] = (byProjectType[b.projectType] || 0) + 1;
    });

    // Distribuição por complexidade
    const byComplexity: Record<string, number> = {};
    data.forEach((b) => {
      byComplexity[b.complexity] = (byComplexity[b.complexity] || 0) + 1;
    });

    // Distribuição por timeline
    const byTimeline: Record<string, number> = {};
    data.forEach((b) => {
      byTimeline[b.timeline] = (byTimeline[b.timeline] || 0) + 1;
    });

    // Evolução mensal
    const monthlyEvolutionMap = new Map<string, { count: number; value: number }>();
    data.forEach((b) => {
      const date = new Date(b.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!monthlyEvolutionMap.has(monthKey)) {
        monthlyEvolutionMap.set(monthKey, { count: 0, value: 0 });
      }
      const current = monthlyEvolutionMap.get(monthKey)!;
      current.count += 1;
      current.value += (b.finalValue || b.estimatedMax);
    });

    const monthlyEvolution = Array.from(monthlyEvolutionMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, data]) => ({
        month: key.split('-')[1] + '/' + key.split('-')[0].slice(2),
        count: data.count,
        value: data.value,
      }));

    setStats({
      total,
      pending,
      sent,
      accepted,
      rejected,
      userApproved,
      contractSigned,
      downPaymentPaid,
      finalPaymentPaid,
      completed,
      conversionRate,
      avgResponseTime,
      totalValue,
      avgTicket,
      lostValue,
      potentialValue,
      byProjectType,
      byComplexity,
      byTimeline,
      monthlyEvolution,
    });
  };

  const exportToCSV = () => {
    const headers = ["ID", "Cliente", "Email", "Empresa", "Tipo", "Status", "Valor Mínimo", "Valor Máximo", "Data Criação"];
    const rows = budgets.map((b) => [
      b.id,
      b.clientName,
      b.clientEmail,
      b.company || "",
      b.projectType,
      statusLabels[b.status],
      b.estimatedMin,
      b.estimatedMax,
      new Date(b.createdAt).toLocaleDateString("pt-BR"),
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-orcamentos-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    
    toast({
      title: "Exportado!",
      description: "Relatório exportado em CSV com sucesso.",
    });
  };

  if (isLoading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
            <h1 className="text-2xl font-bold">Relatórios de Orçamentos</h1>
            <p className="text-muted-foreground">
              Acompanhe métricas e conversão de orçamentos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={budgets.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchBudgets}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "7d", label: "Últimos 7 dias" },
            { value: "30d", label: "Últimos 30 dias" },
            { value: "90d", label: "Últimos 90 dias" },
            { value: "all", label: "Todo período" },
          ].map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value as any)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pending} pendentes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stats.conversionRate >= 50 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Acima da média</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-yellow-500" />
                    <span className="text-yellow-500">Abaixo da média</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total (Aceitos)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalValue.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ticket médio: R$ {stats.avgTicket.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgResponseTime.toFixed(1)} dias
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.avgResponseTime <= 1 ? "Resposta rápida!" : "Pode melhorar"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Valor Perdido e Potencial */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Perdido (Rejeitados)</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {stats.lostValue.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.rejected} orçamentos rejeitados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Potencial (Pendentes)</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                R$ {stats.potentialValue.toLocaleString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats.pending} orçamentos pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {[
            { status: "pending", label: "Pendentes", count: stats.pending, icon: Clock, color: "text-yellow-500" },
            { status: "sent", label: "Enviados", count: stats.sent, icon: FileText, color: "text-blue-500" },
            { status: "accepted", label: "Aceitos", count: stats.accepted, icon: CheckCircle2, color: "text-green-500" },
            { status: "contract_signed", label: "Contrato", count: stats.contractSigned, icon: FileText, color: "text-purple-500" },
            { status: "down_payment_paid", label: "Entrada Paga", count: stats.downPaymentPaid, icon: DollarSign, color: "text-teal-500" },
            { status: "completed", label: "Concluídos", count: stats.completed, icon: CheckCircle2, color: "text-green-600" },
          ].map((item) => (
            <Card key={item.status}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                  </div>
                  <item.icon className={`h-8 w-8 ${item.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Funil de Conversão
            </CardTitle>
            <CardDescription>
              Visualize o fluxo de orçamentos desde a criação até o fechamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Total de Orçamentos", count: stats.total, percentage: 100, color: "bg-gray-500" },
                { label: "Enviados", count: stats.sent, percentage: stats.total > 0 ? (stats.sent / stats.total) * 100 : 0, color: "bg-blue-500" },
                { label: "Aceitos", count: stats.accepted, percentage: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0, color: "bg-green-500" },
                { label: "Rejeitados", count: stats.rejected, percentage: stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo de Projeto */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Por Tipo de Projeto
              </CardTitle>
              <CardDescription>
                Distribuição dos orçamentos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byProjectType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    const typeLabels: Record<string, string> = {
                      web: "Website",
                      mobile: "App Mobile",
                      software: "Software",
                      landing: "Landing Page",
                      ecommerce: "E-commerce",
                      dashboard: "Dashboard",
                    };
                    const colors: Record<string, string> = {
                      web: "bg-blue-500",
                      mobile: "bg-purple-500",
                      software: "bg-indigo-500",
                      landing: "bg-teal-500",
                      ecommerce: "bg-orange-500",
                      dashboard: "bg-pink-500",
                    };
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">
                            {typeLabels[type] || type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colors[type] || "bg-gray-500"} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Por Complexidade e Prazo
              </CardTitle>
              <CardDescription>
                Distribuição por nível e urgência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Complexidade</p>
                  <div className="space-y-2">
                    {Object.entries(stats.byComplexity).map(([complexity, count]) => {
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      const colors: Record<string, string> = {
                        simple: "bg-green-500",
                        medium: "bg-amber-500",
                        complex: "bg-red-500",
                      };
                      const labels: Record<string, string> = {
                        simple: "Simples",
                        medium: "Médio",
                        complex: "Complexo",
                      };
                      return (
                        <div key={complexity}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm capitalize">{labels[complexity] || complexity}</span>
                            <span className="text-sm text-muted-foreground">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colors[complexity] || "bg-gray-500"} h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Prazo</p>
                  <div className="space-y-2">
                    {Object.entries(stats.byTimeline).map(([timeline, count]) => {
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      const colors: Record<string, string> = {
                        urgent: "bg-red-500",
                        normal: "bg-blue-500",
                        flexible: "bg-green-500",
                      };
                      const labels: Record<string, string> = {
                        urgent: "Urgente",
                        normal: "Normal",
                        flexible: "Flexível",
                      };
                      return (
                        <div key={timeline}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm capitalize">{labels[timeline] || timeline}</span>
                            <span className="text-sm text-muted-foreground">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colors[timeline] || "bg-gray-500"} h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evolução Mensal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>
              Histórico de orçamentos e valores nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.monthlyEvolution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Sem dados para exibir</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.monthlyEvolution.map((month, index) => {
                  const maxValue = Math.max(...stats.monthlyEvolution.map(m => m.value));
                  const valuePercentage = maxValue > 0 ? (month.value / maxValue) * 100 : 0;
                  const maxCount = Math.max(...stats.monthlyEvolution.map(m => m.count));
                  const countPercentage = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{month.month}</span>
                        <span className="text-muted-foreground">
                          {month.count} orçamentos • R$ {month.value.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${countPercentage}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
                            Quantidade
                          </span>
                        </div>
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${valuePercentage}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
                            Valor
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Budgets */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
            <CardDescription>
              Últimos orçamentos recebidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum orçamento no período selecionado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 10).map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/orcamentos/${budget.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{budget.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {budget.projectType} • {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {budget.estimatedMin.toLocaleString("pt-BR")}
                        </p>
                        <Badge className={statusColors[budget.status]}>
                          {statusLabels[budget.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
