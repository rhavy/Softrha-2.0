"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  FolderKanban,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  MoreVertical,
  MessageSquare,
  RefreshCcw,
} from "lucide-react";
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    projects: 5,
    tasks: 23,
    completed: 142,
    messages: 12,
  });

  // Hook de atualizações em tempo real para o dashboard
  const { refresh, hasUpdates } = useRealTimeUpdates("dashboard", {
    interval: 10000, // 10 segundos
    onNotificationsUpdate: (data) => {
      console.log("[DASHBOARD] 📬 Novas notificações detectadas:", data.unreadCount);
      setStatsData(prev => ({ ...prev, messages: data.unreadCount }));
    },
    onResourceUpdate: ({ type, data }) => {
      console.log("[DASHBOARD] 📊 Recursos atualizados:", type);
      // Recarregar estatísticas do dashboard
    },
  });

  const stats = [
    { label: "Projetos Ativos", value: statsData.projects?.toString() || "0", icon: FolderKanban, change: "+2", trend: "up" },
    { label: "Tarefas Pendentes", value: statsData.tasks?.toString() || "0", icon: Clock, change: "-5", trend: "down" },
    { label: "Tarefas Concluídas", value: statsData.completed?.toString() || "0", icon: CheckCircle2, change: "+18", trend: "up" },
    { label: "Mensagens", value: statsData.messages?.toString() || "0", icon: MessageSquare, change: "+4", trend: "up" },
  ];

  const projects = [
    {
      name: "E-commerce Platform",
      client: "TechStore Ltda",
      status: "Em Desenvolvimento",
      progress: 65,
      dueDate: "2026-03-15",
      team: ["A", "B", "C"],
      tech: ["Next.js", "TypeScript"],
    },
    {
      name: "App Delivery Mobile",
      client: "FoodFast",
      status: "Em Revisão",
      progress: 90,
      dueDate: "2026-02-28",
      team: ["D", "E"],
      tech: ["React Native", "Node.js"],
    },
    {
      name: "Sistema de Gestão",
      client: "Consultoria ABC",
      status: "Planejamento",
      progress: 15,
      dueDate: "2026-04-20",
      team: ["F", "G", "H", "I"],
      tech: ["Next.js", "Prisma"],
    },
    {
      name: "Landing Page Institucional",
      client: "StartupXYZ",
      status: "Concluído",
      progress: 100,
      dueDate: "2026-02-10",
      team: ["A"],
      tech: ["Next.js", "Tailwind"],
    },
  ];

  const recentActivities = [
    { user: "Ana Silva", action: "completou a tarefa", target: "Dashboard Analytics", time: "2h atrás" },
    { user: "Bruno Costa", action: "comentou em", target: "API Integration", time: "4h atrás" },
    { user: "Carla Mendes", action: "criou nova tarefa", target: "Mobile Responsive", time: "6h atrás" },
    { user: "Daniel Rocha", action: "atualizou o status de", target: "Backend Setup", time: "8h atrás" },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Visão Geral</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu dashboard. Aqui está o resumo dos seus projetos.
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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <TrendingUp
                      className={`h-3 w-3 ${
                        stat.trend === "up" ? "text-green-500" : "text-red-500 rotate-180"
                      }`}
                    />
                    <span
                      className={
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">este mês</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Projects & Activity Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projetos Recentes</CardTitle>
                  <CardDescription>
                    Acompanhe o progresso dos seus projetos
                  </CardDescription>
                </div>
                <Link href="/dashboard/projetos">
                  <Button variant="ghost" size="sm">
                    Ver todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{project.name}</h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            project.status === "Concluído"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : ""
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.client}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 h-2 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {project.progress}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex -space-x-2">
                        {project.team.map((member, idx) => (
                          <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {member}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas atualizações da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {activity.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>
                      </p>
                      <p className="text-sm font-medium truncate">
                        {activity.target}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Próximos Prazos</h4>
                {[
                  { project: "App Delivery Mobile", date: "28 Fev, 2026" },
                  { project: "E-commerce Platform", date: "15 Mar, 2026" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate">
                      {item.project}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.date}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Stack em Uso</CardTitle>
            <CardDescription>
              Tecnologias utilizadas nos seus projetos ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 14",
                "TypeScript",
                "Tailwind CSS",
                "Prisma",
                "MySQL",
                "Better Auth",
                "React Native",
                "Node.js",
                "Framer Motion",
                "shadcn/ui",
              ].map((tech, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
