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
  conversionRate: number;
  avgResponseTime: number;
  totalValue: number;
  avgTicket: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  accepted: "Aceito",
  rejected: "Rejeitado",
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
    const acceptedBudgets = data.filter((b) => b.status === "accepted");
    const totalValue = acceptedBudgets.reduce((sum, b) => sum + (b.finalValue || b.estimatedMax), 0);
    const avgTicket = acceptedBudgets.length > 0 ? totalValue / acceptedBudgets.length : 0;
    
    setStats({
      total,
      pending,
      sent,
      accepted,
      rejected,
      conversionRate,
      avgResponseTime,
      totalValue,
      avgTicket,
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

        {/* Status Breakdown */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {[
            { status: "pending", label: "Pendentes", count: stats.pending, icon: Clock, color: "text-yellow-500" },
            { status: "sent", label: "Enviados", count: stats.sent, icon: FileText, color: "text-blue-500" },
            { status: "accepted", label: "Aceitos", count: stats.accepted, icon: CheckCircle2, color: "text-green-500" },
            { status: "rejected", label: "Rejeitados", count: stats.rejected, icon: XCircle, color: "text-red-500" },
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
