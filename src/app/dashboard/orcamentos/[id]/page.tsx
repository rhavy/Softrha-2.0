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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
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
  changeReason?: string;
  changeDescription?: string;
  deletionReason?: string;
  deletionDescription?: string;
  approvalToken?: string | null;
  contract?: any;
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

  // Dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

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

  useEffect(() => {
    if (params.id) {
      fetchBudget();

      // Polling só é necessário quando status indica aguardando pagamento
      // Intervalo aumentado para 10s para reduzir requisições desnecessárias
      const intervalId = setInterval(() => {
        if (budget && (budget.status === "down_payment_sent" || budget.status === "contract_signed")) {
          fetchBudget(false); // Não mostrar loading durante polling
        }
      }, 5000); // Atualiza a cada 10 segundos

      return () => clearInterval(intervalId);
    }
  }, [params.id, budget?.status]);

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
        toast({
          title: "Pagamento Confirmado!",
          description: data.projectId
            ? "Projeto criado automaticamente. Clique em 'Ver Projeto' para acessar."
            : "Pagamento confirmado. Inicie o projeto para continuar.",
        });
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

      toast({
        title: "Proposta enviada!",
        description: "Link de aprovação gerado com sucesso",
      });

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
        toast({
          title: "Link gerado!",
          description: "Link de pagamento da entrada (25%) criado com sucesso",
        });
      } else {
        toast({
          title: "Pagamento já realizado",
          description: "O cliente já realizou o pagamento da entrada ",
        });
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
              {/* Status: pending */}
              {budget.status === "pending" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsApproveDialogOpen(true)}>
                    <Send className="h-4 w-4 mr-1" />Enviar Proposta
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit2 className="h-4 w-4 mr-1" />Alterar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />Excluir
                  </Button>
                </>
              )}

              {/* Status: sent */}
              {budget.status === "sent" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit2 className="h-4 w-4 mr-1" />Alterar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />Excluir
                  </Button>
                </>
              )}

              {/* Status: accepted / user_approved */}
              {(budget.status === "accepted" || budget.status === "user_approved") && !budget.contract && (
                <Button variant="default" size="sm" onClick={() => router.push(`/dashboard/orcamentos/${params.id}/contrato`)}>
                  <FileSignature className="h-4 w-4 mr-1" />Criar Contrato
                </Button>
              )}

              {/* Status: contract_signed */}
              {budget.status === "contract_signed" && (
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

              {/* Status: down_payment_paid */}
              {budget.status === "down_payment_paid" && (
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

              {/* Status: completed */}
              {budget.status === "completed" && budget.projectId && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/projetos/${budget.projectId}`)}>
                  <FileText className="h-4 w-4 mr-1" />Ver Projeto Concluído
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Mínimo</p>
                  <p className="text-2xl font-bold text-primary">R$ {budget.estimatedMin?.toLocaleString("pt-BR")}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Máximo</p>
                  <p className="text-2xl font-bold text-primary">R$ {budget.estimatedMax?.toLocaleString("pt-BR")}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="text-lg font-semibold">{budget.projectType}</p>
                </div>
                <FileText className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prazo</p>
                  <p className="text-lg font-semibold capitalize">{budget.timeline}</p>
                </div>
                <Clock className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações */}
        <div className="grid gap-6 lg:grid-cols-3">
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{budget.projectType}</p>
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
                    <p className="text-sm text-muted-foreground">Páginas</p>
                    <p className="font-medium">{budget.pages}</p>
                  </div>
                </div>
                {budget.details && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                      <div className="p-4 bg-muted rounded-md">
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
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">{new Date(budget.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atualizado em</p>
                  <p className="font-medium">{new Date(budget.updatedAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`mailto:${budget.clientEmail}`, "_blank")}>
                  <Mail className="h-4 w-4 mr-2" />Enviar Email
                </Button>
                {budget.clientPhone && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`https://wa.me/55${budget.clientPhone?.replace(/\D/g, "")}`, "_blank")}>
                    <Phone className="h-4 w-4 mr-2" />WhatsApp
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
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
                  Após o pagamento, o status será atualizado automaticamente.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsPaymentLinkDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
