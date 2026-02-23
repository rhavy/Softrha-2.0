"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Clock, Video, Mic, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AgendamentoSucessoPage() {
  const params = useParams();
  const [schedule, setSchedule] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projetos/${params.id}/agendamento`)
        .then((res) => res.json())
        .then((data) => setSchedule(data))
        .catch(console.error);
    }
  }, [params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </motion.div>
            <CardTitle className="text-3xl">Agendamento Confirmado! 🎉</CardTitle>
            <CardDescription className="text-lg">
              Sua entrega foi agendada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">
                Detalhes do Agendamento
              </h3>
              
              {schedule && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Data</p>
                      <p className="font-semibold">
                        {new Date(schedule.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Horário</p>
                      <p className="font-semibold">{schedule.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {schedule.type === "video" ? (
                      <Video className="h-5 w-5 text-green-600" />
                    ) : (
                      <Mic className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Tipo</p>
                      <p className="font-semibold">
                        {schedule.type === "video" ? "Vídeo Chamada" : "Áudio Chamada"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📧 Você receberá um e-mail com todos os detalhes e o link da reunião 
                (no caso de vídeo chamada) ou confirmação de ligação (áudio chamada).
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-center font-medium">O que acontece agora:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Você receberá o e-mail de confirmação
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Nossa equipe preparará a apresentação do projeto
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  No dia agendado, faremos a entrega oficial
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => window.open("mailto:contato@softrha.com", "_blank")}>
                <Mail className="h-4 w-4 mr-2" />
                Fale Conosco
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button variant="ghost" onClick={() => window.location.href = "/"}>
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
