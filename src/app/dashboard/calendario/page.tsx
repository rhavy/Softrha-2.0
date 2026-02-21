"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
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
};

const eventLabels: Record<string, string> = {
  meeting: "Reunião",
  review: "Review",
  presentation: "Apresentação",
  deploy: "Deploy",
  planning: "Planejamento",
  deadline: "Entrega",
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function DashboardCalendario() {
  const { toast } = useToast();
  const [currentDate] = useState(new Date(2026, 1, 20)); // Fevereiro 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar eventos do banco de dados
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/eventos");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao buscar eventos");
      }
      const data = await response.json();
      setEventsList(data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEventsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

      await fetchEvents();
      setModalOpen(false);
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
    return eventsList.filter(event => event.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const upcomingEvents = eventsList
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
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {monthNames[month]} {year}
                  </h2>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm">
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
                      className={`h-24 p-2 text-left border rounded-lg transition-colors hover:bg-muted ${
                        isSelected ? "bg-primary/10 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isTodayDay
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
              Próximos Eventos
            </CardDescription>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${eventColors[event.type]} bg-opacity-20`}>
                    {event.type === "meeting" && <Users className="h-5 w-5" />}
                    {event.type === "review" && <Calendar className="h-5 w-5" />}
                    {event.type === "presentation" && <Video className="h-5 w-5" />}
                    {event.type === "deploy" && <Clock className="h-5 w-5" />}
                    {event.type === "planning" && <Calendar className="h-5 w-5" />}
                    {event.type === "deadline" && <Clock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                      <span>•</span>
                      <span>{new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {event.location !== "-" ? (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </>
                      ) : (
                        <span className="italic">Sem local definido</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      {eventLabels[event.type]}
                    </Badge>
                  </div>
                </motion.div>
              ))}

              <Button variant="outline" className="w-full mt-4">
                Ver todos os eventos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Events */}
        {selectedDate && getEventsForDay(selectedDate).length > 0 && (
          <Card className="mt-6">
            <CardDescription className="p-6 pb-3">
              Eventos para {selectedDate} de {monthNames[month]}
            </CardDescription>
            <CardContent>
              <div className="space-y-3">
                {getEventsForDay(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${eventColors[event.type]} bg-opacity-20`}>
                      {event.type === "meeting" && <Users className="h-6 w-6" />}
                      {event.type === "review" && <Calendar className="h-6 w-6" />}
                      {event.type === "presentation" && <Video className="h-6 w-6" />}
                      {event.type === "deploy" && <Clock className="h-6 w-6" />}
                      {event.type === "planning" && <Calendar className="h-6 w-6" />}
                      {event.type === "deadline" && <Clock className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{event.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.participants.join(", ")}
                        </span>
                      </div>
                    </div>
                    <Badge className={eventColors[event.type]}>
                      {eventLabels[event.type]}
                    </Badge>
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
      </motion.div>
    </DashboardLayout>
  );
}
