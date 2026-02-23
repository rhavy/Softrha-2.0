"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function PagamentoFinalObrigadoContent() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projetos/${params.id}`)
        .then((res) => res.json())
        .then((data) => setProject(data))
        .catch(console.error);
    }
  }, [params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mx-auto mb-4">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </motion.div>
            <CardTitle className="text-3xl">Pagamento Confirmado! 🎉</CardTitle>
            <CardDescription className="text-lg">Seu projeto está 100% concluído e pronto para entrega!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">
                Seu pagamento foi confirmado!
              </h3>
              <p className="text-green-700">
                Agora você pode agendar a entrega do projeto para receber todos os detalhes, acessos e documentação completa.
              </p>
            </div>

            {project && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Projeto</p>
                  <p className="font-semibold">{project.name}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-green-600">100% Concluído</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">🚀 Parabéns pelo seu projeto!</h3>
              <p className="text-blue-700 mb-4">
                Estamos muito animados para apresentar o resultado do trabalho! Agende agora a entrega para receber:
              </p>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Todos os acessos e credenciais
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Documentação completa do projeto
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Treinamento e orientação de uso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Suporte pós-entrega
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1" size="lg" onClick={() => window.location.href = `/projetos/${params.id}/agendar`}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Entrega Agora
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button variant="ghost" onClick={() => window.location.href = "/"}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PagamentoFinalObrigadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PagamentoFinalObrigadoContent />
    </Suspense>
  );
}
