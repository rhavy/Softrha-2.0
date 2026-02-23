"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, CheckCircle2, XCircle } from "lucide-react";

export default function DebugOrcamentoPage() {
  const params = useParams();
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/orcamentos/${params.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao buscar orçamento");
      }
      const data = await response.json();
      setBudget(data);
      console.log("[DEBUG] Budget completo:", data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchBudget();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchBudget} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Orçamento não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/dashboard/orcamentos"}>
              Voltar para Orçamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Debug: Orçamento</h1>
            <p className="text-muted-foreground">{budget.id}</p>
          </div>
          <Button onClick={fetchBudget} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Status Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[budget.status]} variant="secondary">
                  {statusLabels[budget.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project ID</p>
                <div className="flex items-center gap-2 mt-1">
                  {budget.projectId ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-mono text-sm">{budget.projectId}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-mono text-sm text-red-600">null</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{budget.clientName}</p>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-auto">
              <p className="text-muted-foreground mb-2">JSON Completo:</p>
              <pre>{JSON.stringify({
                id: budget.id,
                status: budget.status,
                projectId: budget.projectId,
                clientName: budget.clientName,
                contractId: budget.contract?.id,
                contractConfirmed: budget.contract?.confirmed,
              }, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Contrato */}
        {budget.contract && (
          <Card>
            <CardHeader>
              <CardTitle>Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-mono text-sm">{budget.contract.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={budget.contract.status === "confirmed" ? "default" : "secondary"}>
                    {budget.contract.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmado</p>
                  <div className="flex items-center gap-2 mt-1">
                    {budget.contract.confirmed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Sim</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Não</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões que Deveriam Aparecer */}
        <Card>
          <CardHeader>
            <CardTitle>Botões Esperados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Condições:</p>
                <ul className="text-sm space-y-1 font-mono">
                  <li>• status === "down_payment_paid": <strong>{budget.status === "down_payment_paid" ? "✅ true" : "❌ false"}</strong></li>
                  <li>• projectId !== null: <strong>{budget.projectId ? "✅ true" : "❌ false"}</strong></li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Botão que deve aparecer:</p>
                {budget.status === "down_payment_paid" ? (
                  budget.projectId ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">[Ver Projeto]</span>
                      <span className="text-muted-foreground text-sm">→ /dashboard/projetos/{budget.projectId}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">[Iniciar Projeto]</span>
                      <span className="text-muted-foreground text-sm">Cria projeto manualmente</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-5 w-5" />
                    <span>Nenhum botão de projeto (status não é down_payment_paid)</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações de Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                console.log("[DEBUG] Budget completo:", budget);
                alert("Veja o console do navegador (F12) para ver o budget completo");
              }}
            >
              <Database className="h-4 w-4 mr-2" />
              Log no Console
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const text = JSON.stringify(budget, null, 2);
                navigator.clipboard.writeText(text);
                alert("Budget copiado para a área de transferência!");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Copiar JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
