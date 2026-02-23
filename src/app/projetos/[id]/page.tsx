"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, DollarSign, Calendar, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  budget: number | null;
  clientName: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

const statusLabels: Record<string, string> = {
  waiting_payment: "Aguardando Pagamento",
  planning: "Em Planejamento",
  development_20: "20% Concluído",
  development_50: "50% Concluído",
  development_70: "70% Concluído",
  development_100: "100% Concluído",
  waiting_final_payment: "Aguardando Pagamento Final",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  waiting_payment: "bg-amber-500",
  planning: "bg-blue-500",
  development_20: "bg-blue-500",
  development_50: "bg-blue-500",
  development_70: "bg-purple-500",
  development_100: "bg-green-500",
  waiting_final_payment: "bg-amber-500",
  completed: "bg-green-600",
  cancelled: "bg-red-500",
};

export default function ProjetoClientePage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projetos/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-xl max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Projeto não encontrado</h2>
              <p className="text-muted-foreground mb-4">
                O projeto que você está tentando acessar não existe ou foi removido.
              </p>
              <Button onClick={() => window.location.href = "/"}>Voltar ao Início</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isWaitingFinalPayment = project.status === "waiting_final_payment";
  const isCompleted = project.status === "completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Acompanhamento do Projeto</h1>
          </div>
          <p className="text-lg text-gray-600">{project.name}</p>
        </div>

        {/* Status Card */}
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status Atual</CardTitle>
                <CardDescription>
                  Acompanhe o andamento do seu projeto
                </CardDescription>
              </div>
              <Badge className={statusColors[project.status]} variant="secondary">
                {statusLabels[project.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm font-bold">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-10 w-10 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor do Projeto</p>
                  <p className="text-xl font-bold text-green-700">
                    R$ {project.budget?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-xl font-bold text-blue-700">{project.progress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-10 w-10 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="text-sm font-semibold">
                    {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status */}
        {isWaitingFinalPayment && (
          <Card className="border-amber-200 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Clock className="h-5 w-5" />
                Pagamento Final Pendente
              </CardTitle>
              <CardDescription>
                Seu projeto está 100% concluído! Realize o pagamento final para agendar a entrega.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-700">Valor Restante (75%):</span>
                  <span className="text-xl font-bold text-amber-800">
                    R$ {((project.budget || 0) * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-amber-700">
                  Valor total do projeto: R$ {(project.budget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = `/projetos/${params.id}/pagamento-final`}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Realizar Pagamento Final
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Agendar Entrega */}
        {isCompleted && (
          <Card className="border-green-200 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Projeto Concluído! 🎉
              </CardTitle>
              <CardDescription>
                Parabéns! Seu projeto está pronto. Agora agende a entrega para receber todos os detalhes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  🎉 Seu projeto está 100% concluído e o pagamento foi confirmado!
                  Agora é só agendar a entrega para receber todos os acessos e documentação.
                </p>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={() => window.location.href = `/projetos/${params.id}/agendar`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Entrega
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Etapas do Projeto</CardTitle>
            <CardDescription>
              Acompanhe as fases do desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Pagamento da Entrada (25%)", status: "waiting_payment", progress: 0 },
                { label: "Planejamento", status: "planning", progress: 0 },
                { label: "Desenvolvimento (20%)", status: "development_20", progress: 20 },
                { label: "Desenvolvimento (50%)", status: "development_50", progress: 50 },
                { label: "Desenvolvimento (70%)", status: "development_70", progress: 70 },
                { label: "Desenvolvimento (100%)", status: "development_100", progress: 100 },
                { label: "Pagamento Final (75%)", status: "waiting_final_payment", progress: 100 },
                { label: "Entrega do Projeto", status: "completed", progress: 100 },
              ].map((step, index) => {
                const isCompleted = project.progress >= step.progress;
                const isCurrent = project.status === step.status;

                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isCurrent
                          ? "bg-blue-600 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
