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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentFormData {
  name: string;
  type: string;
  size: string;
  folder: string;
  author: string;
  url: string;
}

interface DocumentData extends DocumentFormData {
  id?: string;
}

interface NovoDocumentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: DocumentData) => void;
  documentToEdit?: DocumentData | null;
}

const typeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Documento" },
  { value: "image", label: "Imagem" },
  { value: "sheet", label: "Planilha" },
];

const folderOptions = [
  { value: "Propostas", label: "Propostas" },
  { value: "Contratos", label: "Contratos" },
  { value: "Design", label: "Design" },
  { value: "Documentação", label: "Documentação" },
  { value: "Planejamento", label: "Planejamento" },
  { value: "Financeiro", label: "Financeiro" },
];

export function NovoDocumentoModal({
  open,
  onOpenChange,
  onSubmit,
  documentToEdit,
}: NovoDocumentoModalProps) {
  const form = useForm<DocumentFormData>({
    defaultValues: {
      name: "",
      type: "pdf",
      size: "",
      folder: "Propostas",
      author: "",
      url: "",
    },
  });

  // Carregar dados do documento quando estiver editando
  React.useEffect(() => {
    if (documentToEdit && open) {
      form.reset({
        name: documentToEdit.name,
        type: documentToEdit.type,
        size: documentToEdit.size,
        folder: documentToEdit.folder,
        author: documentToEdit.author,
        url: documentToEdit.url || "",
      });
    } else if (!documentToEdit && open) {
      form.reset({
        name: "",
        type: "pdf",
        size: "",
        folder: "Propostas",
        author: "",
        url: "",
      });
    }
  }, [documentToEdit, open, form]);

  const handleSubmit = (data: DocumentFormData) => {
    onSubmit?.({ ...data, id: documentToEdit?.id });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{documentToEdit ? "Editar Documento" : "Novo Documento"}</DialogTitle>
          <DialogDescription>
            {documentToEdit
              ? "Atualize as informações do documento"
              : "Preencha as informações para adicionar um novo documento"}
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
                  <FormLabel>Nome do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Proposta Comercial" {...field} />
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
                name="folder"
                rules={{ required: "Pasta é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a pasta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {folderOptions.map((option) => (
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
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2.4 MB" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deixe em branco se não souber
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                rules={{ required: "Autor é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ana Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link para download ou visualização do documento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {documentToEdit ? "Salvar Alterações" : "Adicionar Documento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
