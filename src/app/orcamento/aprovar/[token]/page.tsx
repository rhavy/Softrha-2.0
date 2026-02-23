"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, FileText, Printer, Download } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 print:shadow-none print:p-0">
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
              <CardTitle>Detalhes do Projeto</CardTitle>
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
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{budget.details}</p>
                  </div>
                </div>
              )}

              {budget.features && Array.isArray(budget.features) && budget.features.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Funcionalidades</p>
                  <div className="flex flex-wrap gap-2">
                    {budget.features.map((f: string) => (
                      <Badge key={f} variant="secondary">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {budget.integrations && Array.isArray(budget.integrations) && budget.integrations.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Integrações</p>
                  <div className="flex flex-wrap gap-2">
                    {budget.integrations.map((i: string) => (
                      <Badge key={i} variant="outline">{i}</Badge>
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
            <Button variant="outline" onClick={handlePrint}>
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
