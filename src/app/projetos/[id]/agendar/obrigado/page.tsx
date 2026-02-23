"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgendamentoObrigadoPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projetos/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProject(data);
        })
        .catch(console.error);
    }
  }, [params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-3xl">Agendamento Confirmado!</CardTitle>
            <CardDescription className="text-lg">
              {project?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-green-900">
                    E-mail de confirmação enviado
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Você receberá em breve um e-mail com todos os detalhes do agendamento, incluindo o link da reunião (se for vídeo chamada).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-900">
                    Prepare-se para a entrega
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    No dia e horário agendados, nossa equipe entrará em contato para apresentar o projeto concluído e entregar todos os acessos e documentação.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-center text-muted-foreground">
                Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => window.location.href = "/"}
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
