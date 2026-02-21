"use client";

import { useForm } from "react-hook-form";
import React from "react";
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

interface EventFormData {
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location: string;
  project: string;
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

export function NovoEventoModal({
  open,
  onOpenChange,
  onSubmit,
  eventToEdit,
}: NovoEventoModalProps) {
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

  // Carregar dados do evento quando estiver editando
  React.useEffect(() => {
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
    }
  }, [eventToEdit, open, form]);

  const handleSubmit = (data: EventFormData) => {
    onSubmit?.({ ...data, id: eventToEdit?.id, participants: eventToEdit?.participants || [] });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? "Editar Evento" : "Novo Evento"}</DialogTitle>
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
                    <FormControl>
                      <Input placeholder="Ex: Google Meet / Sala 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
