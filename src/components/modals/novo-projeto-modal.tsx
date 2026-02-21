"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import React from "react";
import { useToast } from "@/hooks/use-toast";
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
import { X, Plus, Building } from "lucide-react";
import Link from "next/link";

interface ProjectFormData {
  name: string;
  clientId: string;
  description: string;
  status: string;
}

interface ProjectData extends ProjectFormData {
  id?: string;
  tech: string[];
  progress?: number;
  dueDate?: string;
  client?: string;
}

interface Client {
  id: string;
  name: string;
  document: string;
}

interface NovoProjetoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ProjectData) => void;
  projectToEdit?: ProjectData | null;
}

const statusOptions = [
  { value: "Planejamento", label: "Planejamento" },
  { value: "Em Desenvolvimento", label: "Em Desenvolvimento" },
  { value: "Em Revisão", label: "Em Revisão" },
  { value: "Concluído", label: "Concluído" },
];

export function NovoProjetoModal({
  open,
  onOpenChange,
  onSubmit,
  projectToEdit,
}: NovoProjetoModalProps) {
  const { toast } = useToast();
  const [techTags, setTechTags] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      clientId: "",
      description: "",
      status: "Planejamento",
    },
  });

  // Carregar clientes e dados do projeto
  useEffect(() => {
    if (open) {
      fetch("/api/clientes")
        .then((res) => res.json())
        .then((data) => setClients(data))
        .catch(console.error);

      if (projectToEdit) {
        form.reset({
          name: projectToEdit.name,
          clientId: projectToEdit.clientId || "",
          description: projectToEdit.description || "",
          status: projectToEdit.status,
        });
        setTechTags(projectToEdit.tech || []);
      } else {
        form.reset({
          name: "",
          clientId: "",
          description: "",
          status: "Planejamento",
        });
        setTechTags([]);
      }
    }
  }, [projectToEdit, open, form]);

  const handleAddTech = () => {
    if (techInput.trim() && !techTags.includes(techInput.trim())) {
      setTechTags([...techTags, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechTags(techTags.filter((t) => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleSubmit = (data: ProjectFormData) => {
    const client = clients.find((c) => c.id === data.clientId);
    onSubmit?.({ 
      ...data, 
      client: client?.name || "",
      id: projectToEdit?.id, 
      tech: techTags 
    });
    toast({
      title: projectToEdit ? "Projeto atualizado!" : "Projeto criado!",
      description: projectToEdit 
        ? "As informações do projeto foram atualizadas com sucesso."
        : "O projeto foi criado com sucesso.",
      variant: "success",
    });
    form.reset();
    setTechTags([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{projectToEdit ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
          <DialogDescription>
            {projectToEdit
              ? "Atualize as informações do projeto"
              : "Preencha as informações para criar um novo projeto"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome do projeto é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: E-commerce Platform" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              rules={{ required: "Cliente é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="flex-1">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.document}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Link href="/dashboard/clientes" target="_blank">
                      <Button type="button" variant="outline" size="icon">
                        <Building className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <FormDescription>
                    Não tem clientes? <Link href="/dashboard/clientes" className="text-primary hover:underline">Cadastre um</Link>
                  </FormDescription>
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
                      placeholder="Descreva o projeto..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma breve descrição do escopo do projeto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
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

            <FormItem>
              <FormLabel>Tecnologias</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Next.js"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTech}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Pressione Enter ou clique no + para adicionar
              </FormDescription>
              {techTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {techTags.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </FormItem>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {projectToEdit ? "Salvar Alterações" : "Criar Projeto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
