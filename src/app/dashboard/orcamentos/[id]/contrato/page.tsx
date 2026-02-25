"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileSignature,
  Mail,
  Phone,
  User,
  Building,
  DollarSign,
  Send,
  CheckCircle2,
  Copy,
  FileText,
  FileCheck,
  Eye,
  Download,
  Printer,
  X,
  Plus
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { ContratoCombinado } from "@/components/dashboard/contract-templates";
import dynamic from 'next/dynamic';

// Importar html2pdf dinamicamente para evitar erros de SSR
const html2pdf = typeof window !== 'undefined' ? require('html2pdf.js') : null;
const getHtml2Pdf = () => {
  if (typeof html2pdf === 'function') return html2pdf;
  if (html2pdf && typeof html2pdf.default === 'function') return html2pdf.default;
  return html2pdf;
};

interface Budget {
  id: string;
  projectId: string | null;
  projectType: string;
  complexity: string;
  timeline: string;
  features: any;
  integrations: any;
  pages: number;
  estimatedMin: number;
  estimatedMax: number;
  finalValue: number | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  company: string | null;
  details: string | null;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  contract?: any;
  technologies?: string[] | any;
}

export default function CriarContratoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Dados da SoftRha (Editáveis)
  const [softrhaData, setSoftrhaData] = useState({
    name: "SoftRha IT Solutions",
    cnpj: "56.789.012/0001-34",
    address: "Av. Paulista, 1000, 15º Andar - Bela Vista, São Paulo - SP",
    representative: "Rodrigo Rha",
    email: "contato@softrha.com",
    website: "www.softrha.com"
  });

  // Dados do Cliente (Editáveis)
  const [clientData, setClientData] = useState({
    name: "",
    company: "",
    document: "",
    address: "",
    representative: "",
    email: "",
    phone: ""
  });

  // Dados do Projeto (Sincronizados com o orçamento)
  const [projectData, setProjectData] = useState({
    type: "",
    complexity: "",
    timeline: "",
    features: [] as string[],
    integrations: [] as string[],
    technologies: [] as string[],
    pages: 1,
    finalValue: 0,
    details: ""
  });
  const [techInput, setTechInput] = useState("");

  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBudget();
    }
  }, [params.id]);

  const fetchBudget = async () => {
    try {
      const response = await fetch(`/api/orcamentos/${params.id}`);
      if (!response.ok) throw new Error("Erro ao buscar orçamento");
      const data = await response.json();
      setBudget(data);

      // Verificar se existe contrato com dados salvos
      const hasContractMetadata = data.contract?.metadata;
      
      // Dados do cliente: usar dados salvos do contrato se existirem, senão usar dados do orçamento
      if (hasContractMetadata && data.contract.metadata.client) {
        const savedClient = data.contract.metadata.client;
        setClientData({
          name: savedClient.name || data.clientName || "",
          company: savedClient.company || data.company || "",
          document: savedClient.document || "",
          address: savedClient.address || "",
          representative: savedClient.representative || data.clientName || "",
          email: savedClient.email || data.clientEmail || "",
          phone: savedClient.phone || data.clientPhone || ""
        });
      } else {
        setClientData({
          name: data.clientName || "",
          company: data.company || "",
          document: "",
          address: "",
          representative: data.clientName || "",
          email: data.clientEmail || "",
          phone: data.clientPhone || ""
        });
      }

      // Dados do projeto: usar dados salvos do contrato se existirem, senão usar dados do orçamento
      if (hasContractMetadata && data.contract.metadata.project) {
        const savedProject = data.contract.metadata.project;
        setProjectData({
          type: savedProject.type || data.projectType || "",
          complexity: savedProject.complexity || data.complexity || "",
          timeline: savedProject.timeline || data.timeline || "",
          features: Array.isArray(savedProject.features) ? savedProject.features : (Array.isArray(data.features) ? data.features : []),
          integrations: Array.isArray(savedProject.integrations) ? savedProject.integrations : (Array.isArray(data.integrations) ? data.integrations : []),
          technologies: savedProject.technologies || data.technologies || [],
          pages: savedProject.pages || data.pages || 1,
          finalValue: savedProject.finalValue || data.finalValue || data.estimatedMax || 0,
          details: savedProject.details || data.details || ""
        });
      } else {
        setProjectData({
          type: data.projectType || "",
          complexity: data.complexity || "",
          timeline: data.timeline || "",
          features: Array.isArray(data.features) ? data.features : [],
          integrations: Array.isArray(data.integrations) ? data.integrations : [],
          technologies: data.technologies || [],
          pages: data.pages || 1,
          finalValue: data.finalValue || data.estimatedMax || 0,
          details: data.details || ""
        });
      }

      // Dados da SoftRha: usar dados salvos do contrato se existirem
      if (hasContractMetadata && data.contract.metadata.softrha) {
        const savedSoftrha = data.contract.metadata.softrha;
        setSoftrhaData({
          name: savedSoftrha.name || "SoftRha IT Solutions",
          cnpj: savedSoftrha.cnpj || "56.789.012/0001-34",
          address: savedSoftrha.address || "Av. Paulista, 1000, 15º Andar - Bela Vista, São Paulo - SP",
          representative: savedSoftrha.representative || "Rodrigo Rha",
          email: savedSoftrha.email || "contato@softrha.com",
          website: savedSoftrha.website || "www.softrha.com"
        });
      }

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o orçamento",
        variant: "destructive",
      });
      router.push("/dashboard/orcamentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("contrato-combinado");
    const pdfLib = getHtml2Pdf();

    if (!element) {
      toast({ title: "Erro", description: "Elemento do documento não encontrado.", variant: "destructive" });
      return;
    }

    if (!pdfLib) {
      toast({ title: "Erro", description: "Biblioteca de PDF não carregada.", variant: "destructive" });
      return;
    }

    const opt = {
      margin: 10,
      filename: `Contrato_Completo_${clientData.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      toast({ title: "Iniciando...", description: "Gerando seu PDF, aguarde um momento." });
      await pdfLib().set(opt).from(element).save();
      toast({ title: "PDF Gerado!", description: "O documento foi baixado com sucesso." });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({ title: "Erro", description: "Falha ao gerar o PDF. Verifique o console.", variant: "destructive" });
    }
  };

  const handleCreateContract = async () => {
    try {
      setIsCreating(true);

      // Gerar PDF em base64 do contrato combinado
      const element = document.getElementById("contrato-combinado");

      let base64Pdf = "";
      const pdfLib = getHtml2Pdf();
      if (element && pdfLib) {
        const opt = {
          margin: 10,
          filename: 'contrato_completo.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        base64Pdf = await pdfLib().set(opt).from(element).output('datauristring');
      }

      const response = await fetch(`/api/orcamentos/${params.id}/contrato`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: "combinado",
          softrhaData,
          clientData,
          projectData,
          sendEmail,
          sendWhatsApp,
          content: base64Pdf // PDF combinado gerado
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar contrato");
      }

      if (result.updated) {
        toast({
          title: "Contrato atualizado!",
          description: "Dados atualizados e enviado com sucesso para o cliente",
        });
      } else {
        toast({
          title: "Contrato criado!",
          description: "Contrato enviado com sucesso para o cliente",
        });
      }

      if (sendWhatsApp && result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank");
      }

      setTimeout(() => {
        router.push(`/dashboard/orcamentos/${params.id}`);
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar contrato",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!budget) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileSignature className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Orçamento não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/orcamentos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Configurar Documento</h1>
              <p className="text-muted-foreground">
                {budget.projectType} - {budget.clientName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="gap-2 hidden md:flex">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Editor Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações do Documento</CardTitle>
                <CardDescription>Edite os dados que aparecerão no documento</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="template" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="template">Template</TabsTrigger>
                    <TabsTrigger value="softrha">SoftRha</TabsTrigger>
                    <TabsTrigger value="cliente">Cliente</TabsTrigger>
                  </TabsList>

                  <TabsContent value="template" className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg border bg-indigo-50 border-indigo-200">
                        <div className="flex items-start gap-3">
                          <FileCheck className="h-5 w-5 text-indigo-600 mt-0.5" />
                          <div>
                            <Label className="text-sm font-semibold text-indigo-900">Documento Combinado</Label>
                            <p className="text-xs text-indigo-700 mt-1">
                              O documento final incluirá em um único PDF:
                            </p>
                            <ul className="text-xs text-indigo-700 mt-2 space-y-1">
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                Capa com resumo da proposta
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                Detalhes técnicos e escopo completo
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                Contrato unificado com cláusulas
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Dados do Projeto</Label>
                      <div className="space-y-2">
                        <Label className="text-xs">Valor Final (R$)</Label>
                        <Input
                          type="number"
                          value={projectData.finalValue}
                          onChange={(e) => setProjectData({ ...projectData, finalValue: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Prazo Estimado</Label>
                        <Input
                          value={projectData.timeline}
                          onChange={(e) => setProjectData({ ...projectData, timeline: e.target.value })}
                        />
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-3">
                        <Label className="text-xs">Tecnologias do Projeto</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: React, Node.js"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (techInput.trim()) {
                                  setProjectData({
                                    ...projectData,
                                    technologies: [...projectData.technologies, techInput.trim()]
                                  });
                                  setTechInput("");
                                }
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            type="button"
                            onClick={() => {
                              if (techInput.trim()) {
                                setProjectData({
                                  ...projectData,
                                  technologies: [...projectData.technologies, techInput.trim()]
                                });
                                setTechInput("");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1 font-sans">
                          {projectData.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                              {tech}
                              <button
                                onClick={() => {
                                  setProjectData({
                                    ...projectData,
                                    technologies: projectData.technologies.filter((_, i) => i !== index)
                                  });
                                }}
                                className="rounded-full hover:bg-muted p-0.5"
                                type="button"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-2 mt-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Sugestões Rápidas</Label>
                          <div className="flex flex-wrap gap-1">
                            {["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Stripe", "Auth.js", "Vercel"].map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  if (!projectData.technologies.includes(suggestion)) {
                                    setProjectData({
                                      ...projectData,
                                      technologies: [...projectData.technologies, suggestion]
                                    });
                                  }
                                }}
                                className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 hover:bg-slate-100 transition-colors"
                              >
                                + {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="softrha" className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">CNPJ</Label>
                        <Input value={softrhaData.cnpj} onChange={(e) => setSoftrhaData({ ...softrhaData, cnpj: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Endereço Completo</Label>
                        <Textarea rows={3} value={softrhaData.address} onChange={(e) => setSoftrhaData({ ...softrhaData, address: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Representante Legal</Label>
                        <Input value={softrhaData.representative} onChange={(e) => setSoftrhaData({ ...softrhaData, representative: e.target.value })} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cliente" className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Nome / Empresa</Label>
                        <Input value={clientData.company || clientData.name} onChange={(e) => setClientData({ ...clientData, company: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">CPF / CNPJ</Label>
                        <Input placeholder="00.000.000/0001-00" value={clientData.document} onChange={(e) => setClientData({ ...clientData, document: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Endereço</Label>
                        <Textarea rows={3} placeholder="Endereço completo do cliente" value={clientData.address} onChange={(e) => setClientData({ ...clientData, address: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Responsável</Label>
                        <Input value={clientData.representative} onChange={(e) => setClientData({ ...clientData, representative: e.target.value })} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Envio</CardTitle>
                {budget?.contract && (
                  <CardDescription className="flex items-start gap-2 text-amber-600">
                    <FileCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Contrato já foi enviado anteriormente em{" "}
                      {new Date(budget.contract.sentAt || budget.contract.createdAt).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(budget.contract.sentAt || budget.contract.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.
                      Ao clicar em "Finalizar e Enviar", os dados serão atualizados e um novo e-mail será enviado ao cliente.
                    </span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="h-4 w-4" />
                    <Label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer font-normal">
                      <Mail className="h-4 w-4" /> Enviar por E-mail
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sendWa" checked={sendWhatsApp} onChange={(e) => setSendWhatsApp(e.target.checked)} className="h-4 w-4" />
                    <Label htmlFor="sendWa" className="flex items-center gap-2 cursor-pointer font-normal">
                      <Phone className="h-4 w-4" /> Enviar no WhatsApp
                    </Label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreateContract}
                  disabled={isCreating}
                  variant={budget?.contract ? "outline" : "default"}
                >
                  {isCreating ? "Processando..." : budget?.contract ? "Atualizar e Reenviar" : "Finalizar e Enviar"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-8">
            <div className="sticky top-24 border rounded-xl overflow-hidden shadow-xl bg-slate-200 p-4 md:p-8 min-h-[1000px]">
              <div className="flex items-center justify-center mb-4 text-slate-500 gap-2">
                <Eye className="h-4 w-4" /> Visualização do Documento
              </div>

              <div className="scale-[0.8] md:scale-100 origin-top bg-white shadow-2xl mx-auto overflow-hidden">
                <ContratoCombinado
                  client={clientData}
                  softrha={softrhaData}
                  project={projectData}
                  date={new Date()}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
