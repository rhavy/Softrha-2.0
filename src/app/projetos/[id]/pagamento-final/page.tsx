"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PagamentoFinalPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projetos/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="border-0 shadow-xl max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Projeto não encontrado</h2>
            <Button onClick={() => window.location.href = "/"}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = project.status === "completed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle>Pagamento Final do Projeto</CardTitle>
                <CardDescription>{project.name}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPaid ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-700">Pagamento Confirmado!</h2>
                  <p className="text-muted-foreground mt-2">
                    Seu projeto está 100% concluído e pronto para entrega.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-sm text-green-800">
                    🎉 Parabéns! Agora você pode agendar a entrega do seu projeto.
                    Nossa equipe entrará em contato para apresentar o resultado final.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => window.location.href = `/projetos/${params.id}/agendar`}
                >
                  Agendar Entrega
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-sm text-blue-800">
                    📋 O projeto está 100% concluído! Para receber a entrega, realize o pagamento final.
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor Total do Projeto:</span>
                      <span className="font-medium">R$ {project.budget?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrada Paga (25%):</span>
                      <span className="font-medium text-green-600">R$ {((project.budget || 0) * 0.25).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Valor Restante (75%):</span>
                        <span className="text-xl font-bold text-primary">R$ {((project.budget || 0) * 0.75).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ O link de pagamento será enviado pelo gestor do projeto.
                    Entre em contato caso ainda não tenha recebido.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled
                >
                  Aguardando Link de Pagamento
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Após o pagamento, você poderá agendar a entrega do projeto.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
