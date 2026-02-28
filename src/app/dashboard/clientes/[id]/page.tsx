"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  FileText,
  FolderKanban,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Star,
  Globe,
  Code2,
  ShoppingCart,
  Smartphone,
  Brain,
  Palette,
  Search,
  Shield,
  Database,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatCNPJ, formatCPF, formatPhone, formatCEP } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

export default function ClienteDetalhes() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para modal de orçamento
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetStep, setBudgetStep] = useState(1);
  const [budgetData, setBudgetData] = useState({
    projectType: "",
    complexity: "",
    timeline: "",
    features: [] as string[],
    integrations: [] as string[],
    pages: 1,
    description: "",
    calculatedValue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/clientes/${params.id}/projetos`);
        if (!response.ok) throw new Error("Erro ao carregar dados");
        const data = await response.json();

        setClient(data.client);
        setProjects(data.projects);
        setStats(data.stats);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  // Opções de orçamento (mesmas do projeto original)
  const projectTypes = [
    { id: "landing", label: "Landing Page", icon: Globe, basePrice: 2500, desc: "Página única para conversão" },
    { id: "web", label: "Site Institucional", icon: Code2, basePrice: 5000, desc: "Múltiplas páginas" },
    { id: "ecommerce", label: "E-commerce", icon: ShoppingCart, basePrice: 12000, desc: "Loja virtual completa" },
    { id: "mobile", label: "App Mobile", icon: Smartphone, basePrice: 15000, desc: "iOS e Android" },
    { id: "software", label: "Software Web", icon: Brain, basePrice: 20000, desc: "Sistema complexo" },
    { id: "dashboard", label: "Dashboard", icon: Palette, basePrice: 8000, desc: "Painel administrativo" },
  ];

  const complexities = [
    { id: "simples", label: "Simples", multiplier: 1, desc: "Design básico, funcionalidades essenciais" },
    { id: "medio", label: "Médio", multiplier: 1.5, desc: "Design personalizado, integrações básicas" },
    { id: "complexo", label: "Complexo", multiplier: 2.5, desc: "Design avançado, múltiplas integrações, IA" },
  ];

  const timelines = [
    { id: "urgente", label: "Urgente", multiplier: 1.5, desc: "Entrega em 1-2 semanas úteis", weeks: "1-2" },
    { id: "normal", label: "Normal", multiplier: 1, desc: "Entrega em 3-6 semanas úteis", weeks: "3-6" },
    { id: "flexivel", label: "Flexível", multiplier: 0.9, desc: "Entrega em 6+ semanas úteis", weeks: "6+" },
  ];

  const featureList = [
    { id: "responsive", label: "Design Responsivo", icon: Globe, price: 500 },
    { id: "seo", label: "SEO Otimizado", icon: Search, price: 800 },
    { id: "auth", label: "Autenticação de Usuários", icon: Shield, price: 1500 },
    { id: "database", label: "Banco de Dados", icon: Database, price: 2000 },
    { id: "api", label: "Integração API Externa", icon: Code2, price: 1200 },
    { id: "payments", label: "Gateway de Pagamento", icon: DollarSign, price: 2500 },
    { id: "chat", label: "Chat em Tempo Real", icon: MessageSquare, price: 3000 },
    { id: "analytics", label: "Dashboard Analytics", icon: Star, price: 1800 },
    { id: "multilanguage", label: "Multi-idiomas", icon: Globe, price: 1500 },
    { id: "blog", label: "Sistema de Blog", icon: FileText, price: 1000 },
  ];

  const integrationsList = [
    { id: "whatsapp", label: "WhatsApp Business", price: 500 },
    { id: "google", label: "Google Analytics", price: 300 },
    { id: "facebook", label: "Facebook Pixel", price: 250 },
    { id: "email", label: "Email Marketing", price: 600 },
    { id: "crm", label: "CRM", price: 1000 },
    { id: "erp", label: "ERP", price: 1500 },
    { id: "pagamento", label: "Pagamento Online", price: 800 },
    { id: "redes", label: "Redes Sociais", price: 400 },
  ];

  const calculateBudget = () => {
    const projectType = projectTypes.find(p => p.id === budgetData.projectType);
    const complexity = complexities.find(c => c.id === budgetData.complexity);
    const timeline = timelines.find(t => t.id === budgetData.timeline);

    if (!projectType || !complexity || !timeline) return 0;

    // Cálculo base: preço do projeto × complexidade × timeline
    let basePrice = projectType.basePrice * complexity.multiplier * timeline.multiplier;

    // Adicionar custo por página (R$ 300 por página além da primeira)
    const pagesCost = Math.max(0, (budgetData.pages - 1)) * 300;

    // Adicionar features selecionadas
    const featuresTotal = budgetData.features.reduce((sum, featureId) => {
      const feature = featureList.find(f => f.id === featureId);
      return sum + (feature?.price || 0);
    }, 0);

    // Adicionar integrações selecionadas
    const integrationsTotal = budgetData.integrations.reduce((sum, integrationId) => {
      const integration = integrationsList.find(i => i.id === integrationId);
      return sum + (integration?.price || 0);
    }, 0);

    return Math.round(basePrice + pagesCost + featuresTotal + integrationsTotal);
  };

  const handleNextStep = () => {
    if (budgetStep < 7) {
      if (budgetStep === 6) {
        // Calcular valor final antes de ir para etapa 7
        const calculatedValue = calculateBudget();
        setBudgetData({ ...budgetData, calculatedValue });
      }
      setBudgetStep(budgetStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (budgetStep > 1) {
      setBudgetStep(budgetStep - 1);
    }
  };

  const isStepValid = () => {
    switch (budgetStep) {
      case 1:
        return true; // Dados do cliente já estão preenchidos
      case 2:
        return !!budgetData.projectType;
      case 3:
        return !!budgetData.complexity;
      case 4:
        return !!budgetData.timeline;
      case 5:
        return true; // Features são opcionais
      case 6:
        return true; // Integrações são opcionais
      default:
        return true;
    }
  };

  const handleCreateBudget = async () => {
    try {
      // Mapear para o formato do banco
      const complexityMap: Record<string, string> = {
        simples: "simples",
        medio: "medio",
        complexo: "complexo",
      };

      const timelineMap: Record<string, string> = {
        urgente: "urgente",
        normal: "normal",
        flexivel: "flexivel",
      };

      const response = await fetch("/api/orcamentos/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          name: client.name,
          projectType: budgetData.projectType,
          complexity: complexityMap[budgetData.complexity] || "medio",
          timeline: timelineMap[budgetData.timeline] || "normal",
          features: budgetData.features,
          integrations: budgetData.integrations,
          pages: budgetData.pages,
          details: budgetData.description,
          finalValue: budgetData.calculatedValue,
          estimatedMin: budgetData.calculatedValue * 0.9,
          estimatedMax: budgetData.calculatedValue * 1.1,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao criar orçamento");

      toast({
        title: "Orçamento criado!",
        description: "O orçamento foi criado com sucesso.",
        variant: "success",
      });

      setBudgetModalOpen(false);
      setBudgetStep(1);
      setBudgetData({
        projectType: "",
        complexity: "",
        timeline: "",
        features: [],
        integrations: [],
        pages: 0,
        description: "",
        calculatedValue: 0,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar orçamento",
        description: (error as any).message,
        variant: "destructive",
      });
    }
  };

  const openBudgetModal = () => {
    setBudgetStep(1);
    setBudgetData({
      projectType: "",
      complexity: "",
      timeline: "",
      features: [],
      integrations: [],
      pages: 1,
      description: "",
      calculatedValue: 0,
    });
    setBudgetModalOpen(true);
  };

  if (loading || !client) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    planning: "bg-gray-500",
    development: "bg-blue-500",
    review: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.name.toUpperCase()}</h1>
            <p className="text-muted-foreground">
              {client.documentType === "cpf" ? `CPF: ${formatCPF(String(client.document || ""))}` : `CNPJ: ${formatCNPJ(String(client.document || ""))}`}
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projetos</p>
                    <p className="text-2xl font-bold">{stats.totalProjects}</p>
                  </div>
                  <FolderKanban className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projetos Ativos</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.activeProjects}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projetos Concluídos</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completedProjects}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {stats.totalBudget.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Informações do Cliente */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Dados Pessoais</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-medium">{client.documentType === "cpf" ? formatCPF(String(client.document || "")) : formatCNPJ(String(client.document || ""))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contatos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Contatos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Emails</p>
                    <div className="space-y-2">
                      {client.emails?.map((email: any, index: number) => (
                        <div key={email.id || `email-${index}`} className="flex items-center gap-2">
                          <Badge variant={email.isPrimary ? "default" : "outline"}>
                            {email.type}
                          </Badge>
                          <span className="text-sm">{email.value}</span>
                          {email.isPrimary && <Badge variant="secondary">Principal</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Telefones</p>
                    <div className="space-y-2">
                      {client.phones?.map((phone: any, index: number) => (
                        <div key={phone.id || `phone-${index}`} className="flex items-center gap-2">
                          <Badge variant={phone.isPrimary ? "default" : "outline"}>
                            {phone.type}
                          </Badge>
                          <span className="text-sm">{formatPhone(String(phone.value || ""))}</span>
                          {phone.isPrimary && <Badge variant="secondary">Principal</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Endereço</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CEP</p>
                    <p className="font-medium">{client.zipCode ? formatCEP(String(client.zipCode || "")) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cidade/UF</p>
                    <p className="font-medium">{client.city} - {client.state}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">
                      {client.address}, {client.number}
                      {client.complement && ` - ${client.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{client.neighborhood}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={projects.length === 0 ? true : false}
                  onClick={() => router.push(`/dashboard/clientes/${client.id}/projetos`)}
                >
                  <FolderKanban className="h-4 w-4" />
                  Ver Projetos
                  {projects.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {projects.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={openBudgetModal}
                >
                  <DollarSign className="h-4 w-4" />
                  Novo Orçamento
                </Button>
              </CardContent>
            </Card>

            {/* Projetos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projetos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          <Badge
                            variant="secondary"
                            className={`${statusColors[project.status]} text-white text-xs`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>R$ {project.budget?.toLocaleString("pt-BR") || "0"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum projeto cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Orçamento */}
        <Dialog open={budgetModalOpen} onOpenChange={setBudgetModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Orçamento - {client?.name}</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar um orçamento para este cliente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Steps Indicator */}
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((step, index, arr) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-colors ${
                        step <= budgetStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step === 7 ? <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" /> : step}
                    </div>
                    {index < arr.length - 1 && (
                      <div
                        className={`w-6 md:w-12 h-0.5 mx-1 ${
                          step < budgetStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Dados do Cliente (preenchido automaticamente) */}
              {budgetStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Dados do Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Informações preenchidas automaticamente
                    </p>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome</Label>
                          <Input value={client?.name || ""} disabled />
                        </div>
                        <div>
                          <Label>Documento</Label>
                          <Input
                            value={
                              client?.documentType === "cpf"
                                ? formatCPF(client?.document || "")
                                : formatCNPJ(client?.document || "")
                            }
                            disabled
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={client?.emails?.[0]?.value || "Não informado"}
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input
                            value={client?.phones?.[0]?.value || "Não informado"}
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Endereço</Label>
                        <Input
                          value={
                            client?.address
                              ? `${client.address}, ${client.number}${client.complement ? ` - ${client.complement}` : ""} - ${client.neighborhood}`
                              : "Não informado"
                          }
                          disabled
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Tipo de Projeto */}
              {budgetStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Tipo de Projeto</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione o tipo de projeto que deseja criar
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {projectTypes.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          budgetData.projectType === type.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() =>
                          setBudgetData({ ...budgetData, projectType: type.id })
                        }
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                budgetData.projectType === type.id
                                  ? "bg-primary"
                                  : "bg-primary/10"
                              }`}
                            >
                              <type.icon
                                className={`h-6 w-6 ${
                                  budgetData.projectType === type.id
                                    ? "text-primary-foreground"
                                    : "text-primary"
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold">{type.label}</h4>
                              <p className="text-xs text-muted-foreground">
                                A partir de R$ {type.basePrice.toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Complexidade */}
              {budgetStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Complexidade</h3>
                    <p className="text-sm text-muted-foreground">
                      Nível de complexidade do projeto
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {complexities.map((comp) => (
                      <Card
                        key={comp.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          budgetData.complexity === comp.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() =>
                          setBudgetData({ ...budgetData, complexity: comp.id })
                        }
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  budgetData.complexity === comp.id
                                    ? "bg-primary"
                                    : "bg-primary/10"
                                }`}
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    budgetData.complexity === comp.id
                                      ? "text-primary-foreground"
                                      : "text-primary"
                                  }`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold">{comp.label}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {comp.desc}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {comp.multiplier}x
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Prazo */}
              {budgetStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Qual o prazo desejado?</h3>
                    <p className="text-muted-foreground">
                      O cálculo considera apenas dias úteis (segunda a sexta, sem feriados)
                    </p>
                  </div>

                  <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Como calculamos o prazo?
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Trabalhamos apenas com <strong>dias úteis (segunda a sexta-feira)</strong>,
                            excluindo <strong>feriados nacionais</strong>. O prazo final é calculado
                            somando os dias necessários conforme a complexidade e funcionalidades do seu projeto.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-4">
                    {timelines.map((timeline) => (
                      <motion.div
                        key={timeline.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            budgetData.timeline === timeline.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : ""
                          }`}
                          onClick={() =>
                            setBudgetData({ ...budgetData, timeline: timeline.id })
                          }
                        >
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div
                                className={`h-16 w-16 rounded-xl flex items-center justify-center ${
                                  budgetData.timeline === timeline.id
                                    ? "bg-primary"
                                    : "bg-primary/10"
                                }`}
                              >
                                {timeline.id === "urgente" && <Zap className="h-8 w-8" />}
                                {timeline.id === "normal" && <Clock className="h-8 w-8" />}
                                {timeline.id === "flexivel" && <Calendar className="h-8 w-8" />}
                              </div>
                              <div>
                                <h4 className="font-semibold">{timeline.label}</h4>
                                <p className="text-sm text-muted-foreground">{timeline.desc}</p>
                                <p className="text-xs text-primary/70 mt-1">
                                  {timeline.id === "urgente" && "5-10 dias úteis"}
                                  {timeline.id === "normal" && "15-30 dias úteis"}
                                  {timeline.id === "flexivel" && "30-60 dias úteis"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Features */}
              {budgetStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Funcionalidades</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione as funcionalidades desejadas (opcional)
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {featureList.map((feature) => {
                      const isSelected = budgetData.features.includes(feature.id);
                      return (
                        <Card
                          key={feature.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => {
                            const newFeatures = isSelected
                              ? budgetData.features.filter((f) => f !== feature.id)
                              : [...budgetData.features, feature.id];
                            setBudgetData({ ...budgetData, features: newFeatures });
                          }}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                  isSelected ? "bg-primary" : "bg-primary/10"
                                }`}
                              >
                                <feature.icon
                                  className={`h-5 w-5 ${
                                    isSelected ? "text-primary-foreground" : "text-primary"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{feature.label}</h4>
                                <p className="text-xs text-muted-foreground">
                                  +R$ {feature.price.toLocaleString("pt-BR")}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 6: Integrações */}
              {budgetStep === 6 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Integrações</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione as integrações desejadas (opcional)
                    </p>
                  </div>

                  {/* Quantidade de Páginas */}
                  <Card className="border-primary bg-primary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Quantidade de Páginas Estimada</CardTitle>
                      </div>
                      <CardDescription>
                        Quantas páginas o projeto deve ter?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setBudgetData({ ...budgetData, pages: Math.max(1, budgetData.pages - 1) })}
                          disabled={budgetData.pages <= 1}
                        >
                          <span className="text-lg font-bold">-</span>
                        </Button>
                        <div className="flex-1 text-center">
                          <p className="text-3xl font-bold text-primary">{budgetData.pages}</p>
                          <p className="text-xs text-muted-foreground">
                            {budgetData.pages === 1 ? 'página' : 'páginas'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setBudgetData({ ...budgetData, pages: Math.min(50, budgetData.pages + 1) })}
                          disabled={budgetData.pages >= 50}
                        >
                          <span className="text-lg font-bold">+</span>
                        </Button>
                      </div>
                      {budgetData.pages > 1 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +R$ {(Math.max(0, budgetData.pages - 1) * 300).toLocaleString("pt-BR")} por páginas adicionais
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {integrationsList.map((integration) => {
                      const isSelected = budgetData.integrations.includes(integration.id);
                      return (
                        <Card
                          key={integration.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => {
                            const newIntegrations = isSelected
                              ? budgetData.integrations.filter((i) => i !== integration.id)
                              : [...budgetData.integrations, integration.id];
                            setBudgetData({ ...budgetData, integrations: newIntegrations });
                          }}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-sm">{integration.label}</h4>
                                <p className="text-xs text-muted-foreground">
                                  +R$ {integration.price.toLocaleString("pt-BR")}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 7: Resumo e Valor */}
              {budgetStep === 7 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2 mb-4">
                    <h3 className="text-lg font-semibold">Orçamento Calculado</h3>
                    <p className="text-sm text-muted-foreground">
                      Revise as informações antes de criar
                    </p>
                  </div>
                  <Card className="bg-primary/5 border-primary">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Valor do Orçamento
                          </p>
                          <p className="text-4xl font-bold text-primary">
                            R$ {calculateBudget().toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Separator />
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="text-left">
                            <p className="text-muted-foreground">Projeto</p>
                            <p className="font-medium">
                              {projectTypes.find((p) => p.id === budgetData.projectType)
                                ?.label || "-"}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-muted-foreground">Complexidade</p>
                            <p className="font-medium">
                              {complexities.find((c) => c.id === budgetData.complexity)
                                ?.label || "-"}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-muted-foreground">Prazo</p>
                            <p className="font-medium">
                              {timelines.find((t) => t.id === budgetData.timeline)
                                ?.label || "-"}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-muted-foreground">Páginas</p>
                            <p className="font-medium">{budgetData.pages}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-medium">{client?.name || "-"}</p>
                          </div>
                        </div>
                        {(budgetData.features.length > 0 || budgetData.integrations.length > 0) && (
                          <>
                            <Separator />
                            {budgetData.features.length > 0 && (
                              <div className="text-left">
                                <p className="text-muted-foreground mb-2">Funcionalidades</p>
                                <div className="flex flex-wrap gap-2">
                                  {budgetData.features.map((featureId) => {
                                    const feature = featureList.find((f) => f.id === featureId);
                                    return (
                                      <Badge key={featureId} variant="secondary" className="text-xs">
                                        {feature?.label}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {budgetData.integrations.length > 0 && (
                              <div className="text-left">
                                <p className="text-muted-foreground mb-2">Integrações</p>
                                <div className="flex flex-wrap gap-2">
                                  {budgetData.integrations.map((integrationId) => {
                                    const integration = integrationsList.find((i) => i.id === integrationId);
                                    return (
                                      <Badge key={integrationId} variant="secondary" className="text-xs">
                                        {integration?.label}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={budgetStep === 1}
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                {budgetStep < 7 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={!isStepValid()}
                    type="button"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateBudget}
                    className="bg-green-600 hover:bg-green-700"
                    type="button"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Criar Orçamento
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
