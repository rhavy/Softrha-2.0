"use client";

import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, User, Users, Video, MapPin, Globe } from "lucide-react";

interface EventFormData {
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location: string;
  project: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface EventData extends EventFormData {
  id?: string;
  participants: string[];
}

interface NovoEventoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: EventData) => void;
  eventToEdit?: EventData | null;
}

const typeOptions = [
  { value: "meeting", label: "Reunião" },
  { value: "review", label: "Review" },
  { value: "presentation", label: "Apresentação" },
  { value: "deploy", label: "Deploy" },
  { value: "planning", label: "Planejamento" },
  { value: "deadline", label: "Entrega" },
];

const locationOptions = [
  { value: "google_meet", label: "Google Meet", icon: Video, url: "https://meet.google.com/new" },
  { value: "zoom", label: "Zoom", icon: Video, url: "https://zoom.us/j/new" },
  { value: "teams", label: "Microsoft Teams", icon: Video, url: "" },
  { value: "sala_reuniao_1", label: "Sala de Reunião 1", icon: MapPin, url: "" },
  { value: "sala_reuniao_2", label: "Sala de Reunião 2", icon: MapPin, url: "" },
  { value: "presencial", label: "Presencial", icon: MapPin, url: "" },
  { value: "outro", label: "Outro", icon: Globe, url: "" },
];

export function NovoEventoModal({
  open,
  onOpenChange,
  onSubmit,
  eventToEdit,
}: NovoEventoModalProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [customLocation, setCustomLocation] = useState("");

  const form = useForm<EventFormData>({
    defaultValues: {
      title: "",
      description: "",
      type: "meeting",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      location: "",
      project: "",
    },
  });

  // Carregar membros da equipe
  useEffect(() => {
    if (open) {
      fetchTeamMembers();
    }
  }, [open]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await fetch("/api/equipe");
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Erro ao carregar equipe:", error);
      // Dados mockados para fallback
      setTeamMembers([
        { id: "1", name: "Ana Silva", role: "Designer", email: "ana@softrha.com" },
        { id: "2", name: "Bruno Santos", role: "Developer", email: "bruno@softrha.com" },
        { id: "3", name: "Carla Oliveira", role: "PM", email: "carla@softrha.com" },
        { id: "4", name: "Daniel Costa", role: "Developer", email: "daniel@softrha.com" },
      ]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Carregar dados do evento quando estiver editando
  useEffect(() => {
    if (eventToEdit && open) {
      form.reset({
        title: eventToEdit.title,
        description: eventToEdit.description || "",
        type: eventToEdit.type,
        date: eventToEdit.date,
        time: eventToEdit.time,
        location: eventToEdit.location || "",
        project: eventToEdit.project || "",
      });
      setSelectedParticipants(eventToEdit.participants || []);
      
      // Se o local não for uma opção predefinida, tratar como customizado
      const predefinedLocation = locationOptions.find(loc => loc.value === eventToEdit.location);
      if (!predefinedLocation && eventToEdit.location) {
        setCustomLocation(eventToEdit.location);
      }
    } else if (!eventToEdit && open) {
      form.reset({
        title: "",
        description: "",
        type: "meeting",
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
        location: "",
        project: "",
      });
      setSelectedParticipants([]);
      setCustomLocation("");
    }
  }, [eventToEdit, open, form]);

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getParticipantName = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member?.name || memberId;
  };

  const getParticipantInitials = (memberId: string) => {
    const name = getParticipantName(memberId);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSubmit = (data: EventFormData) => {
    // Se local for "outro" e tiver valor customizado, usar o valor customizado
    let finalLocation = data.location;
    if (data.location === "outro" && customLocation.trim()) {
      finalLocation = customLocation.trim();
    } else if (data.location === "google_meet") {
      finalLocation = "https://meet.google.com/new";
    } else if (data.location === "zoom") {
      finalLocation = "https://zoom.us/j/new";
    }

    onSubmit?.({ 
      ...data, 
      id: eventToEdit?.id, 
      participants: selectedParticipants,
      location: finalLocation,
    });
    form.reset();
    setSelectedParticipants([]);
    setCustomLocation("");
    onOpenChange(false);
  };

  const selectedLocation = form.watch("location");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {eventToEdit ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
          <DialogDescription>
            {eventToEdit
              ? "Atualize as informações do evento"
              : "Preencha as informações para adicionar um novo evento"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Título é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reunião de Kickoff" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o evento..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                rules={{ required: "Tipo é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo para local customizado */}
            {selectedLocation === "outro" && (
              <div className="space-y-2">
                <FormLabel>Informe o Local</FormLabel>
                <Input
                  placeholder="Ex: Link da reunião ou endereço"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                />
              </div>
            )}

            {/* Link do local selecionado */}
            {selectedLocation && selectedLocation !== "outro" && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  {(() => {
                    const LocationIcon = locationOptions.find(loc => loc.value === selectedLocation)?.icon;
                    return LocationIcon ? <LocationIcon className="h-4 w-4" /> : null;
                  })()}
                  <span className="text-muted-foreground">
                    {selectedLocation === "google_meet" && "Link: https://meet.google.com/new"}
                    {selectedLocation === "zoom" && "Link: https://zoom.us/j/new"}
                    {selectedLocation?.includes("sala") && "Local: Presencial na sala selecionada"}
                    {selectedLocation === "presencial" && "Local: Presencial"}
                    {selectedLocation === "teams" && "Link: Microsoft Teams"}
                  </span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                rules={{ required: "Data é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                rules={{ required: "Hora é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto Relacionado (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: E-commerce Platform" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seleção de Participantes */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participantes da Equipe
                </FormLabel>
                <Badge variant="secondary">
                  {selectedParticipants.length} selecionado(s)
                </Badge>
              </div>

              <ScrollArea className="h-48 border rounded-lg p-3">
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Nenhum membro da equipe encontrado
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((member) => {
                      const isSelected = selectedParticipants.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 border border-primary"
                              : "hover:bg-muted border border-transparent"
                          }`}
                          onClick={() => toggleParticipant(member.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              Selecionado
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Participantes selecionados */}
              {selectedParticipants.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {selectedParticipants.map((participantId) => (
                      <Badge
                        key={participantId}
                        variant="outline"
                        className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => toggleParticipant(participantId)}
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {getParticipantInitials(participantId)}
                          </AvatarFallback>
                        </Avatar>
                        {getParticipantName(participantId)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {eventToEdit ? "Salvar Alterações" : "Adicionar Evento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
