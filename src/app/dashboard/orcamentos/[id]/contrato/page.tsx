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
  FileSignature,
  Mail,
  Phone,
  User,
  Building,
  DollarSign,
  Send,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";

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
  contract?: any;
}

export default function CriarContratoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

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

  const handleCreateContract = async () => {
    try {
      setIsCreating(true);

      const response = await fetch(`/api/orcamentos/${params.id}/contrato`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: customContent || undefined,
          sendEmail,
          sendWhatsApp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar contrato");
      }

      toast({
        title: "Contrato criado!",
        description: "Contrato enviado com sucesso para o cliente",
      });

      // Abrir WhatsApp se solicitado
      if (sendWhatsApp && result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank");
      }

      // Redirecionar de volta para detalhes do orçamento
      setTimeout(() => {
        router.push(`/dashboard/orcamentos/${params.id}`);
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar contrato",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
          <FileSignature className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Orçamento não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/orcamentos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (budget.contract) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-2">Contrato Já Existe</h2>
          <p className="text-muted-foreground mb-4">
            Este orçamento já possui um contrato criado.
          </p>
          <Button onClick={() => router.push(`/dashboard/orcamentos/${params.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar ao Orçamento
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calcular valores
  const downPayment = (budget.finalValue || 0) * 0.25;
  const finalPayment = (budget.finalValue || 0) * 0.75;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Contrato</h1>
            <p className="text-muted-foreground">
              {budget.projectType} - {budget.clientName}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informações do Orçamento */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Dados do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Informações:</strong> O contrato será gerado automaticamente com base nos dados do orçamento.
                    Você pode personalizar o conteúdo abaixo ou usar o modelo padrão.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo do Contrato (opcional)</Label>
                  <Textarea
                    placeholder="Deixe em branco para usar o modelo padrão. Ou personalize o conteúdo do contrato aqui..."
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Projeto</p>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{budget.clientName}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(budget.clientName, "Nome copiado!")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{budget.clientEmail}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(budget.clientEmail, "Email copiado!")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {budget.clientPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium text-sm">{budget.clientPhone}</p>
                  </div>
                )}
                {budget.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium text-sm">{budget.company}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Valores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor Total:</span>
                  <span className="font-semibold">R$ {(budget.finalValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entrada (25%):</span>
                  <span className="font-semibold text-green-600">R$ {downPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Final (75%):</span>
                  <span className="font-semibold text-blue-600">R$ {finalPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>

            {/* Envio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Envio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Como enviar o contrato?</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        E-mail
                      </span>
                    </label>
                    {budget.clientPhone && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendWhatsApp}
                          onChange={(e) => setSendWhatsApp(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          WhatsApp
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateContract}
                  disabled={isCreating || (!sendEmail && !sendWhatsApp)}
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <FileSignature className="h-4 w-4 mr-2" />
                      Criar e Enviar Contrato
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  O cliente receberá um link para visualizar e assinar o contrato.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
