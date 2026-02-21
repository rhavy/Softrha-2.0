"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Mail, Phone, MapPin, User, Building } from "lucide-react";
import { formatCPF, formatCNPJ, formatCEP, formatPhone, validateCPF, validateCNPJ } from "@/lib/validators";

interface ContactField {
  id?: string;
  value: string;
  type: string;
  isPrimary: boolean;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  documentType: "cpf" | "cnpj";
  document: string;
  emails: ContactField[];
  phones: ContactField[];
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  status: "active" | "inactive";
  notes: string;
}

interface ClientData extends ClientFormData {
  id?: string;
  name?: string;
  projectsCount?: number;
}

interface NovoClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ClientData) => void;
  clientToEdit?: ClientData | null;
}

const ufOptions = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function NovoClienteModal({
  open,
  onOpenChange,
  onSubmit,
  clientToEdit,
}: NovoClienteModalProps) {
  const { toast } = useToast();
  const [loadingCEP, setLoadingCEP] = useState(false);

  const form = useForm<ClientFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      documentType: "cpf",
      document: "",
      emails: [{ id: "1", value: "", type: "trabalho", isPrimary: true }],
      phones: [{ id: "1", value: "", type: "whatsapp", isPrimary: true }],
      zipCode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      status: "active",
      notes: "",
    },
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  // Carregar dados do cliente quando estiver editando
  useEffect(() => {
    if (clientToEdit && open) {
      form.reset({
        firstName: clientToEdit.firstName,
        lastName: clientToEdit.lastName,
        documentType: clientToEdit.documentType as "cpf" | "cnpj",
        document: clientToEdit.document,
        emails: clientToEdit.emails?.length > 0 ? clientToEdit.emails : [{ id: "1", value: "", type: "trabalho", isPrimary: true }],
        phones: clientToEdit.phones?.length > 0 ? clientToEdit.phones : [{ id: "1", value: "", type: "whatsapp", isPrimary: true }],
        zipCode: clientToEdit.zipCode || "",
        address: clientToEdit.address || "",
        number: clientToEdit.number || "",
        complement: clientToEdit.complement || "",
        neighborhood: clientToEdit.neighborhood || "",
        city: clientToEdit.city || "",
        state: clientToEdit.state || "",
        status: clientToEdit.status as "active" | "inactive",
        notes: clientToEdit.notes || "",
      });
    } else if (!clientToEdit && open) {
      form.reset({
        firstName: "",
        lastName: "",
        documentType: "cpf",
        document: "",
        emails: [{ id: "1", value: "", type: "trabalho", isPrimary: true }],
        phones: [{ id: "1", value: "", type: "whatsapp", isPrimary: true }],
        zipCode: "",
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        status: "active",
        notes: "",
      });
    }
  }, [clientToEdit, open, form]);

  // Busca CEP
  const handleCEPBlur = async () => {
    const zipCode = form.getValues("zipCode").replace(/\D/g, "");
    if (zipCode.length === 8 && !loadingCEP) {
      setLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        const data = await response.json();
        if (!data.erro) {
          form.setValue("address", data.logradouro);
          form.setValue("neighborhood", data.bairro);
          form.setValue("city", data.localidade);
          form.setValue("state", data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  // Formata documento
  const handleDocumentChange = (value: string, onChange: (value: string) => void) => {
    const documentType = form.getValues("documentType");
    const formatted = documentType === "cpf" ? formatCPF(value) : formatCNPJ(value);
    onChange(formatted);
  };

  const handleSubmit = (data: ClientFormData) => {
    onSubmit?.({ ...data, id: clientToEdit?.id });
    toast({
      title: clientToEdit ? "Cliente atualizado!" : "Cliente cadastrado!",
      description: clientToEdit 
        ? "As informações do cliente foram atualizadas com sucesso."
        : "O cliente foi cadastrado com sucesso.",
      variant: "success",
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{clientToEdit ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {clientToEdit
              ? "Atualize as informações do cliente"
              : "Preencha as informações para cadastrar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Dados Pessoais</CardTitle>
                </div>
                <CardDescription>Informações básicas do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    rules={{ required: "Nome é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    rules={{ required: "Sobrenome é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="cnpj">CNPJ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document"
                    rules={{ 
                      required: "Documento é obrigatório",
                      validate: (value) => {
                        const type = form.getValues("documentType");
                        const clean = value.replace(/\D/g, "");
                        if (type === "cpf") return validateCPF(clean) || "CPF inválido";
                        return validateCNPJ(clean) || "CNPJ inválido";
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("documentType") === "cpf" ? "CPF" : "CNPJ"} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={form.watch("documentType") === "cpf" ? "000.000.000-00" : "00.000.000/0001-00"}
                            {...field}
                            onChange={(e) => handleDocumentChange(e.target.value, field.onChange)}
                          />
                        </FormControl>
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
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contatos */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Contatos</CardTitle>
                </div>
                <CardDescription>Adicione múltiplos emails e telefones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emails */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Emails</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendEmail({ id: Date.now().toString(), value: "", type: "trabalho", isPrimary: false })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {emailFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`emails.${index}.value`}
                        rules={{ required: "Email é obrigatório" }}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="email@exemplo.com"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`emails.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pessoal">Pessoal</SelectItem>
                                <SelectItem value="trabalho">Trabalho</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmail(index)}
                        disabled={emailFields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Telefones */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Telefones</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPhone({ id: Date.now().toString(), value: "", type: "whatsapp", isPrimary: false })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {phoneFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`phones.${index}.value`}
                        rules={{ required: "Telefone é obrigatório" }}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="(00) 00000-0000"
                                {...field}
                                onChange={(e) => {
                                  const formatted = formatPhone(e.target.value);
                                  field.onChange(formatted);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`phones.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pessoal">Pessoal</SelectItem>
                                <SelectItem value="trabalho">Trabalho</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="convencional">Convencional</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(index)}
                        disabled={phoneFields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Endereço</CardTitle>
                </div>
                <CardDescription>Endereço completo do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            {...field}
                            onBlur={() => {
                              field.onBlur();
                              handleCEPBlur();
                            }}
                            onChange={(e) => {
                              const formatted = formatCEP(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        {loadingCEP && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ required: "Endereço é obrigatório" }}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Logradouro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="number"
                    rules={{ required: "Número é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número *</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Apto, Sala, etc." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    rules={{ required: "Bairro é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    rules={{ required: "Estado é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ufOptions.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
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
                    name="city"
                    rules={{ required: "Cidade é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Observações</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o cliente..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {clientToEdit ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
