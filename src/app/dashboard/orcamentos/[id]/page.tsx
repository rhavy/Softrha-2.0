"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Mail,
  Phone,
  Building,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Send,
  FileText,
  Copy,
  ExternalLink,
  Download,
  MessageSquare,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
};

const projectTypeLabels: Record<string, string> = {
  web: "Site Web",
  mobile: "App Mobile",
  software: "Software",
  landing: "Landing Page",
  ecommerce: "E-commerce",
  dashboard: "Dashboard",
};

const featureLabels: Record<string, string> = {
  responsive: "Design Responsivo",
  seo: "Otimização SEO",
  analytics: "Google Analytics",
  blog: "Blog Integrado",
  gallery: "Galeria de Fotos",
  contact_form: "Formulário de Contato",
  chat: "Chat Online",
  newsletter: "Newsletter",
  portfolio: "Portfólio",
  testimonials: "Depoimentos",
};

const integrationLabels: Record<string, string> = {
  google_maps: "Google Maps",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  payment_gateway: "Gateway de Pagamento",
  shipping: "Cálculo de Frete",
  crm: "CRM",
  email_marketing: "Email Marketing",
};

export default function OrcamentoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Função para parsear JSON string se necessário
  const parseJsonField = (field: string | any[]): any[] => {
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  const featuresList = budget ? parseJsonField(budget.features) : [];
  const integrationsList = budget ? parseJsonField(budget.integrations) : [];

  useEffect(() => {
    if (params.id) {
      fetchBudget();
    }
  }, [params.id]);

  const fetchBudget = async () => {
    try {
      const response = await fetch(`/api/orcamentos/${params.id}`);
      if (!response.ok) throw new Error("Erro ao buscar orçamento");
      const data = await response.json();
      setBudget(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o orçamento",
        variant: "destructive",
      });
      router.push("/dashboard/orcamentos");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/orcamentos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      setBudget((prev) => (prev ? { ...prev, status: newStatus } : null));

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

  const deleteBudget = async () => {
    try {
      const response = await fetch(`/api/orcamentos/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir orçamento");

      toast({
        title: "Excluído!",
        description: "O orçamento foi excluído com sucesso.",
      });

      router.push("/dashboard/orcamentos");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const sendEmail = async () => {
    setIsSending(true);
    try {
      // Aqui você implementaria o envio real de email
      // Por enquanto, apenas simulamos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Email enviado!",
        description: "O email foi enviado para o cliente.",
      });

      // Atualizar status para "sent"
      await updateStatus("sent");
      setIsEmailDialogOpen(false);
      setEmailMessage("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: message,
    });
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Orçamentos
          </Button>
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
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{budget.clientName}</h1>
                <Badge className={statusColors[budget.status]} variant="secondary">
                  {statusLabels[budget.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {budget.company && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {budget.company}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {budget.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEmailDialogOpen(true)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Enviar Proposta
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateStatus("accepted")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Aceitar
                  </Button>
                </>
              )}
              {budget.status === "sent" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateStatus("accepted")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateStatus("rejected")}
                  >
                    Rejeitar
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
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
                  <p className="text-sm text-muted-foreground">Valor Mínimo</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {budget.estimatedMin.toLocaleString("pt-BR")}
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
                  <p className="text-sm text-muted-foreground">Valor Máximo</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {budget.estimatedMax.toLocaleString("pt-BR")}
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
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="text-lg font-semibold">
                    {projectTypeLabels[budget.projectType] || budget.projectType}
                  </p>
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
                  <p className="text-lg font-semibold capitalize">
                    {budget.timeline}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{budget.clientName}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(budget.clientName, "Nome copiado!")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{budget.clientEmail}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(budget.clientEmail, "Email copiado!")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {budget.clientPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{budget.clientPhone}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            copyToClipboard(budget.clientPhone!, "Telefone copiado!")
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
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

            {/* Detalhes do Projeto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Projeto</p>
                    <p className="font-medium">
                      {projectTypeLabels[budget.projectType] || budget.projectType}
                    </p>
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Descrição / Detalhes Adicionais
                      </p>
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{budget.details}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Funcionalidades */}
            {featuresList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Funcionalidades Selecionadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {featuresList.map((featureId: string) => (
                      <Badge key={featureId} variant="secondary">
                        {featureLabels[featureId] || featureId}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Integrações */}
            {integrationsList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Integrações Selecionadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {integrationsList.map((integrationId: string) => (
                      <Badge key={integrationId} variant="outline">
                        {integrationLabels[integrationId] || integrationId}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                    {new Date(budget.createdAt).toLocaleDateString("pt-BR", {
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
                    {new Date(budget.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    copyToClipboard(
                      `Olá ${budget.clientName}, segue proposta para ${budget.projectType}...`,
                      "Template copiado!"
                    )
                  }
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Copiar Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${budget.clientEmail}`, "_blank")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                {budget.clientPhone && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      window.open(`https://wa.me/55${budget.clientPhone?.replace(/\D/g, "")}`, "_blank")
                    }
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Imprimir / PDF
                </Button>
              </CardContent>
            </Card>

            {/* Status Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${statusColors[budget.status]} w-full justify-center py-2`}>
                  {statusLabels[budget.status]}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {budget.status === "pending" && "Aguardando ação da equipe"}
                  {budget.status === "sent" && "Proposta enviada ao cliente"}
                  {budget.status === "accepted" && "Cliente aceitou a proposta"}
                  {budget.status === "rejected" && "Cliente rejeitou a proposta"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Orçamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={deleteBudget}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Envio de Email */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enviar Proposta por Email</DialogTitle>
              <DialogDescription>
                Envie uma mensagem personalizada para {budget.clientName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Para</Label>
                <Input value={budget.clientEmail} disabled />
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea
                  placeholder="Digite sua mensagem aqui..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={sendEmail} disabled={isSending}>
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
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
