"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | "error">("pending");
  const [projectData, setProjectData] = useState<{
    projectName?: string;
    clientName?: string;
    amount?: number;
  }>({});

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const budgetId = searchParams.get("payment_link_id");

      console.log("[Obrigado Pagamento] session_id:", sessionId, "budget_id:", budgetId);

      if (!sessionId && !budgetId) {
        console.log("[Obrigado Pagamento] Nenhum parâmetro encontrado");
        setPaymentStatus("pending");
        setIsVerifying(false);
        return;
      }

      try {
        console.log("[Obrigado Pagamento] Iniciando verificação...");
        // Aguardar 2 segundos para dar tempo do webhook processar
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await fetch("/api/verificar-pagamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            budget_id: budgetId,
          }),
        });

        console.log("[Obrigado Pagamento] Resposta da API:", response.status);

        const result = await response.json();
        console.log("[Obrigado Pagamento] Resultado:", result);

        if (result.success && result.payment?.status === "paid") {
          console.log("[Obrigado Pagamento] Pagamento confirmado!");
          setPaymentStatus("success");
          setProjectData({
            projectName: result.project?.name,
            clientName: result.budget?.clientName || result.payment?.clientName || "Cliente",
            amount: result.payment?.amount,
          });
        } else {
          console.log("[Obrigado Pagamento] Pagamento ainda pendente");
          setPaymentStatus("pending");
        }
      } catch (error) {
        console.error("[Obrigado Pagamento] Erro ao verificar pagamento:", error);
        setPaymentStatus("pending");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-emerald-600 mb-4" />
            <CardTitle className="text-2xl">Verificando Pagamento</CardTitle>
            <CardDescription>Aguarde enquanto confirmamos seu pagamento...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {paymentStatus === "success" ? (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-600 mb-4" />
              <CardTitle className="text-2xl">Pagamento Confirmado! 🎉</CardTitle>
              <CardDescription>
                {projectData.clientName}, seu pagamento foi confirmado com sucesso!
              </CardDescription>
            </>
          ) : (
            <>
              <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center bg-amber-100 rounded-full">
                <Loader2 className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Aguardando Confirmação</CardTitle>
              <CardDescription>
                Seu pagamento está sendo processado. Você receberá um e-mail em breve.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          {paymentStatus === "success" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-emerald-800">
                <strong>Projeto:</strong> {projectData.projectName}
                <br />
                <strong>Valor:</strong> R$ {projectData.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
