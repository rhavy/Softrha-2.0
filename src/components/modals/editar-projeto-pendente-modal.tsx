"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface ProjetoPendenteData {
  id: string;
  name: string;
  budget?: number | null;
  dueDate?: string | null;
  startDate?: string | null;
}

interface EditarProjetoPendenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ProjetoPendenteData>) => void;
  projectToEdit: ProjetoPendenteData | null;
}

export function EditarProjetoPendenteModal({
  open,
  onOpenChange,
  onSubmit,
  projectToEdit,
}: EditarProjetoPendenteModalProps) {
  const { toast } = useToast();
  const [formattedBudget, setFormattedBudget] = useState("");

  const form = useForm<Partial<ProjetoPendenteData>>({
    defaultValues: {
      budget: 0,
      dueDate: "",
      startDate: "",
    },
  });

  useEffect(() => {
    if (open && projectToEdit) {
      // Formatar datas para YYYY-MM-DD
      const formatDate = (date: string | null | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Formatar valor para moeda brasileira
      const budgetValue = projectToEdit.budget || 0;
      setFormattedBudget(formatCurrency(budgetValue));

      form.reset({
        budget: budgetValue,
        dueDate: formatDate(projectToEdit.dueDate),
        startDate: formatDate(projectToEdit.startDate),
      });
    }
  }, [projectToEdit, open, form]);

  // Formatar valor para moeda brasileira (R$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Converter string formatada para número
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/\D/g, "")) / 100;
  };

  const handleSubmit = (data: Partial<ProjetoPendenteData>) => {
    if (!projectToEdit?.id) return;

    onSubmit({
      ...data,
      id: projectToEdit.id,
    });

    toast({
      title: "Projeto atualizado!",
      description: "As informações do projeto foram atualizadas com sucesso.",
      variant: "success",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Projeto Pendente</DialogTitle>
          <DialogDescription>
            Atualize o valor, prazo e data de início do projeto "{projectToEdit?.name}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budget"
              rules={{
                required: "Valor é obrigatório",
                min: { value: 0, message: "Valor deve ser maior ou igual a zero" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Projeto (R$)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        type="text"
                        placeholder="0,00"
                        className="pl-10"
                        value={formattedBudget}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = parseCurrency(value);
                          setFormattedBudget(formatCurrency(numericValue));
                          field.onChange(numericValue);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Valor total do projeto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              rules={{ required: "Data de entrega é obrigatória" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Entrega</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Prazo final para entrega do projeto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início do Projeto</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Data de início do projeto (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
