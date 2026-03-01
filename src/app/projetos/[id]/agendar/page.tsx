"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  Calendar,
  Clock,
  Video,
  Mic,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function AgendarContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<"manha" | "tarde" | "">("");
  const [meetingType, setMeetingType] = useState<"video" | "audio">("video");
  const [notes, setNotes] = useState("");
  const [scheduledDates, setScheduledDates] = useState<Date[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchProject();
      fetchScheduledDates();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Erro ao buscar projeto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScheduledDates = async () => {
    try {
      const response = await fetch("/api/agendamentos/datas");
      if (response.ok) {
        const data = await response.json();
        setScheduledDates(data.dates.map((d: string) => new Date(d)));
      }
    } catch (error) {
      console.error("Erro ao buscar datas agendadas:", error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedPeriod("");
  };

  const handleSchedule = async (period: "manha" | "tarde") => {
    if (!selectedDate) {
      toast({
        title: "Data obrigatória",
        description: "Selecione uma data para o agendamento",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScheduling(true);

      // Mapear período para horário
      const timeMap = {
        manha: "09:00",
        tarde: "14:00",
      };

      const response = await fetch(`/api/projetos/${params.id}/agendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString().split("T")[0],
          time: timeMap[period],
          type: meetingType,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao agendar");
      }

      toast({
        title: "Agendamento realizado!",
        description: "Você receberá os detalhes por e-mail",
        variant: "default",
      });

      setTimeout(() => {
        router.push(`/projetos/${params.id}/agendar/obrigado`);
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao agendar",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  // Calcular dias disponíveis (próximos 30 dias, excluindo fins de semana)
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Excluir fins de semana (0 = domingo, 6 = sábado)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }

    return dates;
  };

  const availableDates = getAvailableDates();

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-slate-950">
        <FuturisticBackground />
        <div className="relative z-10 animate-spin h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-950">
      <FuturisticBackground />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 px-4 py-2 border-cyan-400/30 bg-cyan-500/20 text-cyan-100 backdrop-blur-md">
                <Sparkles className="h-3 w-3 mr-2" />
                Entrega do Projeto
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                Agende a <span className="text-cyan-400">Entrega</span> do Seu Projeto
              </h1>
              <p className="mt-6 text-lg text-cyan-100/70 max-w-2xl">
                Parabéns! Seu projeto está 100% concluído. Escolha o melhor dia e horário para receber a apresentação completa.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Formulário */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-slate-900/60 backdrop-blur-xl border-cyan-400/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Calendar className="h-5 w-5 text-cyan-400" />
                      Selecione a Data
                    </CardTitle>
                    <CardDescription className="text-cyan-100/60">
                      Escolha um dia útil disponível para a entrega
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-cyan-100/90 text-xs uppercase tracking-wider">
                        {isScheduling ? "Carregando..." : "Dias disponíveis:"}
                      </Label>
                      <CalendarComponent
                        selectedDate={selectedDate}
                        onSelectDate={handleDateSelect}
                        disabledDates={scheduledDates}
                        minDate={minDate}
                        availableDates={availableDates}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Informações de Entrega */}
              <div className="space-y-6">
                {/* Tipo de Entrega */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-slate-900/60 backdrop-blur-xl border-cyan-400/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Video className="h-5 w-5 text-cyan-400" />
                        Tipo de Entrega
                      </CardTitle>
                      <CardDescription className="text-cyan-100/60">
                        Como você prefere receber a apresentação?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${meetingType === "video"
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-cyan-400/20 hover:border-cyan-400/40"
                            }`}
                          onClick={() => setMeetingType("video")}
                        >
                          <Video className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                          <p className="font-medium text-white">Vídeo</p>
                          <p className="text-xs text-cyan-100/50 mt-1">Google Meet</p>
                        </div>
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${meetingType === "audio"
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-cyan-400/20 hover:border-cyan-400/40"
                            }`}
                          onClick={() => setMeetingType("audio")}
                        >
                          <Mic className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                          <p className="font-medium text-white">Áudio</p>
                          <p className="text-xs text-cyan-100/50 mt-1">Telefone/WhatsApp</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Período */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-slate-900/60 backdrop-blur-xl border-cyan-400/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Clock className="h-5 w-5 text-cyan-400" />
                          Período do Dia
                        </CardTitle>
                        <CardDescription className="text-cyan-100/60">
                          Selecione o período preferido
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isScheduling}
                            onClick={() => handleSchedule("manha")}
                            className={`h-16 gap-2 transition-all ${selectedPeriod === "manha"
                              ? "bg-cyan-600 border-cyan-400 text-white"
                              : "border-cyan-400/20 text-cyan-100 hover:bg-cyan-900/30"
                              }`}
                          >
                            <Sunrise className="h-6 w-6 text-cyan-600 hover:text-cyan-400" />
                            <div className="flex flex-col items-start text-cyan-600 hover:text-cyan-400">
                              <span className="font-semibold">Manhã</span>
                              <span className="text-xs opacity-70">9h às 12h</span>
                            </div>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isScheduling}
                            onClick={() => handleSchedule("tarde")}
                            className={`h-16 gap-2 transition-all ${selectedPeriod === "tarde"
                              ? "bg-cyan-600 border-cyan-400 text-white"
                              : "border-cyan-400/20 text-cyan-100 hover:bg-cyan-900/30"
                              }`}
                          >
                            <Sunset className="h-6 w-6 text-cyan-600 hover:text-cyan-400" />
                            <div className="flex flex-col items-start text-cyan-600 hover:text-cyan-400">
                              <span className="font-semibold">Tarde</span>
                              <span className="text-xs opacity-70">14h às 18h</span>
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Observações */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="bg-slate-900/60 backdrop-blur-xl border-cyan-400/20 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white text-base">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        Observações (opcional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        className="flex w-full rounded-md border border-cyan-400/20 bg-slate-950/50 text-cyan-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none min-h-[100px]"
                        placeholder="Alguma observação especial para a entrega?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-12 bg-slate-950/80 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/40 border-cyan-400/20 hover:border-cyan-400/40 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h3 className="font-semibold text-white">Projeto 100%</h3>
                    </div>
                    <p className="text-sm text-cyan-100/60">
                      Seu projeto está completo e pronto para entrega
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-slate-900/40 border-cyan-400/20 hover:border-cyan-400/40 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Video className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h3 className="font-semibold text-white">Apresentação</h3>
                    </div>
                    <p className="text-sm text-cyan-100/60">
                      Apresentação completa de todas as funcionalidades
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-900/40 border-cyan-400/20 hover:border-cyan-400/40 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h3 className="font-semibold text-white">Acessos</h3>
                    </div>
                    <p className="text-sm text-cyan-100/60">
                      Todos os acessos e documentação serão entregues
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Ícones adicionais
function Sunrise({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v8" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 4.93-4.24 4.24" />
      <path d="M2 12h8" />
      <path d="M20 12h-8" />
      <path d="m2 18 4.24-4.24" />
      <path d="m22 18-4.24-4.24" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

function Sunset({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 10V2" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 4.93-4.24 4.24" />
      <path d="M2 12h8" />
      <path d="M20 12h-8" />
      <path d="m2 18 4.24-4.24" />
      <path d="m22 18-4.24-4.24" />
      <circle cx="12" cy="12" r="5" />
      <path d="M2 22h20" />
    </svg>
  );
}

export default function AgendarEntregaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center relative bg-slate-950">
        <FuturisticBackground />
        <div className="relative z-10 animate-spin h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full" />
      </div>
    }>
      <AgendarContent />
    </Suspense>
  );
}
