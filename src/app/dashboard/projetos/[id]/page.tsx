"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Mail,
  RefreshCw,
  Send,
  Rocket,
  Phone,
  Activity,
  Building,
  MapPin,
  ExternalLink,
  Video,
  ChevronRight,
  Code,
  GitBranch,
  Globe,
  Edit3,
  History,
  Plus,
  X,
  Star,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { hasToastBeenShown, markToastAsShown } from "@/lib/toast-dedup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  complexity: string;
  timeline: string;
  budget: number | null;
  clientId: string;
  clientName: string | null;
  clientEmail?: string;
  clientPhone?: string;
  progress: number;
  dueDate: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  gitRepositoryUrl?: string | null;
  testUrl?: string | null;
  lastUrlChangeReason?: string | null;
  lastUrlChangeDescription?: string | null;
  lastUrlChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    emails?: string | null;
    phones?: string | null;
  } | null;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  paidAt: string | null;
  dueDate: string;
}

const statusLabels: Record<string, string> = {
  waiting_payment: "Aguardando Pagamento",
  planning: "Planejamento",
  development: "Em Desenvolvimento",
  development_20: "20% Concluído",
  development_50: "50% Concluído",
  development_70: "70% Concluído",
  development_100: "100% Concluído",
  waiting_final_payment: "Aguardando Pagamento Final",
  completed: "Concluído (Aguardando Entrega)",
  finished: "Finalizado (Entregue)",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  waiting_payment: "bg-amber-500",
  planning: "bg-blue-500",
  development: "bg-purple-500",
  development_20: "bg-blue-500",
  development_50: "bg-blue-500",
  development_70: "bg-purple-500",
  development_100: "bg-green-500",
  waiting_final_payment: "bg-amber-500",
  completed: "bg-green-500",
  finished: "bg-emerald-600",
  cancelled: "bg-red-500",
};

const typeLabels: Record<string, string> = {
  web: "Site Web",
  mobile: "App Mobile",
  software: "Software",
  landing: "Landing Page",
  ecommerce: "E-commerce",
  dashboard: "Dashboard",
};

export default function ProjetoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [finalPayment, setFinalPayment] = useState<Payment | null>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [isNotifyingProgress, setIsNotifyingProgress] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);
  const [isFinalPaymentDialogOpen, setIsFinalPaymentDialogOpen] = useState(false);
  const [isSendingFinalPayment, setIsSendingFinalPayment] = useState(false);
  const [finalPaymentLink, setFinalPaymentLink] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isConfirmingSchedule, setIsConfirmingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<boolean | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [failureDescription, setFailureDescription] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDetailDialogOpen, setIsHistoryDetailDialogOpen] = useState(false);
  const [gitRepositoryUrl, setGitRepositoryUrl] = useState("");
  const [testUrl, setTestUrl] = useState("");
  
  // Estados para edição de URL com justificativa
  const [isEditUrlDialogOpen, setIsEditUrlDialogOpen] = useState(false);
  const [urlFieldToEdit, setUrlFieldToEdit] = useState<"git" | "test" | null>(null);
  const [newUrlValue, setNewUrlValue] = useState("");
  const [urlChangeReason, setUrlChangeReason] = useState<string>("");
  const [urlChangeDescription, setUrlChangeDescription] = useState("");
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

  // Estados para equipe do projeto
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProjectRoles, setSelectedProjectRoles] = useState<string[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Estados para avaliação de membros
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [membersToEvaluate, setMembersToEvaluate] = useState<any[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [evaluationRatings, setEvaluationRatings] = useState({ rating: 0, participation: 0, quality: 0, comment: "" });
  const [hasEvaluated, setHasEvaluated] = useState(false);
  
  // Estados para avaliação de cliente
  const [isClientEvaluationModalOpen, setIsClientEvaluationModalOpen] = useState(false);
  const [clientEvaluationRatings, setClientEvaluationRatings] = useState({ rating: 0, participation: 0, quality: 0, comment: "" });
  const [hasClientEvaluated, setHasClientEvaluated] = useState(false);
  
  // Estados para histórico de URL
  const [urlHistory, setUrlHistory] = useState<any[]>([]);
  const [isUrlHistoryDialogOpen, setIsUrlHistoryDialogOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Mapear motivos técnicos para texto legível
  const getReasonLabel = (reason: string) => {
    const reasonMap: Record<string, string> = {
      cliente_desistiu: 'O cliente desistiu do projeto',
      cliente_nao_respondeu: 'Não obtivemos resposta do cliente',
      erro_tecnico: 'Erro técnico na entrega',
      agenda_incompativel: 'Agenda incompatível com o cliente',
      pagamento_pendente: 'Pagamento pendente',
      escopo_alterado: 'Escopo do projeto foi alterado',
      problemas_comunicacao: 'Problemas de comunicação',
      cliente_indisponivel: 'Cliente indisponível no período',
      equipe_indisponivel: 'Equipe indisponível no período',
      problemas_tecnicos_internos: 'Problemas técnicos internos',
      outro: 'Outro motivo',
    };
    return reasonMap[reason] || reason;
  };

  // Formatador de motivo para exibição
  const formatReason = (reason: string) => {
    if (!reason) return '—';
    // Se for um código conhecido, retorna o texto formatado
    const label = getReasonLabel(reason);
    // Capitalizar primeira letra
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  useEffect(() => {
    if (params.id) {
      fetchProject();
      fetchCurrentUser();
    }
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
    }
  };

  const isAcceptedByCurrentUser = () => {
    if (!currentUser || !budget) return false;
    return budget.acceptedBy === currentUser.id;
  };

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}`);
      if (!response.ok) throw new Error("Erro ao buscar projeto");
      const data = await response.json();

      console.log("[DEBUG] Dados do projeto recebidos:", data);
      console.log("[DEBUG] Dados do cliente:", data.client);

      // Extrair e-mail e telefone do cliente
      // Prioridade: client.phones > data.clientPhone > budget.clientPhone
      let clientPhone = data.client?.phones?.[0]?.value || data.clientPhone;

      // Buscar budget para obter dados completos do cliente
      let budgetData = null;
      if (data.budgetId) {
        try {
          const budgetResponse = await fetch(`/api/orcamentos/${data.budgetId}`);
          if (budgetResponse.ok) {
            budgetData = await budgetResponse.json();
            if (!clientPhone) {
              clientPhone = budgetData.clientPhone;
            }
            console.log("[DEBUG] Budget obtido:", budgetData);
          }
        } catch (e) {
          console.warn("Erro ao buscar budget:", e);
        }
      }

      const projectData = {
        ...data,
        clientEmail: data.client?.emails?.[0]?.value || data.clientEmail || budgetData?.clientEmail,
        clientPhone: clientPhone,
      };

      console.log("[DEBUG] Projeto com telefone:", projectData.clientPhone);

      setProject(projectData);
      setBudget(budgetData);

      // Buscar pagamento se existir
      if (data.budgetId) {
        fetchPayment(data.budgetId);
      }

      // Buscar agendamento sempre (não apenas quando completed)
      fetchSchedule();

      // Buscar equipe do projeto
      fetchTeam();
      
      // Verificar se projeto está finalizado e mostrar modal de avaliação
      if (data.status === "completed" || data.status === "finished") {
        const evaluated = localStorage.getItem(`project_${params.id}_evaluated`);
        if (!evaluated && teamMembers.length > 0) {
          // Agendar abertura do modal após 1.5 segundos
          setTimeout(() => {
            setIsEvaluationModalOpen(true);
          }, 1500);
        } else if (evaluated) {
          setHasEvaluated(true);
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o projeto",
        variant: "destructive",
      });
      router.push("/dashboard/projetos");
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para gerenciar equipe
  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}/equipe`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.team || []);
      }
    } catch (error) {
      console.error("Erro ao buscar equipe:", error);
    }
  };

  const fetchAvailableUsers = async (search?: string) => {
    try {
      const queryParams = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/equipe/usuarios-disponiveis${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários disponíveis:", error);
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedUser) {
      toast({
        title: "Selecione um usuário",
        description: "Escolha um usuário para adicionar à equipe",
        variant: "destructive",
      });
      return;
    }

    if (selectedProjectRoles.length === 0) {
      toast({
        title: "Selecione pelo menos uma área",
        description: "Escolha uma ou mais áreas de atuação do membro no projeto",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingTeam(true);
      const response = await fetch(`/api/projetos/${params.id}/equipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser, projectRoles: selectedProjectRoles }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: "Membro adicionado!",
        description: data.message || "Usuário adicionado à equipe do projeto",
        variant: "success",
      });

      setTeamMembers(data.team);
      setIsTeamModalOpen(false);
      setSelectedUser("");
      setSelectedProjectRoles([]);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const toggleProjectRole = (role: string) => {
    setSelectedProjectRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleRemoveTeamMember = async (userId: string) => {
    try {
      setIsLoadingTeam(true);
      const response = await fetch(`/api/projetos/${params.id}/equipe`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast({
        title: "Membro removido!",
        description: "Usuário removido da equipe do projeto",
        variant: "success",
      });

      setTeamMembers(data.team);
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const fetchMembersToEvaluate = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}/avaliar-membros`);
      if (response.ok) {
        const data = await response.json();
        setMembersToEvaluate(data.teamMembers.filter((m: any) => !m.evaluated));
        setHasEvaluated(data.allEvaluated);
      }
    } catch (error) {
      console.error("Erro ao buscar membros para avaliar:", error);
    }
  };

  const handleSubmitEvaluation = async () => {
    try {
      const member = membersToEvaluate[currentMemberIndex];
      const response = await fetch(`/api/projetos/${params.id}/avaliar-membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          rating: evaluationRatings.rating,
          participation: evaluationRatings.participation,
          quality: evaluationRatings.quality,
          comment: evaluationRatings.comment,
        }),
      });

      if (response.ok) {
        if (currentMemberIndex < membersToEvaluate.length - 1) {
          setCurrentMemberIndex(currentMemberIndex + 1);
          setEvaluationRatings({ rating: 0, participation: 0, quality: 0, comment: "" });
          toast({
            title: "Avaliação enviada!",
            description: `${membersToEvaluate.length - currentMemberIndex - 1} membro(s) restante(s)`,
          });
        } else {
          setIsEvaluationModalOpen(false);
          setHasEvaluated(true);
          toast({
            title: "Todas avaliações enviadas!",
            description: "Obrigado por avaliar a equipe do projeto.",
            variant: "success",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao avaliar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCheckClientEvaluation = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}/avaliar-cliente`);
      if (response.ok) {
        const data = await response.json();
        setHasClientEvaluated(data.hasEvaluated);
        if (data.hasEvaluated && data.evaluation) {
          setClientEvaluationRatings({
            rating: data.evaluation.rating,
            participation: data.evaluation.participation,
            quality: data.evaluation.quality,
            comment: data.evaluation.comment || "",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao verificar avaliação:", error);
    }
  };

  const handleSubmitClientEvaluation = async () => {
    if (!clientEvaluationRatings.rating || !clientEvaluationRatings.participation || !clientEvaluationRatings.quality) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todas as avaliações (1-5 estrelas).",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/projetos/${params.id}/avaliar-cliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: clientEvaluationRatings.rating,
          participation: clientEvaluationRatings.participation,
          quality: clientEvaluationRatings.quality,
          comment: clientEvaluationRatings.comment,
        }),
      });

      if (response.ok) {
        setIsClientEvaluationModalOpen(false);
        setHasClientEvaluated(true);
        toast({
          title: "Avaliação enviada!",
          description: "Obrigado por avaliar o projeto.",
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao avaliar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canManageTeam = () => {
    if (!currentUser) return false;
    return (
      currentUser.role === "ADMIN" ||
      (currentUser.role === "TEAM_MEMBER" && currentUser.teamRole === "Gerente de Projetos")
    );
  };

  const fetchSchedule = async () => {
    try {
      console.log("[DEBUG] Buscando agendamento para projeto:", params.id);
      const response = await fetch(`/api/projetos/${params.id}/agendamento`);
      console.log("[DEBUG] Response agendamento:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[DEBUG] Agendamento encontrado:", data);
        setSchedule(data);
      } else {
        const error = await response.json();
        console.warn("[DEBUG] Erro ao buscar agendamento:", error);
        if (response.status === 404) {
          console.log("[DEBUG] Agendamento não encontrado (404)");
          setSchedule(null);
        }
      }
    } catch (error) {
      console.error("[DEBUG] Erro ao buscar agendamento:", error);
      setSchedule(null);
    }
  };

  const fetchPayment = async (budgetId: string) => {
    try {
      // Buscar todos os pagamentos do orçamento
      const response = await fetch(`/api/orcamentos/${budgetId}/pagamentos`);
      if (response.ok) {
        const data = await response.json();
        if (data.payments && data.payments.length > 0) {
          // Separar pagamento de entrada e final
          const downPayment = data.payments.find((p: Payment) => p.type === "down_payment");
          const final = data.payments.find((p: Payment) => p.type === "final_payment");

          if (downPayment) {
            setPayment(downPayment);
          }
          if (final) {
            setFinalPayment(final);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    }
  };

  const handleGeneratePaymentLink = async () => {
    try {
      setIsGeneratingPaymentLink(true);

      console.log("Buscando orçamento para o projeto:", params.id);

      // Buscar o orçamento vinculado a este projeto
      const budgetResponse = await fetch(`/api/projetos/${params.id}/orcamento`);

      if (!budgetResponse.ok) {
        const errorData = await budgetResponse.json();
        console.error("Erro na busca do orçamento:", errorData);
        throw new Error(errorData.error || "Erro ao buscar orçamento");
      }

      const budget = await budgetResponse.json();
      console.log("Orçamento encontrado:", budget);

      if (!budget.id) {
        console.error("Orçamento sem ID válido:", budget);
        throw new Error("Orçamento inválido");
      }

      // Gerar link de pagamento
      console.log("Gerando link de pagamento para orçamento:", budget.id);
      const response = await fetch(`/api/orcamentos/${budget.id}/pagamento`, {
        method: "POST",
      });

      const result = await response.json();
      console.log("Resultado da API de pagamento:", result);

      if (!response.ok) {
        console.error("Erro na geração do link:", result);
        throw new Error(result.error || "Erro ao gerar link de pagamento");
      }

      if (result.paymentLink) {
        setPaymentLink(result.paymentLink);
        setPayment(result.payment);
        
        // Verificar se toast já foi exibido
        const toastId = `payment-link-generated-${params.id}`;
        if (!hasToastBeenShown(toastId)) {
          markToastAsShown(toastId);
          toast({
            title: "Link de pagamento gerado!",
            description: `Link de R$ ${result.payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} criado com sucesso.`,
          });
        }
      } else {
        const toastId = `payment-already-done-${params.id}`;
        if (!hasToastBeenShown(toastId)) {
          markToastAsShown(toastId);
          toast({
            title: "Pagamento já realizado!",
            description: "O cliente já realizou o pagamento da entrada.",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao gerar link de pagamento:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o link de pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPaymentLink(false);
    }
  };

  const handleCopyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast({
        title: "Link copiado!",
        description: "Link de pagamento copiado para a área de transferência.",
      });
    }
  };

  const handleSendPaymentEmail = () => {
    if (paymentLink && project) {
      const email = project.clientEmail || project.clientName;
      if (!email) {
        toast({
          title: "E-mail não disponível",
          description: "O e-mail do cliente não está disponível.",
          variant: "destructive",
        });
        return;
      }
      const subject = `Pagamento da Entrada - ${project.name}`;
      const body = `Olá ${project.clientName},\n\nSegue o link para pagamento da entrada do projeto:\n\n${paymentLink}\n\nValor: R$ ${payment?.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nPrazo: 5 dias úteis\n\nAtenciosamente,\nEquipe`;

      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

      toast({
        title: "E-mail aberto!",
        description: "Preencha e envie o e-mail para o cliente.",
      });
    }
  };

  const handleSendPaymentWhatsApp = () => {
    if (paymentLink && project?.clientPhone) {
      const phoneDigits = project.clientPhone.replace(/\D/g, "") || "";
      if (!phoneDigits) {
        toast({
          title: "WhatsApp não disponível",
          description: "O telefone do cliente não está disponível.",
          variant: "destructive",
        });
        return;
      }
      const message = `Olá ${project.clientName}! Segue o link para pagamento da entrada do projeto:\n\n${paymentLink}\n\nValor: R$ ${payment?.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nPrazo: 5 dias úteis\n\nAtenciosamente,\nEquipe`;

      window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");

      toast({
        title: "WhatsApp aberto!",
        description: "Envie a mensagem para o cliente.",
      });
    }
  };

  const handleNotifyProgress = async (stage: string) => {
    try {
      setIsNotifyingProgress(true);

      // Mapear etapa para porcentagem
      const stageToProgress: Record<string, number> = {
        started: 20,
        in_progress: 50,
        almost_done: 70,
        completed: 100,
      };

      const progress = stageToProgress[stage] || 50;

      // Preparar dados para envio
      const notifyData: any = {
        progress,
        sendEmail: notifyEmail,
        sendWhatsApp: notifyWhatsApp,
      };

      // Se for projeto concluído, enviar URLs
      if (stage === "completed") {
        // Git URL (obrigatório)
        if (gitRepositoryUrl.trim()) {
          notifyData.gitRepositoryUrl = gitRepositoryUrl.trim();
        }
        // Test URL (opcional)
        if (testUrl.trim()) {
          notifyData.testUrl = testUrl.trim();
        }
      }

      const response = await fetch(`/api/projetos/${params.id}/notificar-evolucao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifyData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao notificar evolução");
      }

      // Se URLs foram salvas, atualizar projeto localmente
      if (stage === "completed") {
        if (gitRepositoryUrl.trim()) {
          setProject((prev) => prev ? {
            ...prev,
            gitRepositoryUrl: gitRepositoryUrl.trim(),
            testUrl: testUrl.trim() || null,
          } : null);
        }
        setGitRepositoryUrl(""); // Limpar input
        setTestUrl(""); // Limpar input
      }

      // Verificar resultados
      const notifications = [];
      if (result.emailSent) {
        notifications.push("E-mail enviado");
      } else if (notifyEmail && result.emailError) {
        notifications.push(`E-mail: ${result.emailError}`);
      }

      if (result.whatsappUrl) {
        notifications.push("WhatsApp pronto");
        // Abrir WhatsApp em nova aba
        window.open(result.whatsappUrl, "_blank");
      } else if (notifyWhatsApp && !result.whatsappUrl) {
        notifications.push("WhatsApp: telefone não disponível");
      }

      toast({
        title: "Notificação processada!",
        description: notifications.join(" • "),
      });

      setIsNotificationDialogOpen(false);
      setSelectedStage(null);
      fetchProject();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao notificar evolução",
        variant: "destructive",
      });
    } finally {
      setIsNotifyingProgress(false);
    }
  };

  const handleUpdateUrlWithJustification = async () => {
    try {
      setIsUpdatingUrl(true);

      if (!urlChangeReason) {
        toast({
          title: "Justificativa necessária",
          description: "Selecione um motivo para justificar a alteração da URL.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/projetos/${params.id}/atualizar-url`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: urlFieldToEdit,
          url: newUrlValue,
          reason: urlChangeReason,
          description: urlChangeDescription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar URL");
      }

      // Atualizar estado local do projeto
      if (urlFieldToEdit === "git") {
        setProject((prev) => prev ? { ...prev, gitRepositoryUrl: newUrlValue } : null);
      } else if (urlFieldToEdit === "test") {
        setProject((prev) => prev ? { ...prev, testUrl: newUrlValue } : null);
      }

      toast({
        title: "URL atualizada!",
        description: "A alteração foi registrada com sucesso.",
      });

      // Fechar dialog e limpar estados
      setIsEditUrlDialogOpen(false);
      setUrlFieldToEdit(null);
      setNewUrlValue("");
      setUrlChangeReason("");
      setUrlChangeDescription("");
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar URL",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const fetchUrlHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/projetos/${params.id}/historico-url`);
      if (!response.ok) throw new Error("Erro ao buscar histórico");
      const data = await response.json();
      setUrlHistory(data.history || []);
    } catch (error) {
      console.error("Erro ao buscar histórico de URL:", error);
      setUrlHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendFinalPayment = async () => {
    try {
      setIsSendingFinalPayment(true);

      const response = await fetch(`/api/projetos/${params.id}/pagamento-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail, sendWhatsApp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar pagamento final");
      }

      if (result.paymentLink) {
        setFinalPaymentLink(result.paymentLink);
      }

      // Verificar resultados e mostrar toast
      const notifications = [];
      if (result.emailSent) {
        notifications.push("E-mail enviado");
      } else if (sendEmail) {
        notifications.push("E-mail: serviço não configurado");
      }

      if (result.whatsappUrl) {
        notifications.push("WhatsApp pronto");
        // Abrir WhatsApp em nova aba
        window.open(result.whatsappUrl, "_blank");
      } else if (sendWhatsApp && !result.whatsappUrl) {
        notifications.push("WhatsApp: telefone não disponível");
      }

      // Verificar se toast já foi exibido
      const toastId = `final-payment-processed-${params.id}`;
      if (!hasToastBeenShown(toastId)) {
        markToastAsShown(toastId);
        toast({
          title: "Pagamento final processado!",
          description: notifications.join(" • "),
        });
      }

      fetchProject();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar pagamento final",
        variant: "destructive",
      });
    } finally {
      setIsSendingFinalPayment(false);
    }
  };

  const handleCopyFinalPaymentLink = () => {
    if (finalPaymentLink) {
      navigator.clipboard.writeText(finalPaymentLink);
      toast({
        title: "Link copiado!",
        description: "Link de pagamento copiado para a área de transferência.",
      });
    }
  };

  const handleConfirmSchedule = async () => {
    try {
      setIsConfirmingSchedule(true);

      if (scheduleSuccess === null) {
        toast({
          title: "Selecione uma opção",
          description: "Informe se a entrega foi realizada com sucesso ou não",
          variant: "destructive",
        });
        return;
      }

      if (!scheduleSuccess && !failureReason) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione o motivo da falha na comunicação",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/projetos/${params.id}/entrega/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: scheduleSuccess,
          failureReason: scheduleSuccess ? null : failureReason,
          failureDescription: scheduleSuccess ? null : failureDescription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao confirmar entrega");
      }

      if (scheduleSuccess) {
        toast({
          title: "Entrega confirmada!",
          description: "Projeto entregue com sucesso ao cliente",
        });
      } else {
        toast({
          title: "Entrega não realizada",
          description: "Agendamento será reprogramado",
        });
      }

      setIsScheduleDialogOpen(false);
      setScheduleSuccess(null);
      setFailureReason("");
      setFailureDescription("");
      fetchSchedule();
      fetchProject();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao confirmar entrega",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingSchedule(false);
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

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Projeto não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/projetos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Projetos
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isWaitingPayment = project.status === "waiting_payment";

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge className={statusColors[project.status]} variant="secondary">
                  {statusLabels[project.status]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {project.progress < 100 && project.status !== "waiting_payment" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNotificationDialogOpen(true)}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Notificar Evolução
                </Button>
              )}
              {/* Botão Enviar Pagamento Final - aparece apenas se aceito pelo usuário atual */}
              {project.progress === 100 &&
                (project.status === "development_100" || project.status === "waiting_final_payment") &&
                isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsFinalPaymentDialogOpen(true);
                      setFinalPaymentLink(null);
                    }}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Enviar Pagamento Final (75%)
                  </Button>
                )}
              {/* Botão Agendar Entrega - aparece apenas após pagamento final confirmado */}
              {/* {project.status === "completed" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/projetos/${params.id}/agendar`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Agendar Entrega
                </Button>
              )} */}
              {/* Botão Gerar Pagamento - aparece apenas se aceito pelo usuário atual */}
              {isWaitingPayment && isAcceptedByCurrentUser() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPaymentDialogOpen(true);
                    setPaymentLink(null);
                  }}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Gerar Pagamento
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProject}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor do Projeto</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {project.budget?.toLocaleString("pt-BR") || "0"}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-2xl font-bold text-primary">
                    {project.progress}%
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="text-lg font-semibold">
                    {typeLabels[project.type] || project.type}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="text-lg font-semibold">
                    {project.clientName || "Não informado"}
                  </p>
                </div>
                <User className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Andamento e Dados do Cliente */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Card Andamento do Projeto */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Andamento do Projeto</CardTitle>
                  <CardDescription>Acompanhe o progresso e status atual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progresso Total</span>
                  <span className="font-bold text-indigo-600">{project.progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Status Atual */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    project.status.includes('development') ? 'bg-blue-100' :
                    project.status === 'waiting_payment' ? 'bg-amber-100' :
                    project.status === 'waiting_final_payment' ? 'bg-orange-100' :
                    project.status === 'completed' ? 'bg-green-100' :
                    'bg-slate-100'
                  }`}>
                    {project.status.includes('development') ? <Activity className="h-4 w-4 text-blue-600" /> :
                     project.status === 'waiting_payment' ? <Clock className="h-4 w-4 text-amber-600" /> :
                     project.status === 'waiting_final_payment' ? <DollarSign className="h-4 w-4 text-orange-600" /> :
                     project.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                     <Clock className="h-4 w-4 text-slate-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{statusLabels[project.status]}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {project.progress < 100 ? 'Em desenvolvimento' : 
                       project.status === 'completed' ? 'Projeto concluído com sucesso' :
                       'Aguardando próxima etapa'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações de Prazo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">Início</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">Prazo</p>
                  </div>
                  <p className="text-sm font-semibold capitalize">{project.timeline}</p>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="pt-2">
                {project.progress < 100 && project.status !== 'waiting_payment' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setIsNotificationDialogOpen(true)}
                  >
                    <Send className="h-3.5 w-3.5 mr-2" />
                    Notificar Evolução
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card Dados do Cliente */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Building className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                  <CardDescription>Informações de contato e identificação</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome do Cliente */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-700 font-semibold mb-1">Nome do Cliente</p>
                    <p className="text-sm font-bold text-emerald-900">
                      {project.client?.name || project.clientName || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contatos */}
              <div className="space-y-2">
                {/* E-mail */}
                {(project.client?.emails || budget?.clientEmail) && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">E-mail</p>
                      <p className="text-sm font-medium truncate">
                        {(() => {
                          if (budget?.clientEmail) return budget.clientEmail;
                          if (project.client?.emails && Array.isArray(project.client.emails)) {
                            return project.client.emails[0]?.value || 'Não disponível';
                          }
                          return 'Não disponível';
                        })()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => {
                        const email = budget?.clientEmail || (project.client?.emails && Array.isArray(project.client.emails) ? project.client.emails[0]?.value : '');
                        if (email) {
                          navigator.clipboard.writeText(email);
                          toast({ title: "Copiado!", description: "E-mail copiado" });
                        }
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Telefone */}
                {(project.client?.phones || budget?.clientPhone) && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">Telefone</p>
                      <p className="text-sm font-medium truncate">
                        {(() => {
                          if (budget?.clientPhone) return budget.clientPhone;
                          if (project.client?.phones && Array.isArray(project.client.phones)) {
                            return project.client.phones[0]?.value || 'Não disponível';
                          }
                          return 'Não disponível';
                        })()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => {
                        const phone = budget?.clientPhone || (project.client?.phones && Array.isArray(project.client.phones) ? project.client.phones[0]?.value : '');
                        if (phone) {
                          navigator.clipboard.writeText(phone);
                          toast({ title: "Copiado!", description: "Telefone copiado" });
                        }
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Tipo de Projeto e Complexidade */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Projeto</p>
                  <p className="text-sm font-semibold">{typeLabels[project.type] || project.type}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Complexidade</p>
                  <p className="text-sm font-semibold capitalize">{project.complexity}</p>
                </div>
              </div>

              {/* Link para Cliente (se existir) */}
              {project.clientId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/clientes/${project.clientId}`)}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  Ver Perfil do Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalhes do Projeto */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Projeto</p>
                    <p className="font-medium">
                      {typeLabels[project.type] || project.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Complexidade</p>
                    <p className="font-medium capitalize">{project.complexity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prazo</p>
                    <p className="font-medium capitalize">{project.timeline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{statusLabels[project.status]}</p>
                  </div>
                </div>

                {/* Repositório Git e URL de Teste - aparece apenas quando projeto está concluído e tem URL */}
                {(project.gitRepositoryUrl || project.testUrl) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {/* Git URL */}
                      {project.gitRepositoryUrl && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-semibold">Repositório do Projeto</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  fetchUrlHistory();
                                  setIsUrlHistoryDialogOpen(true);
                                }}
                              >
                                <History className="h-3.5 w-3.5 mr-1" />
                                Histórico
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  setUrlFieldToEdit("git");
                                  setNewUrlValue(project.gitRepositoryUrl || "");
                                  setIsEditUrlDialogOpen(true);
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
                            <Code className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <a
                              href={project.gitRepositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-1 truncate"
                            >
                              {project.gitRepositoryUrl}
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => {
                                if (project.gitRepositoryUrl) {
                                  navigator.clipboard.writeText(project.gitRepositoryUrl);
                                  toast({
                                    title: "Copiado!",
                                    description: "URL do repositório copiada",
                                  });
                                }
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => {
                                if (project.gitRepositoryUrl) {
                                  window.open(project.gitRepositoryUrl, "_blank");
                                }
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Test URL */}
                      {project.testUrl && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-semibold">URL de Teste</p>
                              <Badge variant="secondary" className="text-[10px]">Preview</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  fetchUrlHistory();
                                  setIsUrlHistoryDialogOpen(true);
                                }}
                              >
                                <History className="h-3.5 w-3.5 mr-1" />
                                Histórico
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  setUrlFieldToEdit("test");
                                  setNewUrlValue(project.testUrl || "");
                                  setIsEditUrlDialogOpen(true);
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                            <Globe className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <a
                              href={project.testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline flex-1 truncate"
                            >
                              {project.testUrl}
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => {
                                if (project.testUrl) {
                                  navigator.clipboard.writeText(project.testUrl);
                                  toast({
                                    title: "Copiado!",
                                    description: "URL de teste copiada",
                                  });
                                }
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => {
                                if (project.testUrl) {
                                  window.open(project.testUrl, "_blank");
                                }
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            🚀 Ambiente de teste/staging para visualização do cliente
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {project.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Descrição
                      </p>
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{project.description}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pagamento */}
            {isWaitingPayment && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <Clock className="h-5 w-5" />
                    Pagamento da Entrada Pendente
                  </CardTitle>
                  <CardDescription>
                    Este projeto está aguardando o pagamento de 25% do valor total para iniciar a produção.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-700 dark:text-amber-300">Valor da Entrada (25%):</span>
                      <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                        R$ {((project.budget || 0) * 0.25).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Valor total do projeto: R$ {(project.budget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setIsPaymentDialogOpen(true);
                      setPaymentLink(null);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Gerar Link de Pagamento
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de Avaliação da Equipe */}
            {(project?.status === "completed" || project?.status === "finished") && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <CardTitle>Avaliação da Equipe</CardTitle>
                  </div>
                  <CardDescription>
                    O projeto foi finalizado! Avalie o desempenho da equipe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasEvaluated ? (
                    <div className="text-center py-2">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Avaliação realizada com sucesso!
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/dashboard/projetos/${params.id}/avaliacao`)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Avaliar Equipe
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Avaliação do Cliente */}
            <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500 fill-purple-500" />
                  <CardTitle>Avaliação do Cliente</CardTitle>
                </div>
                <CardDescription>
                  Avalie sua experiência com o projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasClientEvaluated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="text-sm font-medium">Avaliação enviada!</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-purple-100 dark:bg-purple-900 rounded p-2">
                        <p className="text-xs text-muted-foreground">Geral</p>
                        <p className="text-lg font-bold text-purple-600">{clientEvaluationRatings.rating}/5</p>
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900 rounded p-2">
                        <p className="text-xs text-muted-foreground">Participação</p>
                        <p className="text-lg font-bold text-purple-600">{clientEvaluationRatings.participation}/5</p>
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900 rounded p-2">
                        <p className="text-xs text-muted-foreground">Qualidade</p>
                        <p className="text-lg font-bold text-purple-600">{clientEvaluationRatings.quality}/5</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      handleCheckClientEvaluation();
                      setIsClientEvaluationModalOpen(true);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Avaliar Projeto
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atualizado em</p>
                  <p className="font-medium">
                    {new Date(project.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {project.dueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                    <p className="font-medium">
                      {new Date(project.dueDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipe do Projeto */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Equipe
                  </CardTitle>
                  {canManageTeam() && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        fetchAvailableUsers();
                        setIsTeamModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardDescription>
                  {teamMembers.length === 0
                    ? "Nenhum membro na equipe"
                    : `${teamMembers.length} membro${teamMembers.length > 1 ? "s" : ""}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => (
                      <div
                        key={`${member.id || 'member'}-${index}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{member.name || member.email}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(member.projectRoles || [member.projectRole]).map((role: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {canManageTeam() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveTeamMember(member.id)}
                            disabled={isLoadingTeam}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {canManageTeam()
                      ? "Clique no + para adicionar membros"
                      : "Somente o Gerente de Projetos pode adicionar membros"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Avaliar Equipe do Projeto */}
            {!hasEvaluated && teamMembers.length > 1 && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <CardTitle>Avaliar Equipe</CardTitle>
                  </div>
                  <CardDescription>
                    Avalie os membros da equipe do projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => {
                      fetchMembersToEvaluate();
                      setIsEvaluationModalOpen(true);
                      setCurrentMemberIndex(0);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Iniciar Avaliação
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Avaliação única e confidencial
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status dos Pagamentos */}
            {(payment || finalPayment) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pagamentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pagamento de Entrada (25%) */}
                  {payment && (
                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <span className="text-sm">📋</span>
                          Entrada (25%)
                        </h4>
                        <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                          {payment.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium">R$ {payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        {payment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pago em:</span>
                            <span className="font-medium text-green-600">
                              {new Date(payment.paidAt).toLocaleDateString("pt-BR", {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vencimento:</span>
                          <span className="font-medium">
                            {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagamento Final (75%) */}
                  {finalPayment && (
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                          <span className="text-sm">✅</span>
                          Pagamento Final (75%)
                        </h4>
                        <Badge variant={finalPayment.status === "paid" ? "default" : "secondary"}>
                          {finalPayment.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium">R$ {finalPayment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        {finalPayment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pago em:</span>
                            <span className="font-medium text-green-600">
                              {new Date(finalPayment.paidAt).toLocaleDateString("pt-BR", {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vencimento:</span>
                          <span className="font-medium">
                            {new Date(finalPayment.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumo Total */}
                  {payment && finalPayment && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Pago:</span>
                        <span className="text-xl font-bold text-green-600">
                          R$ {(payment.amount + finalPayment.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {payment.status === "paid" && finalPayment.status === "paid" && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Projeto totalmente quitado
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Projeto Concluído/Finalizado - Agendamento */}
            {(project.status === "completed" || project.status === "finished") && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Calendar className="h-5 w-5" />
                    {schedule 
                      ? (schedule.status === "pending_reschedule" ? "Reagendar Entrega" : "Agendamento de Entrega")
                      : "Enviar Link de Agendamento"
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Se já tem agendamento */}
                  {schedule ? (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            {project.status === "finished" 
                              ? "Entrega finalizada" 
                              : schedule?.status === "pending_reschedule" 
                                ? "Aguardando reagendamento do cliente" 
                                : "Entrega agendada"
                            }
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {project.status === "finished"
                              ? "Projeto entregue e finalizado com sucesso"
                              : schedule?.status === "pending_reschedule"
                                ? "Envie o link para o cliente reagendar a entrega"
                                : "Confirme a realização da entrega do projeto"
                            }
                          </p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold mb-3">📅 Detalhes do Agendamento</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Data:</span>
                            <span className="font-medium">
                              {(() => {
                                // Corrigir fuso horário - usar a data diretamente sem conversão UTC
                                const [year, month, day] = schedule.date.split('-');
                                const dataFormatada = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                return dataFormatada.toLocaleDateString("pt-BR", {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                });
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Horário:</span>
                            <span className="font-medium">{schedule.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span className="font-medium capitalize">
                              {schedule.type === "video" ? "Vídeo Chamada" : "Áudio Chamada"}
                            </span>
                          </div>
                          {schedule.meetingLink && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Link:</span>
                              <a
                                href={schedule.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {schedule.meetingLink}
                              </a>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={
                              schedule.status === "completed" ? "default" : 
                              schedule.status === "pending_reschedule" ? "destructive" : 
                              schedule.status === "rescheduled" ? "secondary" : "outline"
                            }>
                              {schedule.status === "completed" ? "Concluído" : 
                               schedule.status === "pending_reschedule" ? "⏳ Aguardando Reagendamento" : 
                               schedule.status === "rescheduled" ? "🔄 Reagendado" : "📅 Agendado"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Card de Histórico de Tentativas de Agendamento */}
                      {schedule.history && Array.isArray(schedule.history) && schedule.history.length > 0 && (
                        <Card className="border-0 shadow-md mt-4 overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">Histórico de Tentativas</CardTitle>
                                  <CardDescription className="text-amber-100">
                                    {schedule.history.length} {schedule.history.length === 1 ? 'tentativa registrada' : 'tentativas registradas'}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge className="bg-white/20 text-white border-0">
                                {schedule.history.filter((h: any) => h.status === 'cancelled').length} canceladas
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                              {schedule.history.map((attempt: any, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSelectedHistoryItem(attempt);
                                    setIsHistoryDetailDialogOpen(true);
                                  }}
                                  className={`w-full p-4 hover:bg-slate-50 transition-colors text-left ${
                                    attempt.status === 'cancelled' 
                                      ? 'bg-red-50/50 hover:bg-red-50' 
                                      : attempt.status === 'rescheduled'
                                        ? 'bg-amber-50/50 hover:bg-amber-50'
                                        : 'bg-slate-50/50 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    {/* Ícone/Status */}
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      attempt.status === 'cancelled' 
                                        ? 'bg-red-100 text-red-600' 
                                        : attempt.status === 'rescheduled'
                                          ? 'bg-amber-100 text-amber-600'
                                          : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {attempt.status === 'cancelled' ? <XCircle className="h-6 w-6" /> :
                                       attempt.status === 'rescheduled' ? <RefreshCw className="h-6 w-6" /> :
                                       <CheckCircle2 className="h-6 w-6" />}
                                    </div>
                                    
                                    {/* Informações Principais */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className={`font-semibold ${
                                          attempt.status === 'cancelled' ? 'text-red-900' :
                                          attempt.status === 'rescheduled' ? 'text-amber-900' :
                                          'text-slate-900'
                                        }`}>
                                          {attempt.status === 'cancelled' ? '❌ Cancelado' :
                                           attempt.status === 'rescheduled' ? '🔄 Reagendado' :
                                           '✅ Concluído'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(attempt.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span className="font-medium">
                                            {(() => {
                                              if (attempt.date) {
                                                const [year, month, day] = attempt.date.split('-');
                                                const dataFormatada = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                return dataFormatada.toLocaleDateString('pt-BR');
                                              }
                                              return '—';
                                            })()}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span className="font-medium">{attempt.time || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          {attempt.type === 'video' ? <Video className="h-3.5 w-3.5 text-muted-foreground" /> :
                                           attempt.type === 'audio' ? <Phone className="h-3.5 w-3.5 text-muted-foreground" /> :
                                           <Video className="h-3.5 w-3.5 text-muted-foreground" />}
                                          <span className="font-medium capitalize">
                                            {attempt.type === 'video' ? 'Vídeo' : attempt.type === 'audio' ? 'Áudio' : '—'}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {attempt.reason && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                          {attempt.status === 'cancelled' ? 'Motivo: ' : 'Obs: '}{formatReason(attempt.reason)}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Seta indicadora */}
                                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Botão Confirmar Entrega - aparece apenas quando status é scheduled ou rescheduled e projeto não está finished */}
                      {project.status !== "finished" && (schedule.status === "scheduled" || schedule.status === "rescheduled") && (
                        <Button
                          onClick={() => {
                            setIsScheduleDialogOpen(true);
                            setScheduleSuccess(null);
                            setFailureReason("");
                            setFailureDescription("");
                          }}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirmar Entrega
                        </Button>
                      )}

                      {/* Mensagem de projeto finalizado */}
                      {project.status === "finished" && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4">
                          <p className="text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Projeto finalizado e entregue com sucesso!
                          </p>
                        </div>
                      )}

                      {/* Botões de Envio - aparece quando status é pending_reschedule */}
                      {schedule.status === "pending_reschedule" && (
                        <>
                          <div className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium mb-2">Link de Reagendamento:</p>
                            <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                              {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar`}
                            </code>
                          </div>

                          {/* Botões de Envio */}
                          <div className="space-y-3">
                            <p className="text-sm font-medium">Enviar link por:</p>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  const email = project.clientEmail || project.clientName;
                                  if (!email) {
                                    toast({
                                      title: "E-mail não disponível",
                                      description: "O e-mail do cliente não está disponível.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  const subject = `Reagende a Entrega do Seu Projeto - ${project.name}`;
                                  const body = `Olá ${project.clientName}!\n\nIdentificamos que não foi possível realizar a entrega do seu projeto na data agendada.\n\nPor favor, reagende a entrega no link abaixo:\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar\n\nVocê poderá escolher:\n- Data e horário de sua preferência\n- Tipo de entrega: Vídeo ou Áudio chamada\n\nAguardamos você!\n\nEquipe Softrha`;

                                  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

                                  toast({
                                    title: "E-mail aberto!",
                                    description: "Preencha e envie o e-mail para o cliente.",
                                  });
                                }}
                                className="flex-1"
                                variant="outline"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar por E-mail
                              </Button>

                              <Button
                                onClick={() => {
                                  const phone = project.clientPhone;
                                  if (!phone) {
                                    toast({
                                      title: "Telefone não disponível",
                                      description: "O telefone do cliente não está disponível.",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  const phoneDigits = phone.replace(/\D/g, "");
                                  const message = `Olá ${project.clientName}!\n\nIdentificamos que não foi possível realizar a entrega do seu projeto na data agendada.\n\nPor favor, reagende a entrega no link abaixo:\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar\n\nVocê poderá escolher data, horário e o tipo de entrega (vídeo ou áudio).\n\nAguardamos você!\n\nEquipe Softrha`;

                                  window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");

                                  toast({
                                    title: "WhatsApp aberto!",
                                    description: "Envie a mensagem para o cliente.",
                                  });
                                }}
                                className="flex-1"
                                variant="outline"
                                disabled={!project.clientPhone}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Enviar por WhatsApp
                              </Button>
                            </div>

                            <Button
                              onClick={() => {
                                const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar`;
                                navigator.clipboard.writeText(url);
                                toast({
                                  title: "Link copiado!",
                                  description: "Link de reagendamento copiado para a área de transferência",
                                });
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Link
                            </Button>
                          </div>
                        </>
                      )}

                      {schedule.status === "completed" && (
                        <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg p-4">
                          <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Entrega confirmada com sucesso
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Se não tem agendamento - mostrar link de envio */
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">
                            Projeto concluído - Envie o link para o cliente agendar
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            O cliente receberá um link personalizado para agendar a entrega conforme sua disponibilidade.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium mb-2">Link de Agendamento:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                          {`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar`}
                        </code>
                      </div>

                      {/* Botões de Envio */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Enviar link por:</p>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              const email = project.clientEmail || project.clientName;
                              if (!email) {
                                toast({
                                  title: "E-mail não disponível",
                                  description: "O e-mail do cliente não está disponível.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const subject = `Agende a Entrega do Seu Projeto - ${project.name}`;
                              const body = `Olá ${project.clientName}!\n\nSeu projeto está 100% concluído e pronto para entrega! 🎉\n\nAgora você pode agendar a entrega no link abaixo:\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar\n\nVocê poderá escolher:\n- Data e horário de sua preferência\n- Tipo de entrega: Vídeo ou Áudio chamada\n\nAguardamos você!\n\nEquipe Softrha`;

                              window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

                              toast({
                                title: "E-mail aberto!",
                                description: "Preencha e envie o e-mail para o cliente.",
                              });
                            }}
                            className="flex-1"
                            variant="outline"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar por E-mail
                          </Button>

                          <Button
                            onClick={() => {
                              const phone = project.clientPhone;
                              if (!phone) {
                                toast({
                                  title: "Telefone não disponível",
                                  description: "O telefone do cliente não está disponível.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const phoneDigits = phone.replace(/\D/g, "");
                              const message = `Olá ${project.clientName}! 🎉\n\nSeu projeto está 100% concluído e pronto para entrega!\n\nAgora você pode agendar a entrega no link abaixo:\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar\n\nVocê poderá escolher data, horário e o tipo de entrega (vídeo ou áudio).\n\nAguardamos você!\n\nEquipe Softrha`;

                              window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");

                              toast({
                                title: "WhatsApp aberto!",
                                description: "Envie a mensagem para o cliente.",
                              });
                            }}
                            className="flex-1"
                            variant="outline"
                            disabled={!project.clientPhone}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Enviar por WhatsApp
                          </Button>
                        </div>

                        <Button
                          onClick={() => {
                            const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${params.id}/agendar`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Link copiado!",
                              description: "Link de agendamento copiado para a área de transferência",
                            });
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>

                      <div className="text-xs text-green-600 dark:text-green-400">
                        <p className="font-medium mb-1">Ao clicar, o cliente poderá:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Selecionar data e horário de sua preferência</li>
                          <li>Escolher entre vídeo ou áudio chamada</li>
                          <li>Adicionar observações ou dúvidas</li>
                          <li>Receber confirmação automática por e-mail</li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog de Pagamento */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Link de Pagamento
              </DialogTitle>
              <DialogDescription>
                Gere e envie o link de pagamento da entrada (25%) para o cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700 dark:text-green-300">Valor da Entrada:</span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-200">
                    R$ {((project.budget || 0) * 0.25).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  25% do valor total do projeto (R$ {(project.budget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                </p>
              </div>

              {paymentLink && isAcceptedByCurrentUser() ? (
                <div className="space-y-3">
                  <div className="bg-muted rounded-md p-3 break-all">
                    <p className="text-xs font-mono text-muted-foreground">
                      {paymentLink}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCopyPaymentLink} className="flex-1" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button onClick={handleSendPaymentEmail} className="flex-1" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      E-mail
                    </Button>
                    <Button onClick={handleSendPaymentWhatsApp} className="flex-1" variant="outline" disabled={!project?.clientPhone}>
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    O projeto será liberado automaticamente após a confirmação do pagamento.
                  </p>
                </div>
              ) : paymentLink ? (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    🔒 Apenas o responsável pelo orçamento pode gerenciar o link de pagamento.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Clique abaixo para gerar o link de pagamento Stripe.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaymentDialogOpen(false);
                  setPaymentLink(null);
                }}
              >
                Fechar
              </Button>
              {!paymentLink && isAcceptedByCurrentUser() && (
                <Button
                  onClick={handleGeneratePaymentLink}
                  disabled={isGeneratingPaymentLink}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGeneratingPaymentLink ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Gerar Link de Pagamento
                    </>
                  )}
                </Button>
              )}
              {!paymentLink && !isAcceptedByCurrentUser() && (
                <div className="text-center py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg">
                  🔒 Apenas o responsável pelo orçamento pode gerar o link de pagamento.
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Notificar Evolução */}
        <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Notificar Evolução do Projeto
              </DialogTitle>
              <DialogDescription>
                Selecione a etapa atual do projeto para notificar o cliente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm font-semibold">Etapa do Projeto:</p>
              
              {/* Etapas do Projeto */}
              <div className="space-y-2">
                {/* Etapa 1: Projeto Iniciado */}
                <Button
                  variant={selectedStage === "started" ? "default" : "outline"}
                  onClick={() => setSelectedStage("started")}
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedStage === "started" ? "bg-white/20" : "bg-blue-50"
                    }`}>
                      <Rocket className={`h-5 w-5 ${
                        selectedStage === "started" ? "text-white" : "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">🚀 Projeto Iniciado</p>
                      <p className="text-xs text-muted-foreground">
                        Primeiros desenvolvimentos • 20% concluído
                      </p>
                    </div>
                    {selectedStage === "started" && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    )}
                  </div>
                </Button>

                {/* Etapa 2: Em Desenvolvimento */}
                <Button
                  variant={selectedStage === "in_progress" ? "default" : "outline"}
                  onClick={() => setSelectedStage("in_progress")}
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedStage === "in_progress" ? "bg-white/20" : "bg-indigo-50"
                    }`}>
                      <Activity className={`h-5 w-5 ${
                        selectedStage === "in_progress" ? "text-white" : "text-indigo-600"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">⚙️ Em Desenvolvimento</p>
                      <p className="text-xs text-muted-foreground">
                        Metade do caminho • 50% concluído
                      </p>
                    </div>
                    {selectedStage === "in_progress" && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    )}
                  </div>
                </Button>

                {/* Etapa 3: Quase Concluído */}
                <Button
                  variant={selectedStage === "almost_done" ? "default" : "outline"}
                  onClick={() => setSelectedStage("almost_done")}
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedStage === "almost_done" ? "bg-white/20" : "bg-amber-50"
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        selectedStage === "almost_done" ? "text-white" : "text-amber-600"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">🎯 Quase Concluído</p>
                      <p className="text-xs text-muted-foreground">
                        Reta final • 70% concluído
                      </p>
                    </div>
                    {selectedStage === "almost_done" && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    )}
                  </div>
                </Button>

                {/* Etapa 4: Projeto Concluído */}
                <Button
                  variant={selectedStage === "completed" ? "default" : "outline"}
                  onClick={() => setSelectedStage("completed")}
                  className="w-full justify-start h-auto py-3 px-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedStage === "completed" ? "bg-white/20" : "bg-green-50"
                    }`}>
                      <CheckCircle2 className={`h-5 w-5 ${
                        selectedStage === "completed" ? "text-white" : "text-green-600"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">✅ Projeto Concluído</p>
                      <p className="text-xs text-muted-foreground">
                        Pronto para entrega • 100% concluído
                      </p>
                    </div>
                    {selectedStage === "completed" && (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    )}
                  </div>
                </Button>
              </div>

              {/* Inputs de URLs - aparece apenas quando Projeto Concluído é selecionado */}
              {selectedStage === "completed" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  {/* Git URL - Obrigatório */}
                  <div className="space-y-2">
                    <Label htmlFor="gitUrl" className="font-semibold text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        📦 Repositório do Projeto
                        <span className="text-xs text-red-600">*</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto text-xs text-muted-foreground hover:text-muted-foreground"
                        onClick={() => {
                          setGitRepositoryUrl("https://github.com/teste/projeto-exemplo");
                        }}
                      >
                        Inserir URL de Teste
                      </Button>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Code className="h-4 w-4" />
                      </div>
                      <Input
                        id="gitUrl"
                        placeholder="https://github.com/usuario/projeto"
                        value={gitRepositoryUrl}
                        onChange={(e) => setGitRepositoryUrl(e.target.value)}
                        className={`pl-10 ${!gitRepositoryUrl.trim() ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                      />
                    </div>
                    {!gitRepositoryUrl.trim() && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <span className="font-semibold">Obrigatório:</span> Informe a URL do repositório
                      </p>
                    )}
                  </div>

                  {/* Test URL - Opcional */}
                  <div className="space-y-2">
                    <Label htmlFor="testUrl" className="font-semibold text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      URL de Teste do Projeto
                      <Badge variant="secondary" className="text-[10px] font-normal">Opcional</Badge>
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Globe className="h-4 w-4" />
                      </div>
                      <Input
                        id="testUrl"
                        placeholder="https://projeto-teste.vercel.app ou https://staging.example.com"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      URL onde o cliente pode visualizar/testar o projeto (Vercel, Netlify, servidor de staging, etc.)
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Opções de Envio */}
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold">Enviar notificação por:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="notifyEmail"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="notifyEmail" className="flex items-center gap-2 cursor-pointer font-normal">
                      <Mail className="h-4 w-4" /> E-mail
                    </Label>
                  </div>
                  {project?.clientPhone && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="notifyWhatsApp"
                        checked={notifyWhatsApp}
                        onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="notifyWhatsApp" className="flex items-center gap-2 cursor-pointer font-normal">
                        <Phone className="h-4 w-4" /> WhatsApp
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  📧 O cliente receberá uma notificação sobre a evolução do projeto pelos canais selecionados.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsNotificationDialogOpen(false);
                setGitRepositoryUrl("");
                setTestUrl("");
              }}>
                Cancelar
              </Button>
              <Button
                onClick={() => selectedStage && handleNotifyProgress(selectedStage)}
                disabled={
                  !selectedStage || 
                  isNotifyingProgress || 
                  (!notifyEmail && !notifyWhatsApp) ||
                  (selectedStage === "completed" && !gitRepositoryUrl.trim())
                }
              >
                {isNotifyingProgress ? "Enviando..." : "Notificar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Pagamento Final (75%) */}
        <Dialog open={isFinalPaymentDialogOpen} onOpenChange={setIsFinalPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Enviar Pagamento Final (75%)
              </DialogTitle>
              <DialogDescription>
                Envie o link de pagamento do saldo restante para o cliente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700 dark:text-green-300">Valor Restante (75%):</span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-200">
                    R$ {((project.budget || 0) * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Saldo restante do valor total do projeto (R$ {(project.budget || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                </p>
              </div>

              {finalPaymentLink && isAcceptedByCurrentUser() ? (
                <div className="space-y-3">
                  <div className="bg-muted rounded-md p-3 break-all">
                    <p className="text-xs font-mono text-muted-foreground">
                      {finalPaymentLink}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCopyFinalPaymentLink} className="flex-1" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button onClick={() => window.open(finalPaymentLink, "_blank")} className="flex-1" variant="outline">
                      <Rocket className="h-4 w-4 mr-2" />
                      Abrir Link
                    </Button>
                  </div>

                  {/* Botões de Envio Direto - Apenas para quem aceitou */}
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-semibold">Enviar por:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          const email = budget?.clientEmail || project.clientEmail;
                          if (!email) {
                            toast({
                              title: "E-mail não disponível",
                              description: "O e-mail do cliente não está disponível.",
                              variant: "destructive",
                            });
                            return;
                          }
                          const subject = `Pagamento Final - ${project.name}`;
                          const body = `Olá ${budget?.clientName || project.clientName}!\n\nSeu projeto está 100% concluído! 🎉\n\nSegue o link para pagamento final (75%):\n\n${finalPaymentLink}\n\nValor: R$ ${((project.budget || 0) * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\nApós o pagamento, você poderá agendar a entrega!\n\nEquipe Softrha`;

                          window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

                          toast({
                            title: "E-mail aberto!",
                            description: "Preencha e envie o e-mail para o cliente.",
                          });
                        }}
                        className="flex-1"
                        variant="outline"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        E-mail
                      </Button>

                      <Button
                        onClick={() => {
                          const phone = budget?.clientPhone || project.clientPhone;
                          if (!phone) {
                            toast({
                              title: "Telefone não disponível",
                              description: "O telefone do cliente não está disponível.",
                              variant: "destructive",
                            });
                            return;
                          }
                          const phoneDigits = phone.replace(/\D/g, "");
                          const message = `Olá ${budget?.clientName || project.clientName}! 🎉\n\nSeu projeto está 100% concluído!\n\nSegue o link para pagamento final (75%):\n\n${finalPaymentLink}\n\nValor: R$ ${((project.budget || 0) * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\nApós o pagamento, você poderá agendar a entrega!\n\nEquipe Softrha`;

                          window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");

                          toast({
                            title: "WhatsApp aberto!",
                            description: "Envie a mensagem para o cliente.",
                          });
                        }}
                        className="flex-1"
                        variant="outline"
                        disabled={!budget?.clientPhone && !project.clientPhone}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    O projeto será concluído automaticamente após a confirmação do pagamento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Como deseja enviar o link de pagamento?
                  </p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        id="sendEmail"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="sendEmail" className="text-sm">E-mail</label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        id="sendWhatsApp"
                        checked={sendWhatsApp}
                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="sendWhatsApp" className="text-sm">WhatsApp</label>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      📧 O cliente receberá um e-mail com o link de pagamento e instruções.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsFinalPaymentDialogOpen(false);
                  setFinalPaymentLink(null);
                  setSendEmail(true);
                  setSendWhatsApp(false);
                }}
              >
                Fechar
              </Button>
              {!finalPaymentLink && isAcceptedByCurrentUser() && (
                <Button
                  onClick={handleSendFinalPayment}
                  disabled={isSendingFinalPayment || (!sendEmail && !sendWhatsApp)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSendingFinalPayment ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Enviar Pagamento Final
                    </>
                  )}
                </Button>
              )}
              {!finalPaymentLink && !isAcceptedByCurrentUser() && (
                <div className="text-center py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg">
                  🔒 Apenas o responsável pelo orçamento pode enviar o pagamento final.
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Entrega */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Confirmar Entrega do Projeto
              </DialogTitle>
              <DialogDescription>
                Informe se a entrega do projeto foi realizada com sucesso
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Opções de Sucesso/Falha */}
              <div className="space-y-3">
                <Label className="font-medium">A entrega foi realizada?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={scheduleSuccess === true ? "default" : "outline"}
                    className={scheduleSuccess === true ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => {
                      setScheduleSuccess(true);
                      setFailureReason("");
                      setFailureDescription("");
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Sim, com sucesso
                  </Button>
                  <Button
                    type="button"
                    variant={scheduleSuccess === false ? "default" : "outline"}
                    className={scheduleSuccess === false ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setScheduleSuccess(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Não teve comunicação
                  </Button>
                </div>
              </div>

              {/* Motivo da Falha (apenas se não houve comunicação) */}
              {scheduleSuccess === false && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <Label htmlFor="failureReason" className="font-medium">
                      Motivo da falha <span className="text-red-600">*</span>
                    </Label>
                    <Select value={failureReason} onValueChange={setFailureReason}>
                      <SelectTrigger id="failureReason">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente_nao_respondeu">📵 Não obtivemos resposta do cliente</SelectItem>
                        <SelectItem value="cliente_desistiu">❌ O cliente desistiu do projeto</SelectItem>
                        <SelectItem value="erro_tecnico">⚠️ Erro técnico na entrega</SelectItem>
                        <SelectItem value="agenda_incompativel">📅 Agenda incompatível com o cliente</SelectItem>
                        <SelectItem value="outro">📝 Outro motivo</SelectItem>
                      </SelectContent>
                    </Select>
                    {!failureReason && (
                      <p className="text-xs text-red-600">Campo obrigatório</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="failureDescription" className="font-medium">
                      Descrição (opcional)
                    </Label>
                    <Textarea
                      id="failureDescription"
                      placeholder="Descreva o que aconteceu..."
                      value={failureDescription}
                      onChange={(e) => setFailureDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Resumo */}
              {scheduleSuccess !== null && (
                <div className={`rounded-lg p-4 ${scheduleSuccess ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'}`}>
                  <p className="text-sm font-medium">
                    {scheduleSuccess
                      ? "✅ Entrega será marcada como concluída"
                      : "⚠️ Agendamento será reagendado"}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsScheduleDialogOpen(false);
                  setScheduleSuccess(null);
                  setFailureReason("");
                  setFailureDescription("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={isConfirmingSchedule || scheduleSuccess === null || (!scheduleSuccess && !failureReason)}
                className={scheduleSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isConfirmingSchedule ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    {scheduleSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar Entrega
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Registrar Falha
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes do Histórico de Agendamento */}
        <Dialog open={isHistoryDetailDialogOpen} onOpenChange={setIsHistoryDetailDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Detalhes da Tentativa
              </DialogTitle>
              <DialogDescription>
                Informações completas sobre esta tentativa de agendamento
              </DialogDescription>
            </DialogHeader>
            
            {selectedHistoryItem && (
              <div className="space-y-6">
                {/* Status Header */}
                <div className={`p-4 rounded-lg border-2 ${
                  selectedHistoryItem.status === 'cancelled' 
                    ? 'bg-red-50 border-red-200' 
                    : selectedHistoryItem.status === 'rescheduled'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      selectedHistoryItem.status === 'cancelled' 
                        ? 'bg-red-100 text-red-600' 
                        : selectedHistoryItem.status === 'rescheduled'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-green-100 text-green-600'
                    }`}>
                      {selectedHistoryItem.status === 'cancelled' ? <XCircle className="h-5 w-5" /> :
                       selectedHistoryItem.status === 'rescheduled' ? <RefreshCw className="h-5 w-5" /> :
                       <CheckCircle2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${
                        selectedHistoryItem.status === 'cancelled' ? 'text-red-900' :
                        selectedHistoryItem.status === 'rescheduled' ? 'text-amber-900' :
                        'text-green-900'
                      }`}>
                        {selectedHistoryItem.status === 'cancelled' ? '❌ Cancelado' :
                         selectedHistoryItem.status === 'rescheduled' ? '🔄 Reagendado' :
                         '✅ Concluído'}
                      </p>
                      <p className={`text-xs ${
                        selectedHistoryItem.status === 'cancelled' ? 'text-red-700' :
                        selectedHistoryItem.status === 'rescheduled' ? 'text-amber-700' :
                        'text-green-700'
                      }`}>
                        {new Date(selectedHistoryItem.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Agendamento */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                    📅 Detalhes do Agendamento
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-500">Data</span>
                      </div>
                      <p className="font-semibold">
                        {(() => {
                          if (selectedHistoryItem.date) {
                            const [year, month, day] = selectedHistoryItem.date.split('-');
                            const dataFormatada = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            return dataFormatada.toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            });
                          }
                          return '—';
                        })()}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-500">Horário</span>
                      </div>
                      <p className="font-semibold">{selectedHistoryItem.time || '—'}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedHistoryItem.type === 'video' ? <Video className="h-4 w-4 text-slate-400" /> :
                         <Phone className="h-4 w-4 text-slate-400" />}
                        <span className="text-xs text-slate-500">Tipo</span>
                      </div>
                      <p className="font-semibold capitalize">
                        {selectedHistoryItem.type === 'video' ? '📹 Vídeo Chamada' :
                         selectedHistoryItem.type === 'audio' ? '📞 Áudio Chamada' :
                         '—'}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-500">Status</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        selectedHistoryItem.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                        selectedHistoryItem.status === 'rescheduled' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                        'bg-green-100 text-green-700 border-green-300'
                      }`}>
                        {selectedHistoryItem.status === 'cancelled' ? 'Cancelado' :
                         selectedHistoryItem.status === 'rescheduled' ? 'Reagendado' :
                         selectedHistoryItem.status === 'completed' ? 'Concluído' :
                         'Agendado'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Motivo/Observações */}
                {(selectedHistoryItem.reason || selectedHistoryItem.description) && (
                  <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                      📝 {selectedHistoryItem.status === 'cancelled' ? 'Motivo do Cancelamento' : 'Observações'}
                    </h4>
                    <div className="space-y-3">
                      {selectedHistoryItem.reason && (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs font-semibold text-amber-800 mb-1">
                            {selectedHistoryItem.status === 'cancelled' ? 'Motivo:' : 'Observação:'}
                          </p>
                          <p className="text-sm text-amber-900">{formatReason(selectedHistoryItem.reason)}</p>
                        </div>
                      )}
                      {selectedHistoryItem.description && (
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-xs font-semibold text-slate-700 mb-1">
                            Descrição adicional:
                          </p>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedHistoryItem.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações de Registro */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-muted-foreground text-center">
                    Registrado em {new Date(selectedHistoryItem.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHistoryDetailDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Justificativa para Alteração de URL */}
        <Dialog open={isEditUrlDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsEditUrlDialogOpen(false);
            setUrlFieldToEdit(null);
            setNewUrlValue("");
            setUrlChangeReason("");
            setUrlChangeDescription("");
          } else {
            setIsEditUrlDialogOpen(true);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-600" />
                Justificar Alteração de URL
              </DialogTitle>
              <DialogDescription>
                {urlFieldToEdit === "git" 
                  ? "Informe a justificativa para alterar o repositório do projeto"
                  : "Informe a justificativa para alterar a URL de teste preview"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Nova URL */}
              <div className="space-y-2">
                <Label htmlFor="newUrl" className="font-semibold">
                  {urlFieldToEdit === "git" ? "Novo Repositório" : "Nova URL de Teste"}
                </Label>
                <div className="relative">
                  {urlFieldToEdit === "git" ? (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Code className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Globe className="h-4 w-4" />
                    </div>
                  )}
                  <Input
                    id="newUrl"
                    placeholder={urlFieldToEdit === "git" 
                      ? "https://github.com/usuario/projeto"
                      : "https://projeto-teste.vercel.app"
                    }
                    value={newUrlValue}
                    onChange={(e) => setNewUrlValue(e.target.value)}
                    className={urlFieldToEdit === "git" ? "pl-10" : "pl-10"}
                  />
                </div>
              </div>

              {/* Select de Justificativa */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="font-semibold flex items-center gap-1">
                  Motivo da Alteração
                  <span className="text-red-600">*</span>
                </Label>
                <Select value={urlChangeReason} onValueChange={setUrlChangeReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="migracao_repositorio">Migração de Repositório</SelectItem>
                    <SelectItem value="mudanca_plataforma">Mudança de Plataforma</SelectItem>
                    <SelectItem value="atualizacao_ambiente">Atualização de Ambiente</SelectItem>
                    <SelectItem value="erro_url_anterior">Erro na URL Anterior</SelectItem>
                    <SelectItem value="solicitacao_cliente">Solicitação do Cliente</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição/Obs Opcional */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">
                  Observações Adicionais
                  <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva detalhes sobre a alteração..."
                  value={urlChangeDescription}
                  onChange={(e) => setUrlChangeDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Esta alteração será registrada no histórico do projeto.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditUrlDialogOpen(false);
                  setUrlFieldToEdit(null);
                  setNewUrlValue("");
                  setUrlChangeReason("");
                  setUrlChangeDescription("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUrlWithJustification}
                disabled={isUpdatingUrl || !newUrlValue.trim() || !urlChangeReason}
              >
                {isUpdatingUrl ? "Atualizando..." : "Atualizar URL"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Histórico de Alterações de URL */}
        <Dialog open={isUrlHistoryDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsUrlHistoryDialogOpen(false);
            setUrlHistory([]);
          } else {
            setIsUrlHistoryDialogOpen(true);
          }
        }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Histórico de Alterações de URL
              </DialogTitle>
              <DialogDescription>
                Todas as alterações de repositório e URL de teste do projeto
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : urlHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma alteração registrada</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As alterações de URL aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {urlHistory.map((item, index) => {
                    const isGit = item.field === "git";
                    const reasonLabels: Record<string, string> = {
                      migracao_repositorio: "Migração de Repositório",
                      mudanca_plataforma: "Mudança de Plataforma",
                      atualizacao_ambiente: "Atualização de Ambiente",
                      erro_url_anterior: "Erro na URL Anterior",
                      solicitacao_cliente: "Solicitação do Cliente",
                      outro: "Outro",
                    };

                    return (
                      <div
                        key={item.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-md ${
                              isGit 
                                ? "bg-slate-100 dark:bg-slate-800" 
                                : "bg-emerald-100 dark:bg-emerald-950/20"
                            }`}>
                              {isGit ? (
                                <Code className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              ) : (
                                <Globe className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {isGit ? "Repositório Git" : "URL de Teste"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{urlHistory.length - index}
                          </Badge>
                        </div>

                        {/* URLs */}
                        <div className="space-y-2">
                          {item.oldUrl && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-red-600 flex-shrink-0 mt-0.5">
                                Anterior:
                              </span>
                              <a
                                href={item.oldUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-red-600 hover:underline line-through"
                              >
                                {item.oldUrl}
                              </a>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-green-600 flex-shrink-0 mt-0.5">
                              Nova:
                            </span>
                            <a
                              href={item.newUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:underline"
                            >
                              {item.newUrl}
                            </a>
                          </div>
                        </div>

                        {/* Motivo */}
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex-shrink-0">
                              Motivo:
                            </span>
                            <span className="text-xs text-amber-900 dark:text-amber-100">
                              {reasonLabels[item.reason] || item.reason}
                            </span>
                          </div>
                        </div>

                        {/* Descrição */}
                        {item.description && (
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">
                                Observações:
                              </span>
                              <p className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUrlHistoryDialogOpen(false);
                  setUrlHistory([]);
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Adicionar Membro da Equipe */}
        <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Adicionar Membro à Equipe
              </DialogTitle>
              <DialogDescription>
                Selecione um usuário e defina suas áreas de atuação no projeto
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Buscar Usuário</Label>
                <Input
                  placeholder="Digite o nome ou email..."
                  onChange={(e) => fetchAvailableUsers(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Usuários Disponíveis</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-2">
                  {availableUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum usuário encontrado
                    </p>
                  ) : (
                    availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUser === user.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {user.name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.teamRole || "Membro"}
                            </p>
                          </div>
                        </div>
                        {selectedUser === user.id && (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Áreas de Atuação no Projeto (selecione uma ou mais)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                  {[
                    "Desenvolvedor Frontend",
                    "Desenvolvedor Backend",
                    "Desenvolvedor Fullstack",
                    "Designer UI/UX",
                    "Gerente de Projetos",
                    "Product Owner",
                    "Scrum Master",
                    "QA / Tester",
                    "DevOps",
                    "Arquiteto de Software",
                    "Banco de Dados",
                    "Segurança",
                    "Suporte Técnico",
                    "Outro",
                  ].map((role) => (
                    <div
                      key={role}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedProjectRoles.includes(role)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleProjectRole(role)}
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          selectedProjectRoles.includes(role)
                            ? "bg-primary-foreground border-primary-foreground"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedProjectRoles.includes(role) && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </div>
                      <span className="text-xs">{role}</span>
                    </div>
                  ))}
                </div>
                {selectedProjectRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedProjectRoles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                        <button
                          onClick={() => toggleProjectRole(role)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTeamModalOpen(false);
                  setSelectedUser("");
                  setSelectedProjectRoles([]);
                }}
                disabled={isLoadingTeam}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddTeamMember}
                disabled={!selectedUser || selectedProjectRoles.length === 0 || isLoadingTeam}
              >
                {isLoadingTeam ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar ({selectedProjectRoles.length})
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Avaliação de Membros da Equipe */}
        <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Avaliar Membro da Equipe
              </DialogTitle>
              <DialogDescription>
                {membersToEvaluate.length > 0 && (
                  <span>
                    Membro {currentMemberIndex + 1} de {membersToEvaluate.length}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {membersToEvaluate.length > 0 && (
              <div className="space-y-6">
                {/* Membro Atual */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{membersToEvaluate[currentMemberIndex]?.name}</p>
                    <p className="text-sm text-muted-foreground">{membersToEvaluate[currentMemberIndex]?.role}</p>
                  </div>
                </div>

                {/* Perguntas de Avaliação */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Avaliação Geral (1-5 estrelas)
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvaluationRatings({ ...evaluationRatings, rating: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= evaluationRatings.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Participação no Projeto (1-5)
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvaluationRatings({ ...evaluationRatings, participation: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= evaluationRatings.participation
                                ? "text-blue-500 fill-blue-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Qualidade do Trabalho (1-5)
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvaluationRatings({ ...evaluationRatings, quality: star })}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= evaluationRatings.quality
                                ? "text-green-500 fill-green-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Comentário (opcional)</Label>
                    <Textarea
                      placeholder="Deixe um comentário sobre o trabalho deste membro..."
                      value={evaluationRatings.comment}
                      onChange={(e) => setEvaluationRatings({ ...evaluationRatings, comment: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEvaluationModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitEvaluation}
                    disabled={evaluationRatings.rating === 0 || evaluationRatings.participation === 0 || evaluationRatings.quality === 0}
                  >
                    {currentMemberIndex < membersToEvaluate.length - 1 ? (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Finalizar Avaliações
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Avaliação do Cliente */}
        <Dialog open={isClientEvaluationModalOpen} onOpenChange={setIsClientEvaluationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500 fill-purple-500" />
                Avaliar Projeto
              </DialogTitle>
              <DialogDescription>
                Avalie sua experiência com este projeto
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Pergunta 1: Avaliação Geral */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  1. Avaliação Geral do Projeto (1-5 estrelas)
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setClientEvaluationRatings({ ...clientEvaluationRatings, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= clientEvaluationRatings.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {clientEvaluationRatings.rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Você avaliou com {clientEvaluationRatings.rating} de 5 estrelas
                  </p>
                )}
              </div>

              {/* Pergunta 2: Participação */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  2. Sua Participação no Projeto (1-5 estrelas)
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setClientEvaluationRatings({ ...clientEvaluationRatings, participation: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= clientEvaluationRatings.participation
                            ? "text-blue-500 fill-blue-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {clientEvaluationRatings.participation > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Participação: {clientEvaluationRatings.participation} de 5
                  </p>
                )}
              </div>

              {/* Pergunta 3: Qualidade */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  3. Qualidade do Trabalho Entregue (1-5 estrelas)
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setClientEvaluationRatings({ ...clientEvaluationRatings, quality: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= clientEvaluationRatings.quality
                            ? "text-green-500 fill-green-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {clientEvaluationRatings.quality > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Qualidade: {clientEvaluationRatings.quality} de 5
                  </p>
                )}
              </div>

              {/* Comentário */}
              <div className="space-y-2">
                <Label>Comentário (opcional)</Label>
                <Textarea
                  placeholder="Deixe um comentário sobre sua experiência com o projeto..."
                  value={clientEvaluationRatings.comment}
                  onChange={(e) => setClientEvaluationRatings({ ...clientEvaluationRatings, comment: e.target.value })}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsClientEvaluationModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitClientEvaluation}
                  disabled={clientEvaluationRatings.rating === 0 || clientEvaluationRatings.participation === 0 || clientEvaluationRatings.quality === 0}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enviar Avaliação
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
