"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, FileText, Printer, Download, Calendar, Clock, Rocket, Layers, Code, Monitor, Smartphone, ShoppingCart, Globe, BarChart3, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

function AprovarContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Converter timeline para semanas
  const getTimelineInWeeks = (timeline: string): string => {
    const timelineMap: Record<string, string> = {
      urgent: "1-2 semanas",
      normal: "3-6 semanas",
      flexible: "6+ semanas",
    };
    return timelineMap[timeline] || timeline;
  };

  // Calcular data prevista de entrega
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

  // Obter ícone do tipo de projeto
  const getProjectTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      web: Monitor,
      mobile: Smartphone,
      ecommerce: ShoppingCart,
      landing: Globe,
      dashboard: BarChart3,
      software: Code,
    };
    return icons[type] || FileText;
  };

  useEffect(() => {
    if (params.token) {
      // Buscar dados do orçamento para exibição
      fetch(`/api/orcamentos/token/${params.token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            router.push("/orcamento/invalido?reason=not_found");
          } else {
            setBudget(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          router.push("/orcamento/invalido?reason=error");
          setIsLoading(false);
        });
    }
  }, [params.token, router]);

  const handleResponse = async (accepted: boolean) => {
    try {
      setIsResponding(true);

      const response = await fetch(`/api/orcamentos/aprovar/${params.token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      if (accepted) {
        router.push("/orcamento/obrigado?status=accepted");
      } else {
        router.push("/orcamento/obrigado?status=rejected");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Gerar PDF
  const handleDownloadPDF = async () => {
    window.print();
  }

  if (!budget) {
    return null;
  }

  const downPayment = (budget.finalValue || 0) * 0.25;
  const finalPayment = (budget.finalValue || 0) * 0.75;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 print:p-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header - Esconder na impressão */}
        <div className="text-center mb-8 pt-8 print:hidden">
          <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
          <p className="text-muted-foreground">
            {budget.clientName}, revise sua proposta e tome uma decisão
          </p>
        </div>

        {/* Conteúdo para Impressão */}
        <div ref={contentRef} className="bg-white rounded-lg shadow-xl p-8 mb-6 print:shadow-none print:p-0">
          {/* Cabeçalho para Impressão */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold mb-2">Proposta Comercial</h1>
            <p className="text-sm text-gray-600">Softrha - Desenvolvimento de Software</p>
          </div>

          {/* Dados do Cliente */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{budget.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{budget.clientEmail}</p>
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
            </CardContent>
          </Card>

          {/* Detalhes do Projeto */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = getProjectTypeIcon(budget.projectType);
                  return <Icon className="h-5 w-5" />;
                })()}
                Detalhes do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Projeto</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const Icon = getProjectTypeIcon(budget.projectType);
                      return <Icon className="h-4 w-4 text-purple-600" />;
                    })()}
                    <p className="font-medium capitalize">{budget.projectType}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Complexidade</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Palette className="h-4 w-4 text-blue-600" />
                    <p className="font-medium capitalize">{budget.complexity}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prazo de Entrega</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <p className="font-medium">{getTimelineInWeeks(budget.timeline)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Rocket className="h-4 w-4 text-green-600" />
                    <p className="font-medium">{budget.startDate ? new Date(budget.startDate).toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">{getExpectedDeliveryDate()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Páginas</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4 text-green-600" />
                    <p className="font-medium">{budget.pages}</p>
                  </div>
                </div>
              </div>

              {budget.details && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição do Projeto</p>
                  <div className="p-4 bg-muted rounded-md border">
                    <p className="text-sm whitespace-pre-wrap">{budget.details}</p>
                  </div>
                </div>
              )}

              {budget.features && Array.isArray(budget.features) && budget.features.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Funcionalidades ({budget.features.length})
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {budget.features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-100">
                        <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="text-sm capitalize">{f.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {budget.integrations && Array.isArray(budget.integrations) && budget.integrations.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Integrações ({budget.integrations.length})
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {budget.integrations.map((i: string) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                        <CheckCircle2 className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="text-sm capitalize">{i.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valores */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-5" />
                Investimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Valor Total do Projeto:</span>
                <span className="text-lg font-bold">
                  R$ {(budget.finalValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Entrada (25%):</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {downPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-green-600">Pago no início do projeto</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Final (75%):</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {finalPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-600">Pago na entrega do projeto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termos */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Termos e Condições</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• O prazo de execução começa a contar após a aprovação desta proposta e pagamento da entrada.</p>
              <p>• O cliente deverá fornecer todas as informações necessárias para a execução do projeto.</p>
              <p>• Alterações no escopo após o início do projeto poderão acarretar custos adicionais.</p>
              <p>• O pagamento da entrada é não reembolsável em caso de desistência pelo cliente.</p>
              <p>• O projeto inclui 3 rodadas de revisões. Revisões adicionais poderão ser cobradas.</p>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação - Esconder na impressão */}
        <div className="space-y-4 print:hidden">
          {/* Botões de Impressão/Download */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Proposta
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </div>

          {/* Botões de Decisão */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold mb-2">Você aceita esta proposta?</p>
                <p className="text-sm text-muted-foreground">
                  Ao aceitar, você será redirecionado para a próxima etapa
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => handleResponse(true)}
                  disabled={isResponding}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {isResponding ? "Processando..." : "ACEITAR PROPOSTA"}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                  onClick={() => handleResponse(false)}
                  disabled={isResponding}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {isResponding ? "Processando..." : "NEGAR PROPOSTA"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Esta proposta é válida por 7 dias a partir da data de envio.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function AprovarPropostaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AprovarContent />
    </Suspense>
  );
}
