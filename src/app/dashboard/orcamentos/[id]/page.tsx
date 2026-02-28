"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Mail,
  Building,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  FileText,
  Copy,
  Edit2,
  FileSignature,
  ExternalLink,
  Download,
  Phone,
  Rocket,
  Layers,
  Monitor,
  Palette,
  Code,
  Globe,
  Smartphone,
  ShoppingCart,
  BarChart3,
  CreditCard,
  Plus,
  X,
  MessageSquare,
  MapPin,
  Info,
  Activity,
  CheckCircle,
  Circle,
  StepForward,
  History,
  RefreshCcw,
  QrCode,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Budget {
  id: string;
  projectId: string | null;
  projectType: string;
  complexity: string;
  timeline: string;
  features: any;
  integrations: any;
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
  startDate?: string | null;
  changeReason?: string;
  changeDescription?: string;
  deletionReason?: string;
  deletionDescription?: string;
  approvalToken?: string | null;
  contract?: any;
  technologies?: string[] | any;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  acceptedByUser?: {
    name?: string | null;
    email?: string | null;
  } | null;
  user?: {
    name?: string | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  accepted: "Aceito",
  rejected: "Rejeitado",
  user_approved: "Aprovado pelo Usuário",
  contract_sent: "Contrato Enviado",
  contract_signed: "Contrato Assinado",
  down_payment_sent: "Aguardando Pagamento",
  down_payment_paid: "Entrada Paga",
  project_in_progress: "Projeto em Andamento",
  final_payment_sent: "Aguardando Pagamento Final",
  final_payment_paid: "Pagamento Final Pago",
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
  project_in_progress: "bg-cyan-500",
  final_payment_sent: "bg-orange-500",
  final_payment_paid: "bg-lime-500",
  completed: "bg-green-600",
};

const changeReasons = [
  { value: "preco_incompativel", label: "Preço Incompatível" },
  { value: "prazo_incompativel", label: "Prazo Incompatível" },
  { value: "escopo_alterado", label: "Escopo Alterado" },
  { value: "cliente_desistiu", label: "Cliente Desistiu" },
  { value: "cliente_sem_resposta", label: "Cliente Sem Resposta" },
  { value: "erro_interno", label: "Erro Interno" },
  { value: "outro", label: "Outro" },
];

export default function OrcamentoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [acceptAction, setAcceptAction] = useState<"accept" | "decline">("accept");
  const [declineReason, setDeclineReason] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  // Dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditValueDialogOpen, setIsEditValueDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // Edição de valor
  const [editFinalValue, setEditFinalValue] = useState<string>("");
  const [editTimeline, setEditTimeline] = useState<string>("");
  const [editStartDate, setEditStartDate] = useState<string>("");
  const [formattedBudget, setFormattedBudget] = useState<string>("");
  const [editTechnologies, setEditTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  // Converter timeline para semanas
  const getTimelineInWeeks = (timeline: string): string => {
    const timelineMap: Record<string, string> = {
      urgent: "1-2 semanas",
      normal: "3-6 semanas",
      flexible: "6+ semanas",
    };
    return timelineMap[timeline] || timeline;
  };

  // Calcular data prevista de entrega com base na startDate e timeline
  const getExpectedDeliveryDate = (): string => {
    if (!budget || !budget.startDate) return "—";

    const startDate = new Date(budget.startDate);
    const timelineWeeks: Record<string, number> = {
      urgent: 2,
      normal: 6,
      flexible: 8,
    };
    const weeks = timelineWeeks[budget.timeline] || 6;
    const deliveryDate = new Date(startDate);
    deliveryDate.setDate(deliveryDate.getDate() + (weeks * 7));
    return deliveryDate.toLocaleDateString("pt-BR");
  };

  // Justificativas
  const [changeReason, setChangeReason] = useState("");
  const [changeDescription, setChangeDescription] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionDescription, setDeletionDescription] = useState("");

  // Envio
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [approvalLink, setApprovalLink] = useState<string | null>(null);
  const [isViewContractDialogOpen, setIsViewContractDialogOpen] = useState(false);
  const [contractConfirmed, setContractConfirmed] = useState(false);
  const [isConfirmingContract, setIsConfirmingContract] = useState(false);
  const [isPaymentLinkDialogOpen, setIsPaymentLinkDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentLinkData, setPaymentLinkData] = useState<any>(null);

  // Histórico de ações
  const [actionHistory, setActionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchCurrentUser();
      fetchBudget();
      fetchActionHistory();

      // Atualizar status a cada 5000ms (5 segundos)
      const intervalId = setInterval(() => {
        fetchBudget(false); // Não mostrar loading durante polling
      }, 5000);

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        console.log("[DEBUG] Current user:", {
          id: data.id,
          role: data.role,
          teamRole: data.teamRole,
          name: data.name,
        });
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
    }
  };

  const fetchBudget = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/orcamentos/${params.id}`);
      if (!response.ok) throw new Error("Erro ao buscar orçamento");
      const data = await response.json();

      console.log("[DEBUG] Budget recebido:", {
        id: data.id,
        status: data.status,
        acceptedBy: data.acceptedBy,
        acceptedAt: data.acceptedAt,
        acceptedByUser: data.acceptedByUser,
        projectId: data.projectId,
        contract: data.contract?.id,
        contractConfirmed: data.contract?.confirmed,
      });

      setBudget(data);

      // Carregar status de confirmação do contrato
      if (data.contract) {
        setContractConfirmed(data.contract.confirmed || false);
      }

      // Se status mudou para down_payment_paid, mostrar botões
      if (data.status === "down_payment_paid") {
        console.log("[DEBUG] Status é down_payment_paid, projectId:", data.projectId);
        
        // Verificar se toast já foi exibido
        const toastId = `payment-confirmed-${params.id}`;
        if (!hasToastBeenShown(toastId)) {
          markToastAsShown(toastId);
          toast({
            title: "Pagamento Confirmado!",
            description: data.projectId
              ? "Projeto criado automaticamente. Clique em 'Ver Projeto' para acessar."
              : "Pagamento confirmado. Inicie o projeto para continuar.",
          });
        }
      }
    } catch (error) {
      if (showLoading) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o orçamento",
          variant: "destructive",
        });
        router.push("/dashboard/orcamentos");
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const fetchActionHistory = async () => {
    try {
      const response = await fetch(`/api/orcamentos/${params.id}`);
      if (!response.ok) return;
      const data = await response.json();

      // Construir histórico baseado nos dados do orçamento
      const history: any[] = [];

      // Data de criação
      history.push({
        id: 'created',
        action: 'Orçamento Criado',
        date: data.createdAt,
        icon: 'file',
        status: 'completed'
      });

      // Status sent
      if (data.status !== 'pending' && data.approvalToken) {
        history.push({
          id: 'sent',
          action: 'Proposta Enviada',
          date: data.updatedAt,
          icon: 'send',
          status: 'completed'
        });
      }

      // Status accepted / user_approved
      if (['accepted', 'user_approved', 'contract_sent', 'contract_signed', 'down_payment_sent', 'down_payment_paid', 'project_in_progress', 'final_payment_sent', 'final_payment_paid', 'completed'].includes(data.status)) {
        history.push({
          id: 'approved',
          action: 'Proposta Aprovada',
          date: data.updatedAt,
          icon: 'check',
          status: 'completed'
        });
      }

      // Contrato criado
      if (data.contract) {
        history.push({
          id: 'contract_created',
          action: 'Contrato Criado',
          date: data.contract.createdAt,
          icon: 'file-signature',
          status: 'completed'
        });
      }

      // Contrato enviado
      if (data.contract?.sentAt) {
        history.push({
          id: 'contract_sent',
          action: 'Contrato Enviado',
          date: data.contract.sentAt,
          icon: 'send',
          status: 'completed'
        });
      }

      // Contrato assinado
      if (data.contract?.signedByClientAt || data.status === 'contract_signed') {
        history.push({
          id: 'contract_signed',
          action: 'Contrato Assinado',
          date: data.contract?.signedByClientAt || data.updatedAt,
          icon: 'signature',
          status: 'completed'
        });
      }

      // Contrato confirmado
      if (data.contract?.confirmed) {
        history.push({
          id: 'contract_confirmed',
          action: 'Contrato Confirmado',
          date: data.contract.updatedAt,
          icon: 'check-circle',
          status: 'completed'
        });
      }

      // Pagamento da entrada enviado
      if (data.status === 'down_payment_sent' || ['down_payment_paid', 'project_in_progress', 'final_payment_sent', 'final_payment_paid', 'completed'].includes(data.status)) {
        const paymentDate = data.contract?.updatedAt || data.updatedAt;
        history.push({
          id: 'payment_sent',
          action: 'Link de Pagamento Enviado',
          date: paymentDate,
          icon: 'dollar',
          status: 'completed'
        });
      }

      // Pagamento da entrada pago
      if (['down_payment_paid', 'project_in_progress', 'final_payment_sent', 'final_payment_paid', 'completed'].includes(data.status)) {
        history.push({
          id: 'down_payment_paid',
          action: 'Entrada Paga',
          date: data.updatedAt,
          icon: 'credit-card',
          status: 'completed'
        });
      }

      // Projeto iniciado
      if (data.projectId || data.status === 'project_in_progress' || data.status === 'completed') {
        history.push({
          id: 'project_started',
          action: 'Projeto Iniciado',
          date: data.startDate || data.updatedAt,
          icon: 'rocket',
          status: data.status === 'completed' ? 'completed' : 'current'
        });
      }

      // Projeto em andamento
      if (data.status === 'project_in_progress') {
        history.push({
          id: 'project_in_progress',
          action: 'Projeto em Andamento',
          date: data.updatedAt,
          icon: 'activity',
          status: 'current'
        });
      }

      // Pagamento final enviado
      if (['final_payment_sent', 'final_payment_paid', 'completed'].includes(data.status)) {
        history.push({
          id: 'final_payment_sent',
          action: 'Cobrança Final Enviada',
          date: data.updatedAt,
          icon: 'send',
          status: 'completed'
        });
      }

      // Pagamento final pago
      if (['final_payment_paid', 'completed'].includes(data.status)) {
        history.push({
          id: 'final_payment_paid',
          action: 'Pagamento Final Pago',
          date: data.updatedAt,
          icon: 'credit-card',
          status: 'completed'
        });
      }

      // Projeto concluído
      if (data.status === 'completed') {
        history.push({
          id: 'completed',
          action: 'Projeto Concluído',
          date: data.updatedAt,
          icon: 'check-circle',
          status: 'completed'
        });
      }

      setActionHistory(history);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSending(true);
      const response = await fetch(`/api/orcamentos/${params.id}/aprovar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail, sendWhatsApp }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Verificar se toast já foi exibido
      const toastId = `proposal-sent-${params.id}`;
      if (!hasToastBeenShown(toastId)) {
        markToastAsShown(toastId);
        toast({
          title: "Proposta enviada!",
          description: "Link de aprovação gerado com sucesso",
        });
      }

      setIsApproveDialogOpen(false);

      // Salvar link para exibição
      if (result.approvalUrl) {
        setApprovalLink(result.approvalUrl);
      }

      // Abrir WhatsApp se solicitado
      if (sendWhatsApp && result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank");
      }

      fetchBudget();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar proposta",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptBudget = async () => {
    try {
      setIsAccepting(true);
      const response = await fetch(`/api/orcamentos/${params.id}/aceitar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: acceptAction,
          reason: acceptAction === "decline" ? declineReason : null,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({
        title: acceptAction === "accept" ? "Orçamento aceito!" : "Orçamento recusado",
        description: result.message,
        variant: acceptAction === "accept" ? "success" : "destructive",
      });

      setIsAcceptDialogOpen(false);
      setDeclineReason("");
      fetchBudget();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const isAcceptedByCurrentUser = () => {
    if (!currentUser || !budget) return false;
    return budget.acceptedBy === currentUser.id;
  };

  const handleEditValue = async () => {
    try {
      const finalValue = parseFloat(editFinalValue.replace(".", "").replace(",", "."));

      if (isNaN(finalValue) || finalValue <= 0) {
        toast({
          title: "Valor inválido",
          description: "Informe um valor válido maior que zero",
          variant: "destructive",
        });
        return;
      }

      const updateData: any = {
        finalValue,
        timeline: editTimeline,
        technologies: JSON.stringify(editTechnologies),
      };

      // Adicionar data de início se fornecida
      if (editStartDate) {
        updateData.startDate = new Date(editStartDate).toISOString();
      }

      const response = await fetch(`/api/orcamentos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Erro ao atualizar orçamento");

      toast({
        title: "Orçamento atualizado!",
        description: "Valor e prazo foram atualizados com sucesso.",
        variant: "success",
      });

      setIsEditValueDialogOpen(false);
      setEditFinalValue("");
      setEditTimeline("");
      setEditStartDate("");
      setFormattedBudget("");
      fetchBudget();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar orçamento",
        variant: "destructive",
      });
    }
  };

  // Formatar valor para moeda brasileira (R$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Converter string formatada para número
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/\D/g, "")) / 100;
  };

  // Formatar input de moeda
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseCurrency(value);
    setFormattedBudget(formatCurrency(numericValue));
    setEditFinalValue(numericValue.toString());
  };

  const handleGeneratePaymentLink = async () => {
    if (!contractConfirmed) {
      toast({
        title: "Atenção",
        description: "Você precisa visualizar e confirmar o contrato antes de enviar o pagamento",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch(`/api/orcamentos/${params.id}/pagamento`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao gerar link");
      }

      // Salvar dados do pagamento
      if (result.payment) {
        setPaymentLinkData(result.payment);
      }

      // Salvar link e abrir dialog
      if (result.paymentLink) {
        setPaymentLink(result.paymentLink);
        setIsPaymentLinkDialogOpen(true);
        
        // Verificar se toast já foi exibido
        const toastId = `payment-link-generated-${params.id}`;
        if (!hasToastBeenShown(toastId)) {
          markToastAsShown(toastId);
          toast({
            title: "Link gerado!",
            description: "Link de pagamento da entrada (25%) criado com sucesso",
          });
        }
      } else {
        const toastId = `payment-already-done-${params.id}`;
        if (!hasToastBeenShown(toastId)) {
          markToastAsShown(toastId);
          toast({
            title: "Pagamento já realizado",
            description: "O cliente já realizou o pagamento da entrada ",
          });
        }
      }

      fetchBudget();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar link de pagamento",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmContract = async () => {
    try {
      setIsConfirmingContract(true);

      const response = await fetch(`/api/orcamentos/${params.id}/contrato/confirmar`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao confirmar contrato");
      }

      toast({
        title: "Contrato Confirmado!",
        description: "Contrato confirmado com sucesso. Agora você pode gerar o link de pagamento.",
      });

      setContractConfirmed(true);
      fetchBudget();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao confirmar contrato",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingContract(false);
    }
  };

  const handleCopyPaymentLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      toast({ title: "Copiado!", description: "Link copiado para área de transferência" });
    }
  };

  const handleSendPaymentEmail = () => {
    if (paymentLink && budget) {
      const subject = `Pagamento da Entrada - ${budget.projectType}`;
      const body = `Olá ${budget.clientName},\n\nSegue o link para pagamento da entrada do projeto:\n\n${paymentLink}\n\nValor: R$ ${paymentLinkData?.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nPrazo: 5 dias úteis\n\nAtenciosamente,\nEquipe`;

      window.open(`mailto:${budget.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");

      toast({
        title: "E-mail aberto!",
        description: "Preencha e envie o e-mail para o cliente.",
      });
    }
  };

  const handleSendPaymentWhatsApp = () => {
    if (paymentLink && budget) {
      const phoneDigits = budget.clientPhone?.replace(/\D/g, "") || "";
      const message = `Olá ${budget.clientName}! Segue o link para pagamento da entrada do projeto:\n\n${paymentLink}\n\nValor: R$ ${paymentLinkData?.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nPrazo: 5 dias úteis\n\nAtenciosamente,\nEquipe`;

      window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, "_blank");

      toast({
        title: "WhatsApp aberto!",
        description: "Envie a mensagem para o cliente.",
      });
    }
  };

  const handleStartProject = async () => {
    try {
      setIsSending(true);

      // Chamar API para iniciar projeto
      const response = await fetch(`/api/orcamentos/${params.id}/iniciar-projeto`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao iniciar projeto");
      }

      toast({
        title: "Projeto Iniciado!",
        description: "Projeto criado e vinculado ao orçamento com sucesso",
      });

      // Atualizar orçamento para buscar o projectId
      fetchBudget();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao iniciar projeto",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (!changeReason) {
        toast({
          title: "Campo obrigatório",
          description: "Selecione um motivo",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/orcamentos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeReason, changeDescription }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      toast({ title: "Alterado!", description: "Orçamento atualizado" });
      setIsEditDialogOpen(false);
      setChangeReason("");
      setChangeDescription("");
      fetchBudget();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao alterar", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      if (!deletionReason) {
        toast({ title: "Campo obrigatório", description: "Selecione um motivo", variant: "destructive" });
        return;
      }

      const response = await fetch(`/api/orcamentos/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletionReason, deletionDescription }),
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      toast({ title: "Excluído!", description: "Orçamento excluído" });
      setIsDeleteDialogOpen(false);
      router.push("/dashboard/orcamentos");
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao excluir", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: message });
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

  if (!budget) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Orçamento não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/orcamentos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{budget.clientName}</h1>
                <Badge className={statusColors[budget.status]}>{statusLabels[budget.status]}</Badge>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">


              {/* Status: pending - só aparece se aceito pelo usuário atual */}
              {budget.status === "pending" && isAcceptedByCurrentUser() && (
                <>
                  {budget.startDate && Array.isArray(budget.technologies) && budget.technologies.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={() => setIsApproveDialogOpen(true)}>
                      <Send className="h-4 w-4 mr-1" />Enviar Proposta
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                      <Info className="h-3.5 w-3.5" />
                      <span>Configure a <strong>Data de Início</strong> e <strong>Tecnologias</strong> para enviar</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const budgetValue = budget.finalValue || budget.estimatedMin || 0;
                      setEditFinalValue(budgetValue.toString());
                      setEditTimeline(budget.timeline || "");
                      if (budget.startDate) {
                        const d = new Date(budget.startDate);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        setEditStartDate(`${year}-${month}-${day}`);
                      } else {
                        setEditStartDate("");
                      }
                      setIsEditValueDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />Alterar Valor/Prazo
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />Excluir
                  </Button>
                </>
              )}

              {/* Status: sent - só aparece se aceito pelo usuário atual */}
              {budget.status === "sent" && isAcceptedByCurrentUser() && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit2 className="h-4 w-4 mr-1" />Alterar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />Excluir
                  </Button>
                </>
              )}

              {/* Status: accepted / user_approved - só aparece se aceito pelo usuário atual */}
              {(budget.status === "accepted" || budget.status === "user_approved") && isAcceptedByCurrentUser() && !budget.contract && (
                <Button variant="default" size="sm" onClick={() => router.push(`/dashboard/orcamentos/${params.id}/contrato`)}>
                  <FileSignature className="h-4 w-4 mr-1" />Criar Contrato
                </Button>
              )}

              {/* Status: contract_signed - só aparece se aceito pelo usuário atual */}
              {budget.status === "contract_signed" && isAcceptedByCurrentUser() && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsViewContractDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-1" />
                    {budget.contract?.confirmed ? 'Ver Contrato Confirmado ✓' : 'Ver Contrato Assinado'}
                  </Button>
                  {budget.contract?.confirmed ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setIsViewContractDialogOpen(false);
                        handleGeneratePaymentLink();
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Enviar Link Pagamento (25%)
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsViewContractDialogOpen(true)}
                        disabled={contractConfirmed}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {contractConfirmed ? 'Pronto para Confirmar' : 'Confirmar Contrato'}
                      </Button>
                      <p className="text-xs text-amber-600 w-full">
                        ⚠️ Visualize e confirme o contrato antes de enviar o pagamento
                      </p>
                    </>
                  )}
                </>
              )}

              {/* Status: down_payment_paid - Só aparece se aceito pelo usuário atual */}
              {budget.status === "down_payment_paid" && isAcceptedByCurrentUser() && (
                <>
                  {budget.projectId ? (
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/projetos/${budget.projectId}`)}>
                      <FileText className="h-4 w-4 mr-1" />Ver Projeto
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleStartProject}
                    >
                      <Rocket className="h-4 w-4 mr-1" />
                      Iniciar Projeto
                    </Button>
                  )}
                </>
              )}

              {/* Status: completed - Só aparece se aceito pelo usuário atual */}
              {budget.status === "completed" && isAcceptedByCurrentUser() && budget.projectId && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/projetos/${budget.projectId}`)}>
                  <FileText className="h-4 w-4 mr-1" />Ver Projeto Concluído
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Timeline de Progresso do Orçamento */}
        <Card className="mb-8 border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6" />
                <div>
                  <CardTitle className="text-lg">Andamento do Orçamento</CardTitle>
                  <CardDescription className="text-indigo-100">
                    {statusLabels[budget.status]} • {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0">
                {actionHistory.filter(a => a.status === 'completed').length} de {actionHistory.length} etapas concluídas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative">
              {/* Linha de progresso horizontal */}
              <div className="flex items-center justify-between relative z-10">
                {actionHistory.map((item, index) => {
                  const isCompleted = item.status === 'completed';
                  const isCurrent = item.status === 'current';
                  const isLast = index === actionHistory.length - 1;

                  return (
                    <div key={item.id} className="flex flex-col items-center flex-1">
                      {/* Ícone/Círculo */}
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                          ? 'bg-indigo-500 border-indigo-500 text-white animate-pulse'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Activity className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}

                        {/* Tooltip com detalhes */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap z-20 pointer-events-none">
                          {item.action}
                          {item.date && (
                            <div className="text-[10px] text-slate-300 mt-0.5">
                              {new Date(item.date).toLocaleDateString("pt-BR")} às {new Date(item.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                      </div>

                      {/* Linha conectora */}
                      {!isLast && (
                        <div className={`absolute top-5 left-[${(index + 1) * (100 / actionHistory.length) - (100 / actionHistory.length / 2)}%] w-[${100 / actionHistory.length - 5}%] h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'
                          }`} style={{
                            width: `calc(${100 / actionHistory.length}% - 40px)`,
                            left: `calc(${index * (100 / actionHistory.length)}% + 20px)`
                          }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Labels das etapas */}
              <div className="flex justify-between mt-4">
                {actionHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex-1 text-center"
                    style={{ maxWidth: `${100 / actionHistory.length}%` }}
                  >
                    <p className={`text-[10px] font-medium truncate px-1 ${item.status === 'completed'
                      ? 'text-green-600'
                      : item.status === 'current'
                        ? 'text-indigo-600 font-semibold'
                        : 'text-slate-400'
                      }`}>
                      {item.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Valor Final</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">
                    {budget.finalValue ? `R$ ${budget.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Entrada (25%)</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">
                    {budget.finalValue ? `R$ ${(budget.finalValue * 0.25).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Tipo de Projeto</p>
                  <p className="text-lg font-bold mt-1 text-purple-600 capitalize">{budget.projectType}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Prazo de Entrega</p>
                  <p className="text-lg font-bold mt-1 text-amber-600 capitalize">{budget.timeline}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Orçamento */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Resumo Financeiro
            </CardTitle>
            <CardDescription>Visão geral dos valores e condições do orçamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Faixa de Valor Estimado</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    {budget.estimatedMin ? `R$ ${budget.estimatedMin.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </span>
                  <span className="text-muted-foreground">a</span>
                  <span className="text-lg font-semibold">
                    {budget.estimatedMax ? `R$ ${budget.estimatedMax.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Valor Final Negociado</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    {budget.finalValue ? `R$ ${budget.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "A negociar"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Data de Início</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span className="text-lg font-semibold">
                    {budget.startDate ? new Date(budget.startDate).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Condições de Pagamento</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-3 w-3 text-blue-600" />
                    <span>Entrada: <strong>25%</strong> ({budget.finalValue ? `R$ ${(budget.finalValue * 0.25).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-3 w-3 text-purple-600" />
                    <span>Final: <strong>75%</strong> ({budget.finalValue ? `R$ ${(budget.finalValue * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{budget.clientName}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(budget.clientName, "Nome copiado!")}><Copy className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{budget.clientEmail}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(budget.clientEmail, "Email copiado!")}><Copy className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  {budget.clientPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{budget.clientPhone}</p>
                    </div>
                  )}
                  {budget.company && (
                    <div>
                      <p className="text-sm text-muted-foreground">Empresa</p>
                      <p className="font-medium">{budget.company}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />Detalhes do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <div className="flex items-center gap-2 mt-1">
                      {budget.projectType === 'web' && <Monitor className="h-4 w-4 text-purple-600" />}
                      {budget.projectType === 'mobile' && <Smartphone className="h-4 w-4 text-purple-600" />}
                      {budget.projectType === 'ecommerce' && <ShoppingCart className="h-4 w-4 text-purple-600" />}
                      {budget.projectType === 'landing' && <Globe className="h-4 w-4 text-purple-600" />}
                      {budget.projectType === 'dashboard' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                      {budget.projectType === 'software' && <Code className="h-4 w-4 text-purple-600" />}
                      <p className="font-medium capitalize">{budget.projectType}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Complexidade</p>
                    <div className="flex items-center gap-2 mt-1">
                      {budget.complexity === 'simple' && <Palette className="h-4 w-4 text-green-600" />}
                      {budget.complexity === 'medium' && <Palette className="h-4 w-4 text-amber-600" />}
                      {budget.complexity === 'complex' && <Palette className="h-4 w-4 text-red-600" />}
                      <p className="font-medium capitalize">{budget.complexity}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prazo</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="font-medium capitalize">{budget.timeline}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Páginas</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <p className="font-medium">{budget.pages}</p>
                    </div>
                  </div>
                </div>

                {/* Funcionalidades */}
                {budget.features && Array.isArray(budget.features) && budget.features.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Funcionalidades Selecionadas ({budget.features.length})
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {budget.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Integrações */}
                {budget.integrations && Array.isArray(budget.integrations) && budget.integrations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Integrações Selecionadas ({budget.integrations.length})
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {budget.integrations.map((integration: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm capitalize">{integration.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Tecnologias */}
                {(budget.technologies || budget.contract?.metadata?.project?.technologies) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-3 flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Tecnologias do Projeto ({(Array.isArray(budget.technologies) ? budget.technologies.length : 0) || (Array.isArray(budget.contract?.metadata?.project?.technologies) ? budget.contract.metadata.project.technologies.length : 0)})
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 font-sans">
                        {(Array.isArray(budget.technologies) ? budget.technologies : (budget.contract?.metadata?.project?.technologies || [])).map((tech: string, index: number) => (
                          <Badge key={index} variant="secondary" className="pl-3 pr-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Descrição */}
                {budget.details && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Descrição do Projeto</p>
                      <div className="p-4 bg-muted rounded-md border">
                        <p className="text-sm whitespace-pre-wrap">{budget.details}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-700 font-medium">Data de Início do Projeto</p>
                    <p className="text-base font-semibold text-green-900">{budget.startDate ? new Date(budget.startDate).toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 font-medium">Prazo de Entrega</p>
                    <p className="text-base font-semibold text-amber-900">{budget.timeline ? getTimelineInWeeks(budget.timeline) : "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Data Prevista de Entrega</p>
                    <p className="text-base font-semibold text-blue-900">{getExpectedDeliveryDate()}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Criado em</p>
                      <p className="text-sm font-medium">{new Date(budget.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Edit2 className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Atualizado em</p>
                      <p className="text-sm font-medium">{new Date(budget.updatedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Enviar Email - Só aparece se aceito pelo usuário atual */}
                {isAcceptedByCurrentUser() && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`mailto:${budget.clientEmail}`, "_blank")}>
                    <Mail className="h-4 w-4 mr-2" />Enviar Email
                  </Button>
                )}
                {/* WhatsApp - Só aparece se aceito pelo usuário atual */}
                {isAcceptedByCurrentUser() && budget.clientPhone && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`https://wa.me/55${budget.clientPhone?.replace(/\D/g, "")}`, "_blank")}>
                    <Phone className="h-4 w-4 mr-2" />WhatsApp
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card de Histórico de Ações e Ações Rápidas */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Histórico de Ações */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <History className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Histórico de Ações</CardTitle>
                  <CardDescription>Todas as etapas percorridas até agora</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {actionHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma ação registrada</p>
                  </div>
                ) : (
                  actionHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${item.status === 'current'
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-slate-50 border-slate-100'
                        }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-indigo-100 text-indigo-600'
                        }`}>
                        {item.icon === 'file' && <FileText className="h-4 w-4" />}
                        {item.icon === 'send' && <Send className="h-4 w-4" />}
                        {item.icon === 'check' && <CheckCircle className="h-4 w-4" />}
                        {item.icon === 'file-signature' && <FileSignature className="h-4 w-4" />}
                        {item.icon === 'signature' && <Edit2 className="h-4 w-4" />}
                        {item.icon === 'check-circle' && <CheckCircle2 className="h-4 w-4" />}
                        {item.icon === 'dollar' && <DollarSign className="h-4 w-4" />}
                        {item.icon === 'credit-card' && <CreditCard className="h-4 w-4" />}
                        {item.icon === 'rocket' && <Rocket className="h-4 w-4" />}
                        {item.icon === 'activity' && <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.action}</p>
                        <p className="text-xs text-slate-500">
                          {item.date ? new Date(item.date).toLocaleDateString("pt-BR", {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '—'}
                        </p>
                      </div>
                      {item.status === 'current' && (
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                          Atual
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas (Reutilizar) */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <RefreshCcw className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  <CardDescription>Reutilize ações já realizadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Iniciar Orçamento (Aceitar/Recusar) - Apenas ADMIN ou Gerente de Projetos, e apenas se ninguém aceitou ainda */}
                {budget?.status === "pending" && !budget.acceptedBy && currentUser && (
                  currentUser.role === "ADMIN" ||
                  (currentUser.role === "TEAM_MEMBER" && currentUser.teamRole === "Gerente de Projetos")
                ) && (
                    <>
                      <Button
                        variant="default"
                        className="w-full justify-start gap-2 h-auto py-3 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setAcceptAction("accept");
                          setIsAcceptDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Aceitar Orçamento</p>
                          <p className="text-xs text-slate-50">Assumir responsabilidade pelo orçamento</p>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto py-3 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setAcceptAction("decline");
                          setIsAcceptDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4 text-red-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-red-600">Recusar Orçamento</p>
                          <p className="text-xs text-slate-500">Recusar responsabilidade</p>
                        </div>
                      </Button>
                    </>
                  )}

                {/* Status para usuários sem permissão */}
                {budget?.status === "pending" && !budget.acceptedBy && currentUser && !(
                  currentUser.role === "ADMIN" ||
                  (currentUser.role === "TEAM_MEMBER" && currentUser.teamRole === "Gerente de Projetos")
                ) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⏳ Aguardando aceite de um Gerente de Projetos ou Admin
                      </p>
                    </div>
                  )}

                {/* Mostrar quem aceitou */}
                {budget.acceptedBy && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Aceito por {budget.acceptedByUser?.name || "Membro da equipe"}
                    </p>
                    {budget.acceptedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        em {new Date(budget.acceptedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}

                {/* Enviar Proposta Novamente - Só aparece se aceito pelo usuário atual */}
                {budget.approvalToken && isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => {
                      const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orcamento/aprovar/${budget.approvalToken}`;
                      copyToClipboard(approvalUrl, "Link de aprovação copiado!");
                    }}
                  >
                    <Send className="h-4 w-4 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Copiar Link de Aprovação</p>
                      <p className="text-xs text-slate-500">Compartilhe o link de aprovação com o cliente</p>
                    </div>
                  </Button>
                )}

                {/* Reenviar Contrato - Só aparece se aceito pelo usuário atual */}
                {budget.contract && isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => router.push(`/dashboard/orcamentos/${params.id}/contrato`)}
                  >
                    <FileSignature className="h-4 w-4 text-indigo-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Gerenciar Contrato</p>
                      <p className="text-xs text-slate-500">Visualizar, editar ou reenviar contrato</p>
                    </div>
                  </Button>
                )}

                {/* Enviar Link de Pagamento - Só aparece se aceito pelo usuário atual */}
                {budget.contract?.confirmed && budget.status !== 'down_payment_paid' && isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={handleGeneratePaymentLink}
                  >
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Enviar Cobrança (25%)</p>
                      <p className="text-xs text-slate-500">Cobrar entrada do projeto</p>
                    </div>
                  </Button>
                )}

                {/* Iniciar Projeto - Só aparece se aceito pelo usuário atual */}
                {budget.status === 'down_payment_paid' && !budget.projectId && isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={handleStartProject}
                  >
                    <Rocket className="h-4 w-4 text-purple-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Iniciar Projeto</p>
                      <p className="text-xs text-slate-500">Criar projeto e começar produção</p>
                    </div>
                  </Button>
                )}

                {/* Ver Projeto - Só aparece se aceito pelo usuário atual */}
                {budget.projectId && isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => router.push(`/dashboard/projetos/${budget.projectId}`)}
                  >
                    <FileText className="h-4 w-4 text-cyan-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Acessar Projeto</p>
                      <p className="text-xs text-slate-500">Ver detalhes e andamento do projeto</p>
                    </div>
                  </Button>
                )}

                {/* Editar Valor/Prazo - Só aparece se aceito pelo usuário atual */}
                {budget.status === "pending" && isAcceptedByCurrentUser() && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                    onClick={() => {
                      const budgetValue = budget.finalValue || 0;
                      setEditFinalValue(budgetValue.toString());
                      setFormattedBudget(formatCurrency(budgetValue));
                      setEditTimeline(budget.timeline || "");
                      setEditTechnologies(Array.isArray(budget.technologies) ? budget.technologies : []);
                      if (budget.startDate) {
                        const d = new Date(budget.startDate);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        setEditStartDate(`${year}-${month}-${day}`);
                      } else {
                        setEditStartDate("");
                      }
                      setIsEditValueDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-orange-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Editar Valor/Prazo</p>
                      <p className="text-xs text-slate-500">Atualizar valor final ou prazo de entrega</p>
                    </div>
                  </Button>
                )}

                {/* Duplicar Orçamento */}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-3"
                  onClick={() => {
                    router.push(`/orcamento?duplicate=${budget.id}`);
                  }}
                >
                  <Copy className="h-4 w-4 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Duplicar Orçamento</p>
                    <p className="text-xs text-slate-500">Criar novo orçamento baseado neste</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Proposta</DialogTitle>
              <DialogDescription>Envie a proposta com link de aprovação</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Como enviar?</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                    <span>E-mail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sendWhatsApp} onChange={(e) => setSendWhatsApp(e.target.checked)} />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleApprove} disabled={isSending || (!sendEmail && !sendWhatsApp)}>
                {isSending ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Orçamento</DialogTitle>
              <DialogDescription>Justifique a alteração</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Motivo (obrigatório)</Label>
                <Select value={changeReason} onValueChange={setChangeReason}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {changeReasons.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleEdit} disabled={!changeReason}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Valor/Prazo */}
        <Dialog open={isEditValueDialogOpen} onOpenChange={setIsEditValueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                Alterar Valor e Prazo
              </DialogTitle>
              <DialogDescription>
                Edite o valor final, prazo de entrega e data de início do orçamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="finalValue">Valor Final (R$) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    id="finalValue"
                    type="text"
                    placeholder="0,00"
                    className="pl-10"
                    value={formattedBudget}
                    onChange={handleBudgetChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor mínimo: R$ {budget.estimatedMin?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Prazo de Entrega *</Label>
                <Select value={editTimeline} onValueChange={setEditTimeline}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgente (1-2 semanas)</SelectItem>
                    <SelectItem value="normal">Normal (3-4 semanas)</SelectItem>
                    <SelectItem value="flexible">Flexível (5+ semanas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início do Projeto</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Data prevista para início do projeto (opcional)
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Tecnologias do Projeto</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: React, Node.js"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (techInput.trim()) {
                          setEditTechnologies([...editTechnologies, techInput.trim()]);
                          setTechInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => {
                      if (techInput.trim()) {
                        setEditTechnologies([...editTechnologies, techInput.trim()]);
                        setTechInput("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  {editTechnologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                      {tech}
                      <button
                        onClick={() => setEditTechnologies(editTechnologies.filter((_, i) => i !== index))}
                        className="rounded-full hover:bg-muted p-0.5"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2 mt-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Sugestões Rápidas</Label>
                  <div className="flex flex-wrap gap-1">
                    {["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Stripe", "Auth.js", "Vercel"].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          if (!editTechnologies.includes(suggestion)) {
                            setEditTechnologies([...editTechnologies, suggestion]);
                          }
                        }}
                        className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Condições de Pagamento</p>
                <div className="mt-2 space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Entrada (25%):</span>
                    <span className="font-medium">
                      {editFinalValue ? `R$ ${(parseFloat(editFinalValue) * 0.25).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final (75%):</span>
                    <span className="font-medium">
                      {editFinalValue ? `R$ ${(parseFloat(editFinalValue) * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditValueDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleEditValue} disabled={!editFinalValue || !editTimeline}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Orçamento</DialogTitle>
              <DialogDescription>Justifique a exclusão</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">Esta ação não pode ser desfeita.</p>
              </div>
              <div className="space-y-2">
                <Label>Motivo (obrigatório)</Label>
                <Select value={deletionReason} onValueChange={setDeletionReason}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {changeReasons.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea value={deletionDescription} onChange={(e) => setDeletionDescription(e.target.value)} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={!deletionReason}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Link de Aprovação */}
        <Dialog open={!!approvalLink} onOpenChange={() => setApprovalLink(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Link de Aprovação Gerado!
              </DialogTitle>
              <DialogDescription>
                Envie este link para o cliente aprovar a proposta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md break-all">
                <p className="text-sm font-mono">{approvalLink}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (approvalLink) {
                      navigator.clipboard.writeText(approvalLink);
                      toast({ title: "Copiado!", description: "Link copiado para área de transferência" });
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (approvalLink) {
                      window.open(approvalLink, "_blank");
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Link
                </Button>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Como usar:</strong> Copie o link e envie para o cliente por e-mail ou WhatsApp.
                  Ao clicar, o cliente poderá ACEITAR ou NEGAR a proposta.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setApprovalLink(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Visualizar Contrato Assinado */}
        <Dialog open={isViewContractDialogOpen} onOpenChange={setIsViewContractDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrato Assinado - {budget.clientName}
              </DialogTitle>
              <DialogDescription>
                Visualize o contrato assinado pelo cliente e confirme para prosseguir
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {budget.contract ? (
                <>
                  {/* Informações do Contrato */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Informações do Contrato</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-700">Status:</p>
                        <p className="font-medium text-blue-900">
                          {budget.contract.status === 'signed_by_client' ? '✅ Assinado pelo Cliente' : budget.contract.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700">Assinado em:</p>
                        <p className="font-medium text-blue-900">
                          {budget.contract.signedByClientAt ? new Date(budget.contract.signedByClientAt).toLocaleDateString('pt-BR') : 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700">Nome na Assinatura:</p>
                        <p className="font-medium text-blue-900">
                          {budget.contract.metadata?.signatureName || budget.clientName}
                        </p>
                      </div>
                      {budget.contract.documentName && (
                        <div>
                          <p className="text-blue-700">Arquivo:</p>
                          <p className="font-medium text-blue-900">{budget.contract.documentName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download do Contrato */}
                  {budget.contract.documentUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">📄 Documento Assinado</h4>
                      <p className="text-sm text-green-700 mb-3">
                        O cliente fez upload do contrato assinado. Você pode visualizar ou baixar o documento.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(budget.contract.documentUrl, '_blank')}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Visualizar/Baixar Contrato Assinado (PDF)
                      </Button>
                    </div>
                  )}

                  {/* Conteúdo do Contrato */}
                  {budget.contract.content && (
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold mb-2">📋 Conteúdo do Contrato</h4>
                      <pre className="text-sm whitespace-pre-wrap font-sans bg-white p-4 rounded border max-h-96 overflow-y-auto">
                        {budget.contract.content}
                      </pre>
                    </div>
                  )}

                  {/* Confirmação */}
                  {budget.contract.confirmed ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Contrato Confirmado ✓</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Contrato confirmado em {budget.contract.signedAt ? new Date(budget.contract.signedAt).toLocaleDateString("pt-BR") : "data não informada"}.
                        Agora você pode gerar o link de pagamento da entrada.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">⚠️ Confirmação</h4>
                        <p className="text-sm text-amber-700 mb-3">
                          Ao confirmar, você declara que revisou o contrato assinado e está tudo correto para prosseguir com o pagamento.
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            id="confirm-contract"
                            checked={contractConfirmed}
                            onChange={(e) => setContractConfirmed(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label htmlFor="confirm-contract" className="text-sm font-medium text-amber-800 cursor-pointer">
                            Confirmo que revisei o contrato e está tudo correto
                          </label>
                        </div>
                        <Button
                          onClick={handleConfirmContract}
                          disabled={!contractConfirmed || isConfirmingContract}
                          size="sm"
                          className="w-full"
                        >
                          {isConfirmingContract ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                              Confirmando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirmar Contrato
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum contrato encontrado para este orçamento.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewContractDialogOpen(false)}>Fechar</Button>
              {budget.contract && !budget.contract.confirmed && (
                <Button
                  onClick={handleConfirmContract}
                  disabled={!contractConfirmed || isConfirmingContract}
                >
                  {isConfirmingContract ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar Contrato
                    </>
                  )}
                </Button>
              )}
              {budget.contract && budget.contract.confirmed && (
                <Button
                  onClick={() => {
                    setIsViewContractDialogOpen(false);
                    handleGeneratePaymentLink();
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Gerar Link de Pagamento
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Link de Pagamento */}
        <Dialog open={isPaymentLinkDialogOpen} onOpenChange={setIsPaymentLinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Link de Pagamento da Entrada (25%)
              </DialogTitle>
              <DialogDescription>
                Envie o link de pagamento para o cliente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Informações do Pagamento */}
              {paymentLinkData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-700">Valor da Entrada (25%):</span>
                    <span className="text-lg font-bold text-green-800">
                      R$ {paymentLinkData.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    Prazo: 5 dias úteis
                  </p>
                </div>
              )}

              {/* Métodos de Pagamento Disponíveis */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-indigo-900 mb-3">Métodos de Pagamento Disponíveis:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CreditCard className="h-3.5 w-3.5 text-indigo-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-900">Cartão de Crédito</p>
                      <p className="text-xs text-indigo-700">Parcelamento em até 12x • Todas as bandeiras</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-60">
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <QrCode className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">PIX (Em breve)</p>
                      <p className="text-xs text-slate-400">Aprovação imediata • Disponível em breve</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link de Pagamento */}
              {paymentLink && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-md p-3 break-all">
                    <p className="text-xs font-mono text-muted-foreground">
                      {paymentLink}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleCopyPaymentLink} variant="outline" className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button onClick={() => window.open(paymentLink, "_blank")} variant="outline" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Link
                    </Button>
                  </div>
                </div>
              )}

              {/* Enviar por E-mail e WhatsApp */}
              <div className="space-y-2">
                <Label>Enviar para o Cliente:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleSendPaymentEmail} variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    E-mail
                  </Button>
                  {budget.clientPhone && (
                    <Button onClick={handleSendPaymentWhatsApp} variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>

              {/* Instruções */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Como usar:</strong> Copie o link e envie para o cliente por e-mail ou WhatsApp.
                  O cliente poderá pagar com Cartão de Crédito em até 12x.
                  Após o pagamento, o status será atualizado automaticamente.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsPaymentLinkDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Aceitar/Recusar Orçamento */}
        <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {acceptAction === "accept" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Aceitar Orçamento
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-600" />
                    Recusar Orçamento
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {acceptAction === "accept"
                  ? "Ao aceitar este orçamento, você assume a responsabilidade de gerenciá-lo até a conclusão."
                  : "Ao recusar, o orçamento permanecerá pendente e poderá ser aceito por outro membro da equipe."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {acceptAction === "decline" && (
                <div className="space-y-2">
                  <Label>Motivo da recusa (opcional)</Label>
                  <Textarea
                    placeholder="Informe o motivo da recusa..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {acceptAction === "accept" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Você será o responsável por este orçamento
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Somente você poderá alterar valor, prazo e outras configurações
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAcceptDialogOpen(false);
                  setDeclineReason("");
                }}
                disabled={isAccepting}
              >
                Cancelar
              </Button>
              <Button
                variant={acceptAction === "accept" ? "default" : "destructive"}
                onClick={handleAcceptBudget}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    {acceptAction === "accept" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aceitar
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Recusar
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
