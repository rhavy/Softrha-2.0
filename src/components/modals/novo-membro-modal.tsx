"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface MemberFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
}

interface MemberData extends MemberFormData {
  id?: string;
  skills: string[];
  projects?: number;
  avatar?: string;
}

interface NovoMembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: MemberData) => void;
  memberToEdit?: MemberData | null;
}

const statusOptions = [
  { value: "active", label: "Disponível" },
  { value: "busy", label: "Ocupado" },
  { value: "away", label: "Ausente" },
];

export function NovoMembroModal({
  open,
  onOpenChange,
  onSubmit,
  memberToEdit,
}: NovoMembroModalProps) {
  const [skillsTags, setSkillsTags] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");

  const form = useForm<MemberFormData>({
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      status: "active",
    },
  });

  // Carregar dados do membro quando estiver editando
  React.useEffect(() => {
    if (memberToEdit && open) {
      form.reset({
        name: memberToEdit.name,
        role: memberToEdit.role,
        email: memberToEdit.email,
        phone: memberToEdit.phone || "",
        status: memberToEdit.status,
      });
      setSkillsTags(memberToEdit.skills || []);
    } else if (!memberToEdit && open) {
      form.reset({
        name: "",
        role: "",
        email: "",
        phone: "",
        status: "active",
      });
      setSkillsTags([]);
    }
  }, [memberToEdit, open, form]);

  const handleAddSkill = () => {
    if (skillsInput.trim() && !skillsTags.includes(skillsInput.trim())) {
      setSkillsTags([...skillsTags, skillsInput.trim()]);
      setSkillsInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsTags(skillsTags.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (data: MemberFormData) => {
    onSubmit?.({ ...data, id: memberToEdit?.id, skills: skillsTags });
    form.reset();
    setSkillsTags([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{memberToEdit ? "Editar Membro" : "Novo Membro"}</DialogTitle>
          <DialogDescription>
            {memberToEdit
              ? "Atualize as informações do membro da equipe"
              : "Preencha as informações para adicionar um novo membro"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ana Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              rules={{ required: "Cargo é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desenvolvedora Frontend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                rules={{ 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ana@softrha.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: (11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: React"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" variant="outline" onClick={handleAddSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Pressione Enter ou clique no + para adicionar
              </FormDescription>
              {skillsTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillsTags.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
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
                {memberToEdit ? "Salvar Alterações" : "Adicionar Membro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
