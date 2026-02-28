"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Users,
  Building,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { hasToastBeenShown, markToastAsShown } from "@/lib/toast-dedup";

interface TeamEvaluation {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  projectName: string;
  rating: number;
  comment: string | null;
  evaluatorName: string;
  createdAt: string;
}

interface ClientEvaluation {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  rating: number;
  comment: string | null;
  evaluatorName: string;
  createdAt: string;
}

interface Stats {
  team: {
    totalEvaluations: number;
    averageRating: number;
    topRated: { name: string; average: number; count: number }[];
    byMember: Record<string, { name: string; count: number; average: number }>;
  };
  clients: {
    totalEvaluations: number;
    averageRating: number;
    topRated: { name: string; average: number; count: number }[];
    byClient: Record<string, { name: string; count: number; average: number }>;
  };
}

export default function AvaliacoesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamEvaluations, setTeamEvaluations] = useState<TeamEvaluation[]>([]);
  const [clientEvaluations, setClientEvaluations] = useState<ClientEvaluation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"team" | "clients">("team");
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");

  useEffect(() => {
    fetchCurrentUser();
    fetchEvaluations();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
        
        // Verificar se é ADMIN
        if (data.role !== "ADMIN") {
          const toastId = "evaluations-access-denied";
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

  const fetchEvaluations = async () => {
    try {
      const response = await fetch("/api/avaliacoes");
      if (!response.ok) throw new Error("Erro ao buscar avaliações");
      const data = await response.json();

      setTeamEvaluations(data.team || []);
      setClientEvaluations(data.clients || []);
      calculateStats(data);
    } catch (error) {
      const toastId = "evaluations-load-error";
      if (!hasToastBeenShown(toastId)) {
        markToastAsShown(toastId);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as avaliações",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: any) => {
    const team = data.team || [];
    const clients = data.clients || [];

    // Stats da Equipe
    const teamByMember = team.reduce((acc: any, item: any) => {
      if (!acc[item.memberId]) {
        acc[item.memberId] = { name: item.memberName, count: 0, total: 0 };
      }
      acc[item.memberId].count++;
      acc[item.memberId].total += item.rating;
      return acc;
    }, {});

    const teamByMemberFormatted = Object.values(teamByMember).map((item: any) => ({
      name: item.name,
      count: item.count,
      average: Math.round((item.total / item.count) * 10) / 10,
    }));

    const teamTopRated = teamByMemberFormatted
      .sort((a: any, b: any) => b.average - a.average)
      .slice(0, 5);

    // Stats dos Clientes
    const clientByClient = clients.reduce((acc: any, item: any) => {
      if (!acc[item.clientId]) {
        acc[item.clientId] = { name: item.clientName, count: 0, total: 0 };
      }
      acc[item.clientId].count++;
      acc[item.clientId].total += item.rating;
      return acc;
    }, {});

    const clientByClientFormatted = Object.values(clientByClient).map((item: any) => ({
      name: item.name,
      count: item.count,
      average: Math.round((item.total / item.count) * 10) / 10,
    }));

    const clientTopRated = clientByClientFormatted
      .sort((a: any, b: any) => b.average - a.average)
      .slice(0, 5);

    setStats({
      team: {
        totalEvaluations: team.length,
        averageRating: team.length > 0
          ? Math.round((team.reduce((sum: number, e: any) => sum + e.rating, 0) / team.length) * 10) / 10
          : 0,
        topRated: teamTopRated,
        byMember: teamByMemberFormatted.reduce((acc: any, item: any) => {
          acc[item.name] = item;
          return acc;
        }, {}),
      },
      clients: {
        totalEvaluations: clients.length,
        averageRating: clients.length > 0
          ? Math.round((clients.reduce((sum: number, e: any) => sum + e.rating, 0) / clients.length) * 10) / 10
          : 0,
        topRated: clientTopRated,
        byClient: clientByClientFormatted.reduce((acc: any, item: any) => {
          acc[item.name] = item;
          return acc;
        }, {}),
      },
    });
  };

  const filterEvaluations = (evaluations: any[]) => {
    if (filter === "all") return evaluations;
    return evaluations.filter((e) => e.rating === parseInt(filter));
  };

  const exportToCSV = () => {
    const headers = ["Tipo", "Nome", "Projeto", "Avaliação", "Comentário", "Avaliador", "Data"];
    const rows = [
      ...teamEvaluations.map((e) => [
        "Equipe",
        e.memberName,
        e.projectName,
        e.rating,
        e.comment || "",
        e.evaluatorName,
        new Date(e.createdAt).toLocaleDateString("pt-BR"),
      ]),
      ...clientEvaluations.map((e) => [
        "Cliente",
        e.clientName,
        e.projectName,
        e.rating,
        e.comment || "",
        e.evaluatorName,
        new Date(e.createdAt).toLocaleDateString("pt-BR"),
      ]),
    ];

    const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `avaliacoes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    const toastId = "evaluations-csv-exported";
    if (!hasToastBeenShown(toastId)) {
      markToastAsShown(toastId);
      toast({
        title: "Exportado!",
        description: "Avaliações exportadas em CSV com sucesso.",
      });
    }
  };

  if (isLoading || (currentUser && currentUser.role !== "ADMIN")) {
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
            <h1 className="text-2xl font-bold">Avaliações</h1>
            <p className="text-muted-foreground">
              Acompanhe avaliações de membros da equipe e clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchEvaluations}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Equipe</p>
                  <p className="text-3xl font-bold mt-1">{stats?.team.totalEvaluations || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Média Equipe</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-green-600">{stats?.team.averageRating || 0}</p>
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Clientes</p>
                  <p className="text-3xl font-bold mt-1">{stats?.clients.totalEvaluations || 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Média Clientes</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-bold text-amber-600">{stats?.clients.averageRating || 0}</p>
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Equipe
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Building className="h-4 w-4" />
                Clientes
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todas</option>
                <option value="5">5 estrelas</option>
                <option value="4">4 estrelas</option>
                <option value="3">3 estrelas</option>
                <option value="2">2 estrelas</option>
                <option value="1">1 estrela</option>
              </select>
            </div>
          </div>

          {/* Team Evaluations */}
          <TabsContent value="team" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterEvaluations(teamEvaluations).map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {evaluation.memberName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">{evaluation.memberName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {evaluation.rating}/5
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {new Date(evaluation.createdAt).toLocaleDateString("pt-BR")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Projeto</p>
                      <p className="text-sm font-medium">{evaluation.projectName}</p>
                    </div>
                    {evaluation.comment && (
                      <div>
                        <p className="text-xs text-muted-foreground">Comentário</p>
                        <p className="text-sm text-muted-foreground italic">"{evaluation.comment}"</p>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Avaliado por</p>
                      <p className="text-sm font-medium">{evaluation.evaluatorName}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filterEvaluations(teamEvaluations).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-muted-foreground">
                    {filter === "all"
                      ? "Avaliações de membros da equipe aparecerão aqui"
                      : `Nenhuma avaliação com ${filter} estrela(s)`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Client Evaluations */}
          <TabsContent value="clients" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterEvaluations(clientEvaluations).map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {evaluation.clientName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">{evaluation.clientName}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          {evaluation.rating}/5
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {new Date(evaluation.createdAt).toLocaleDateString("pt-BR")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Projeto</p>
                      <p className="text-sm font-medium">{evaluation.projectName}</p>
                    </div>
                    {evaluation.comment && (
                      <div>
                        <p className="text-xs text-muted-foreground">Comentário</p>
                        <p className="text-sm text-muted-foreground italic">"{evaluation.comment}"</p>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Avaliado por</p>
                      <p className="text-sm font-medium">{evaluation.evaluatorName}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filterEvaluations(clientEvaluations).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-muted-foreground">
                    {filter === "all"
                      ? "Avaliações de clientes aparecerão aqui"
                      : `Nenhuma avaliação com ${filter} estrela(s)`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
