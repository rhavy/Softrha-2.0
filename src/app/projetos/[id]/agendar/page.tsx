"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, Mic, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function AgendarContent() {
  const params = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [meetingType, setMeetingType] = useState<"video" | "audio">("video");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projetos/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch(() => {
          toast({
            title: "Erro",
            description: "Projeto não encontrado",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    }
  }, [params.id, toast]);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione data e horário",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScheduling(true);

      const response = await fetch(`/api/projetos/${params.id}/agendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
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
      });

      setTimeout(() => {
        window.location.href = `/projetos/${params.id}/agendar/obrigado`;
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

  // Gerar horários disponíveis (9h às 18h)
  const timeSlots = [];
  for (let i = 9; i <= 18; i++) {
    timeSlots.push(`${i.toString().padStart(2, "0")}:00`);
    if (i < 18) timeSlots.push(`${i.toString().padStart(2, "0")}:30`);
  }

  const minDate = new Date().toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle>Agendar Entrega do Projeto</CardTitle>
                <CardDescription>{project?.name}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🎉 Parabéns! Seu projeto está 100% concluído. Agora agende a entrega para receber todos os detalhes e acessos.
              </p>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Entrega
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
              />
              <p className="text-xs text-muted-foreground">Escolha um dia útil (segunda a sexta-feira)</p>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    type="button"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tipo de Reunião */}
            <div className="space-y-2">
              <Label>Tipo de Entrega</Label>
              <div className="flex gap-4">
                <div
                  className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${meetingType === "video" ? "border-primary bg-primary/5" : "border-muted"}`}
                  onClick={() => setMeetingType("video")}
                >
                  <Video className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Vídeo Chamada</p>
                  <p className="text-xs text-muted-foreground mt-1">Google Meet ou similar</p>
                </div>
                <div
                  className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${meetingType === "audio" ? "border-primary bg-primary/5" : "border-muted"}`}
                  onClick={() => setMeetingType("audio")}
                >
                  <Mic className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Áudio Chamada</p>
                  <p className="text-xs text-muted-foreground mt-1">Telefone ou WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md"
                placeholder="Alguma observação especial para a entrega?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleSchedule} disabled={isScheduling || !selectedDate || !selectedTime} size="lg">
              {isScheduling ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Agendando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AgendarEntregaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AgendarContent />
    </Suspense>
  );
}
