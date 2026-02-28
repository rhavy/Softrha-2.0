"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  User,
  CheckCircle2,
  Trophy,
  Target,
  Users,
  MessageSquare,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  projectRoles: string[];
}

interface Project {
  id: string;
  name: string;
  status: string;
}

const generalQuestions = [
  {
    id: "collaboration",
    label: "Colaboração e Trabalho em Equipe",
    description: "Como foi a colaboração entre os membros da equipe?",
  },
  {
    id: "communication",
    label: "Comunicação",
    description: "A comunicação foi clara e eficiente durante o projeto?",
  },
  {
    id: "deadlines",
    label: "Cumprimento de Prazos",
    description: "Os prazos estabelecidos foram cumpridos?",
  },
  {
    id: "quality",
    label: "Qualidade da Entrega",
    description: "A qualidade do entregue atendeu às expectativas?",
  },
  {
    id: "problemSolving",
    label: "Resolução de Problemas",
    description: "Como a equipe lidou com os desafios do projeto?",
  },
];

const individualQuestions = [
  {
    id: "technical",
    label: "Competência Técnica",
    description: "Avalie o conhecimento técnico demonstrado",
  },
  {
    id: "proactivity",
    label: "Proatividade",
    description: "Iniciativa e proatividade nas tarefas",
  },
  {
    id: "reliability",
    label: "Confiabilidade",
    description: "Cumprimento de compromissos e responsabilidades",
  },
  {
    id: "teamwork",
    label: "Trabalho em Equipe",
    description: "Colaboração e apoio aos demais membros",
  },
];

export default function AvaliacaoProjetoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Avaliações
  const [generalRatings, setGeneralRatings] = useState<Record<string, number>>({});
  const [generalComment, setGeneralComment] = useState("");
  const [individualRatings, setIndividualRatings] = useState<Record<string, Record<string, number>>>({});
  const [individualComments, setIndividualComments] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [params.id]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}/avaliacao`);
      if (!response.ok) throw new Error("Erro ao carregar dados");
      
      const data = await response.json();
      setProject(data.project);
      setTeamMembers(data.teamMembers);
      
      // Verificar se já avaliou
      const evaluated = localStorage.getItem(`project_${params.id}_evaluated`);
      if (evaluated) {
        setHasEvaluated(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto",
        variant: "destructive",
      });
      router.push("/dashboard/projetos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneralRating = (questionId: string, rating: number) => {
    setGeneralRatings((prev) => ({
      ...prev,
      [questionId]: rating,
    }));
  };

  const handleIndividualRating = (memberId: string, questionId: string, rating: number) => {
    setIndividualRatings((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [questionId]: rating,
      },
    }));
  };

  const handleIndividualComment = (memberId: string, comment: string) => {
    setIndividualComments((prev) => ({
      ...prev,
      [memberId]: comment,
    }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      // Pelo menos 3 perguntas gerais respondidas
      return Object.keys(generalRatings).length >= 3;
    }
    if (currentStep === 2) {
      // Todos os membros devem ter pelo menos 2 avaliações
      return teamMembers.every(
        (member) => Object.keys(individualRatings[member.id] || {}).length >= 2
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const evaluations = {
        projectId: params.id,
        generalRatings,
        generalComment,
        individualEvaluations: teamMembers.map((member) => ({
          memberId: member.id,
          memberName: member.name,
          ratings: individualRatings[member.id] || {},
          comment: individualComments[member.id] || "",
        })),
      };

      const response = await fetch(`/api/projetos/${params.id}/avaliar-equipe-completa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluations),
      });

      if (!response.ok) throw new Error("Erro ao enviar avaliação");

      localStorage.setItem(`project_${params.id}_evaluated`, "true");
      setHasEvaluated(true);

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo feedback detalhado.",
        variant: "success",
      });

      setTimeout(() => {
        router.push(`/dashboard/projetos/${params.id}`);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erro ao avaliar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasEvaluated) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Avaliação Já Realizada</h2>
              <p className="text-muted-foreground mb-4">
                Você já avaliou a equipe deste projeto. Obrigado pelo feedback!
              </p>
              <Button onClick={() => router.push(`/dashboard/projetos/${params.id}`)}>
                Voltar ao Projeto
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const totalSteps = 2 + teamMembers.length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Avaliação da Equipe</h1>
            <p className="text-muted-foreground">Projeto: {project?.name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Avaliação Geral */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <CardTitle>Avaliação Geral do Projeto</CardTitle>
                </div>
                <CardDescription>
                  Avalie aspectos gerais do desempenho da equipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {generalQuestions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <div>
                      <Label className="text-base font-semibold">
                        {question.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {question.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleGeneralRating(question.id, star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (generalRatings[question.id] || 0)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      {generalRatings[question.id] && (
                        <span className="text-sm text-muted-foreground ml-2">
                          {generalRatings[question.id]}/5
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <Label>Comentário Geral (opcional)</Label>
                  <Textarea
                    placeholder="Deixe um comentário geral sobre o desempenho da equipe..."
                    value={generalComment}
                    onChange={(e) => setGeneralComment(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Avaliação Individual por Membro */}
        {currentStep >= 2 && currentStep < totalSteps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {(() => {
              const memberIndex = currentStep - 2;
              const member = teamMembers[memberIndex];

              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Avaliar: {member.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          {member.projectRoles.map((role, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {individualQuestions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        <div>
                          <Label className="text-base font-semibold">
                            {question.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {question.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                handleIndividualRating(member.id, question.id, star)
                              }
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <=
                                  (individualRatings[member.id]?.[question.id] || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                          {individualRatings[member.id]?.[question.id] && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {individualRatings[member.id][question.id]}/5
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <Label>Comentário sobre {member.name.split(" ")[0]} (opcional)</Label>
                      <Textarea
                        placeholder={`Deixe um comentário sobre o desempenho de ${member.name.split(" ")[0]}...`}
                        value={individualComments[member.id] || ""}
                        onChange={(e) => handleIndividualComment(member.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        )}

        {/* Step Final: Revisão */}
        {currentStep === totalSteps && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <CardTitle>Revisão e Envio</CardTitle>
                </div>
                <CardDescription>
                  Revise suas avaliações antes de enviar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Avaliação Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">
                        {Object.keys(generalRatings).length} de {generalQuestions.length} perguntas
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {generalComment ? "Com comentário" : "Sem comentário"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Avaliações Individuais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">
                        {teamMembers.length} membro(s)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Object.keys(individualComments).filter((id) => individualComments[id]).length} com comentário
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ Após enviar, não será possível alterar as avaliações.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Avaliação
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
