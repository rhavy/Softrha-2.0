"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Clock,
  Video,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  MessageSquare,
  FolderKanban,
  Mic,
  Phone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NovoEventoModal } from "@/components/modals/novo-evento-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const eventColors: Record<string, string> = {
  meeting: "bg-blue-500",
  review: "bg-purple-500",
  presentation: "bg-orange-500",
  deploy: "bg-green-500",
  planning: "bg-indigo-500",
  deadline: "bg-red-500",
  delivery: "bg-emerald-500", // Entrega de projeto
};

const eventLabels: Record<string, string> = {
  meeting: "Reunião",
  review: "Review",
  presentation: "Apresentação",
  deploy: "Deploy",
  planning: "Planejamento",
  deadline: "Entrega",
  delivery: "Entrega de Projeto", // Entrega de projeto
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function DashboardCalendario() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de detalhes do agendamento
  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // Carregar eventos e agendamentos do banco de dados
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsResponse, schedulesResponse] = await Promise.all([
        fetch("/api/eventos"),
        fetch("/api/agendamentos"),
      ]);

      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json();
        throw new Error(errorData.error || "Erro ao buscar eventos");
      }
      const eventsData = await eventsResponse.json();
      setEventsList(eventsData);

      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedulesList(schedulesData);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos/agendamentos:", error);
      setEventsList([]);
      setSchedulesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Atualizar eventos e agendamentos a cada 5 segundos
    const intervalId = setInterval(() => {
      fetchEvents();
    }, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().getDate());
  };

  // Abrir modal de detalhes do agendamento
  const handleOpenScheduleDetail = (schedule: any) => {
    setSelectedSchedule(schedule);
    setScheduleDetailOpen(true);
  };

  const handleNewEvent = async (data: any) => {
    try {
      const response = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar evento");
      }

      // Enviar notificações para os participantes
      if (data.participants && data.participants.length > 0) {
        await fetch("/api/notificacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participants: data.participants,
            title: "Novo Evento Adicionado",
            message: `Você foi convidado para o evento: ${data.title}`,
            type: "info",
            category: "general",
            link: "/dashboard/calendario",
            metadata: {
              eventId: data.id,
              eventTitle: data.title,
              eventDate: data.date,
              eventTime: data.time,
            },
          }),
        });
      }

      await fetchEvents();
      setModalOpen(false);
      toast({
        title: "Evento criado!",
        description: data.participants?.length > 0
          ? "Evento criado e notificações enviadas aos participantes."
          : "Evento criado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: any) => {
    setEventToEdit(event);
    setModalOpen(true);
  };

  const handleUpdateEvent = async (data: any) => {
    if (!eventToEdit?.id) return;

    try {
      const response = await fetch(`/api/eventos/${eventToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar evento");
      }

      await fetchEvents();
      setModalOpen(false);
      setEventToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete?.id) return;

    try {
      const response = await fetch(`/api/eventos/${eventToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir evento");
      }

      await fetchEvents();
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento: " + (error as any).message,
        variant: "destructive",
      });
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Filtrar eventos pela data exata (comparação direta de strings YYYY-MM-DD)
    const events = eventsList.filter(event => {
      // event.date já vem como "YYYY-MM-DD" da API
      return event.date === dateStr;
    });

    // Filtrar agendamentos pela data exata (comparação direta de strings YYYY-MM-DD)
    const schedules = schedulesList.filter(schedule => {
      // schedule.date já vem como "YYYY-MM-DD" da API
      return schedule.date === dateStr;
    });

    return [...events, ...schedules];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const upcomingEvents = [...eventsList, ...schedulesList]
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Calendário</h1>
            <p className="text-muted-foreground">
              Acompanhe reuniões, entregas e eventos
            </p>
          </div>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {monthNames[month]} {year}
                  </h2>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoje
                </Button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 p-2" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isTodayDay = isToday(day);
                  const isSelected = selectedDate === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`h-24 p-2 text-left border rounded-lg transition-colors hover:bg-muted ${isSelected ? "bg-primary/10 border-primary" : ""
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${isTodayDay
                            ? "h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                            : ""
                            }`}
                        >
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge variant="secondary" className="text-xs h-5">
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${eventColors[event.type]} bg-opacity-20`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground pl-1">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardDescription className="p-6 pb-3">
              Próximos Eventos e Agendamentos
            </CardDescription>
            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum evento ou agendamento próximo</p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${eventColors[event.type]} bg-opacity-20`}>
                      {event.type === "delivery" ? (
                        <Calendar className="h-5 w-5" />
                      ) : event.type === "meeting" ? (
                        <Users className="h-5 w-5" />
                      ) : event.type === "review" ? (
                        <Calendar className="h-5 w-5" />
                      ) : event.type === "presentation" ? (
                        <Video className="h-5 w-5" />
                      ) : event.type === "deploy" ? (
                        <Clock className="h-5 w-5" />
                      ) : event.type === "planning" ? (
                        <Calendar className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time || "Horário não definido"}</span>
                        <span>•</span>
                        <span>{new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      </div>
                      {event.type === "delivery" && event.clientName && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Users className="h-3 w-3" />
                          <span>{event.clientName}</span>
                        </div>
                      )}
                      {event.location && event.location !== "-" && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {event.type !== "delivery" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {eventLabels[event.type]}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}

              <Button variant="outline" className="w-full mt-4">
                Ver calendário completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Events */}
        {selectedDate && getEventsForDay(selectedDate).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Eventos para {selectedDate} de {monthNames[month]}
              </CardTitle>
              <CardDescription>
                {getEventsForDay(selectedDate).length} evento(s) e agendamento(s) neste dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getEventsForDay(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => event.type === "delivery" ? handleOpenScheduleDetail(event) : null}
                  >
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${eventColors[event.type]} bg-opacity-20`}>
                      {event.type === "delivery" ? (
                        <Calendar className="h-6 w-6" />
                      ) : event.type === "meeting" ? (
                        <Users className="h-6 w-6" />
                      ) : event.type === "review" ? (
                        <Calendar className="h-6 w-6" />
                      ) : event.type === "presentation" ? (
                        <Video className="h-6 w-6" />
                      ) : event.type === "deploy" ? (
                        <Clock className="h-6 w-6" />
                      ) : event.type === "planning" ? (
                        <Calendar className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{event.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </span>
                        )}
                        {event.location && event.location !== "-" && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        )}
                        {event.participants && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.participants.join(", ")}
                          </span>
                        )}
                        {event.type === "delivery" && event.clientName && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Cliente: {event.clientName}
                          </span>
                        )}
                        {event.type === "delivery" && event.meetingType && (
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            {event.meetingType === "video" ? "Vídeo" : "Áudio"}
                          </span>
                        )}
                        {/* Exibir WhatsApp para reuniões agendadas */}
                        {event.type === "meeting" && event.clientPhone && (
                          <a
                            href={`https://wa.me/55${event.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Este é um lembrete do seu agendamento de reunião para ${event.date} às ${event.time}.`)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                WhatsApp: {event.clientPhone}
                              </span>
                            </Button>
                          </a>
                        )}
                        {event.type === "meeting" && event.meetingPeriod && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Período: {event.meetingPeriod === "manha" ? "Manhã" : "Tarde"}
                          </span>
                        )}
                      </div>
                      {event.type === "delivery" && event.meetingLink && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(event.meetingLink, "_blank")}
                          >
                            <Video className="h-3 w-3 mr-2" />
                            Abrir Reunião
                          </Button>
                        </div>
                      )}
                      {event.type === "delivery" && event.notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📝 {event.notes}
                        </p>
                      )}
                      {/* Exibir notas para reuniões */}
                      {event.type === "meeting" && event.notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📝 {event.notes}
                        </p>
                      )}
                    </div>
                    <Badge className={eventColors[event.type]}>
                      {eventLabels[event.type]}
                    </Badge>
                    {event.type !== "delivery" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <NovoEventoModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setEventToEdit(null);
          }}
          onSubmit={eventToEdit ? handleUpdateEvent : handleNewEvent}
          eventToEdit={eventToEdit}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{eventToDelete?.title}"?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteEvent}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Detail Dialog */}
        <Dialog open={scheduleDetailOpen} onOpenChange={setScheduleDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-cyan-400" />
                Detalhes do Agendamento
              </DialogTitle>
              <DialogDescription>
                Informações completas do agendamento
              </DialogDescription>
            </DialogHeader>

            {selectedSchedule && (
              <div className="space-y-6">
                {/* Header com status */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                  <div>
                    <p className="font-semibold text-lg text-white">{selectedSchedule.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSchedule.projectType}
                    </p>
                  </div>
                  <Badge className={selectedSchedule.status === "scheduled" ? "bg-green-600" : "bg-amber-600"}>
                    {selectedSchedule.status === "scheduled" ? "Agendado" : selectedSchedule.status}
                  </Badge>
                </div>

                {/* Informações do Cliente */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    Informações do Cliente
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Nome do Cliente</p>
                      <p className="font-medium text-white">{selectedSchedule.clientName || "—"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="font-medium text-white">{selectedSchedule.clientPhone || selectedSchedule.notes?.match(/WhatsApp: (.+?)(?: - |$)/)?.[1] || "—"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Tipo de Projeto</p>
                      <p className="font-medium text-white capitalize">{selectedSchedule.projectType || "—"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Período</p>
                      <p className="font-medium text-white capitalize">{selectedSchedule.meetingPeriod || selectedSchedule.notes?.match(/Período: (Manhã|Tarde)/)?.[1] || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Agendamento */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    Detalhes do Agendamento
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="font-medium text-white">
                        {(() => {
                          // Corrigir fuso horário - criar data no timezone local
                          const [year, month, day] = selectedSchedule.date.split('-').map(Number);
                          const eventDate = new Date(year, month - 1, day);
                          return eventDate.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          });
                        })()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Horário</p>
                      <p className="font-medium text-white">{selectedSchedule.time || "—"}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Tipo de Reunião</p>
                      <p className="font-medium text-white flex items-center gap-2">
                        {selectedSchedule.meetingType === "video" ? (
                          <><Video className="h-4 w-4 text-cyan-400" /> Vídeo Chamada</>
                        ) : (
                          <><Mic className="h-4 w-4 text-cyan-400" /> Áudio Chamada</>
                        )}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium text-white capitalize">{selectedSchedule.status}</p>
                    </div>
                  </div>
                </div>

                {/* Link da Reunião */}
                {selectedSchedule.meetingLink && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Video className="h-4 w-4 text-cyan-400" />
                      Link da Reunião
                    </h3>
                    <div className="p-3 rounded-lg bg-muted/50 border border-cyan-400/20">
                      <p className="text-sm text-cyan-400 break-all">{selectedSchedule.meetingLink}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(selectedSchedule.meetingLink, "_blank")}
                      >
                        <Video className="h-3 w-3 mr-2" />
                        Abrir Reunião
                      </Button>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {selectedSchedule.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-cyan-400" />
                      Observações
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedSchedule.notes}</p>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setScheduleDetailOpen(false)}
                  >
                    Fechar
                  </Button>
                  {selectedSchedule.projectId && (
                    <Button
                      variant="default"
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => {
                        setScheduleDetailOpen(false);
                        window.location.href = `/dashboard/projetos/${selectedSchedule.projectId}`;
                      }}
                    >
                      <FolderKanban className="h-4 w-4 mr-2" />
                      Ver Projeto
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
