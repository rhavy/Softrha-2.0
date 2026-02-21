"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Code2,
  Smartphone,
  Brain,
  Palette,
  Cloud,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Clock,
  Users,
  Star,
  Shield,
  Zap,
  Database,
  Globe,
  ShoppingCart,
  MessageSquare,
  FileText,
  Calendar,
  Send,
  Calculator,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Feriados nacionais fixos do Brasil (mês/dia)
const FIXED_HOLIDAYS = [
  { month: 0, day: 1 },    // Confraternização Universal
  { month: 3, day: 21 },   // Tiradentes
  { month: 4, day: 1 },    // Dia do Trabalho
  { month: 8, day: 7 },    // Independência do Brasil
  { month: 9, day: 12 },   // Nossa Senhora Aparecida
  { month: 10, day: 2 },   // Finados
  { month: 10, day: 15 },  // Proclamação da República
  { month: 11, day: 20 },  // Dia da Consciência Negra
  { month: 11, day: 25 },  // Natal
];

// Função para calcular a Páscoa (usada para calcular feriados móveis)
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

// Função para obter feriados móveis de um ano
function getMobileHolidays(year: number): { month: number; day: number }[] {
  const easter = getEasterDate(year);
  const carnaval = new Date(easter);
  carnaval.setDate(easter.getDate() - 47);
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  const sextaSanta = new Date(easter);
  sextaSanta.setDate(easter.getDate() - 2);

  return [
    { month: carnaval.getMonth(), day: carnaval.getDate() },
    { month: sextaSanta.getMonth(), day: sextaSanta.getDate() },
    { month: corpusChristi.getMonth(), day: corpusChristi.getDate() },
  ];
}

// Função para verificar se uma data é feriado
function isHoliday(date: Date): boolean {
  const day = date.getDate();
  const month = date.getMonth();
  const weekday = date.getDay();
  const year = date.getFullYear();

  // Verifica se é fim de semana (0 = Domingo, 6 = Sábado)
  if (weekday === 0 || weekday === 6) return true;

  // Verifica feriados fixos
  const isFixedHoliday = FIXED_HOLIDAYS.some(h => h.month === month && h.day === day);
  if (isFixedHoliday) return true;

  // Verifica feriados móveis
  const mobileHolidays = getMobileHolidays(year);
  const isMobileHoliday = mobileHolidays.some(h => h.month === month && h.day === day);
  if (isMobileHoliday) return true;

  return false;
}

// Função para calcular dias úteis em um período
function calculateBusinessDays(startDate: Date, businessDays: number): number {
  let count = 0;
  let current = new Date(startDate);

  while (count < businessDays) {
    if (!isHoliday(current)) {
      count++;
    }
    if (count < businessDays) {
      current.setDate(current.getDate() + 1);
    }
  }

  return businessDays;
}

// Função para obter a data final considerando dias úteis
function getDeliveryDate(startDate: Date, businessDays: number): Date {
  let count = 0;
  let current = new Date(startDate);

  while (count < businessDays) {
    if (!isHoliday(current)) {
      count++;
    }
    if (count < businessDays) {
      current.setDate(current.getDate() + 1);
    }
  }

  return current;
}

type ProjectType = "web" | "mobile" | "software" | "landing" | "ecommerce" | null;
type Complexity = "simples" | "medio" | "complexo" | null;
type Timeline = "urgente" | "normal" | "flexivel" | null;

interface BudgetState {
  step: number;
  projectType: ProjectType;
  complexity: Complexity;
  timeline: Timeline;
  features: string[];
  pages: number;
  integrations: string[];
  firstName: string;
  lastName: string;
  document: string;
  documentType: "cpf" | "cnpj";
  email: string;
  phone: string;
  company: string;
  details: string;
}

// Valor da diária do desenvolvedor (R$)
const DEVELOPER_DAY_RATE = 450;

// Dias úteis estimados por tipo de projeto (base para projeto simples)
const PROJECT_BASE_DAYS: Record<string, number> = {
  landing: 5,      // 5 dias úteis
  web: 12,         // 12 dias úteis
  ecommerce: 25,   // 25 dias úteis
  mobile: 30,      // 30 dias úteis
  software: 40,    // 40 dias úteis
  dashboard: 15,   // 15 dias úteis
};

// Multiplicador de complexidade sobre os dias
const COMPLEXITY_DAYS_MULTIPLIER: Record<string, number> = {
  simples: 1,
  medio: 1.5,
  complexo: 2.5,
};

// Dias úteis para cada timeline
const TIMELINE_DAYS: Record<string, { min: number; max: number; multiplier: number }> = {
  urgente: { min: 5, max: 10, multiplier: 1.5 },    // 1-2 semanas úteis
  normal: { min: 15, max: 30, multiplier: 1 },      // 3-6 semanas úteis
  flexivel: { min: 30, max: 60, multiplier: 0.9 },  // 6+ semanas úteis
};

export default function Orcamento() {
  const { toast } = useToast();
  const [budget, setBudget] = useState<BudgetState>({
    step: 1,
    projectType: null,
    complexity: null,
    timeline: null,
    features: [],
    pages: 1,
    integrations: [],
    firstName: "",
    lastName: "",
    document: "",
    documentType: "cpf",
    email: "",
    phone: "",
    company: "",
    details: "",
  });

  const [calculated, setCalculated] = useState(false);
  const [isVerifyingClient, setIsVerifyingClient] = useState(false);

  const projectTypes = [
    { id: "landing", label: "Landing Page", icon: Globe, basePrice: 2500, desc: "Página única para conversão", days: PROJECT_BASE_DAYS.landing },
    { id: "web", label: "Site Institucional", icon: Code2, basePrice: 5000, desc: "Múltiplas páginas", days: PROJECT_BASE_DAYS.web },
    { id: "ecommerce", label: "E-commerce", icon: ShoppingCart, basePrice: 12000, desc: "Loja virtual completa", days: PROJECT_BASE_DAYS.ecommerce },
    { id: "mobile", label: "App Mobile", icon: Smartphone, basePrice: 15000, desc: "iOS e Android", days: PROJECT_BASE_DAYS.mobile },
    { id: "software", label: "Software Web", icon: Brain, basePrice: 20000, desc: "Sistema complexo", days: PROJECT_BASE_DAYS.software },
    { id: "dashboard", label: "Dashboard", icon: Palette, basePrice: 8000, desc: "Painel administrativo", days: PROJECT_BASE_DAYS.dashboard },
  ];

  const complexities = [
    { id: "simples", label: "Simples", multiplier: 1, desc: "Design básico, funcionalidades essenciais", daysMultiplier: COMPLEXITY_DAYS_MULTIPLIER.simples },
    { id: "medio", label: "Médio", multiplier: 1.5, desc: "Design personalizado, integrações básicas", daysMultiplier: COMPLEXITY_DAYS_MULTIPLIER.medio },
    { id: "complexo", label: "Complexo", multiplier: 2.5, desc: "Design avançado, múltiplas integrações, IA", daysMultiplier: COMPLEXITY_DAYS_MULTIPLIER.complexo },
  ];

  const timelines = [
    { id: "urgente", label: "Urgente", multiplier: 1.5, desc: "Entrega em 1-2 semanas úteis", icon: Zap, days: TIMELINE_DAYS.urgente },
    { id: "normal", label: "Normal", multiplier: 1, desc: "Entrega em 3-6 semanas úteis", icon: Clock, days: TIMELINE_DAYS.normal },
    { id: "flexivel", label: "Flexível", multiplier: 0.9, desc: "Entrega em 6+ semanas úteis", icon: Calendar, days: TIMELINE_DAYS.flexivel },
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
    { id: "email", label: "Email Marketing", price: 600 },
    { id: "crm", label: "CRM", price: 1500 },
    { id: "erp", label: "ERP", price: 2500 },
    { id: "payment", label: "Pagamentos (Stripe/MercadoPago)", price: 1000 },
  ];

  const calculateTotal = useMemo(() => {
    const project = projectTypes.find(p => p.id === budget.projectType);
    if (!project) return { min: 0, max: 0, total: 0, days: 0, deliveryDate: null };

    const complexity = complexities.find(c => c.id === budget.complexity);
    const timeline = timelines.find(t => t.id === budget.timeline);

    // Calcula dias úteis baseados no projeto e complexidade
    let baseDays = project.days;
    if (complexity) {
      baseDays *= complexity.daysMultiplier;
    }

    // Adiciona dias para features
    const featuresDays = budget.features.reduce((acc, featId) => {
      const feat = featureList.find(f => f.id === featId);
      // Cada feature adiciona dias proporcionais ao preço (1 dia = R$ 450)
      return acc + Math.ceil((feat?.price || 0) / DEVELOPER_DAY_RATE);
    }, 0);

    // Adiciona dias para páginas adicionais (1 página = 2 dias)
    const pagesDays = Math.max(0, (budget.pages - 1) * 2);

    // Adiciona dias para integrações
    const integrationsDays = budget.integrations.reduce((acc, intId) => {
      const int = integrationsList.find(i => i.id === intId);
      return acc + Math.ceil((int?.price || 0) / DEVELOPER_DAY_RATE);
    }, 0);

    const totalDays = Math.ceil(baseDays + featuresDays + pagesDays + integrationsDays);

    // Calcula o valor baseado nos dias úteis
    const baseValue = totalDays * DEVELOPER_DAY_RATE;

    // Aplica multiplicador da timeline (urgência)
    let finalValue = baseValue;
    if (timeline) {
      finalValue *= timeline.multiplier;
    }

    // Calcula data de entrega considerando dias úteis (inicia no próximo dia útil)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Começa amanhã
    const deliveryDate = getDeliveryDate(startDate, totalDays);

    return {
      min: Math.round(finalValue * 0.9),
      max: Math.round(finalValue * 1.1),
      total: Math.round(finalValue),
      days: totalDays,
      deliveryDate,
    };
  }, [budget.projectType, budget.complexity, budget.timeline, budget.features, budget.pages, budget.integrations]);

  const handleNext = () => {
    if (budget.step < 6) {
      setBudget({ ...budget, step: budget.step + 1 });
    } else {
      setCalculated(true);
    }
  };

  const handleBack = () => {
    if (budget.step > 1) {
      setBudget({ ...budget, step: budget.step - 1 });
      setCalculated(false);
    }
  };

  const handleFinalizar = () => {
    setCalculated(true);
  };

  // Função para formatar CPF/CNPJ
  const formatDocument = (value: string) => {
    const digits = value.replace(/\D/g, "");
    
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else {
      // CNPJ: 00.000.000/0000-00
      return digits
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    
    if (digits.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    } else {
      // Celular: (00) 00000-0000
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
  };

  const handleSubmitBudget = async () => {
    try {
      // Validação dos campos obrigatórios
      if (!budget.firstName || !budget.lastName) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha nome e sobrenome.",
          variant: "destructive",
        });
        return;
      }
      if (!budget.document) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha CPF ou CNPJ.",
          variant: "destructive",
        });
        return;
      }
      if (!budget.email && !budget.phone) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha pelo menos um: Email ou Telefone.",
          variant: "destructive",
        });
        return;
      }

      setIsVerifyingClient(true);

      const clientResponse = await fetch("/api/clientes/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${budget.firstName} ${budget.lastName}`,
          email: budget.email,
          phone: budget.phone,
          company: budget.company,
          document: budget.document,
          documentType: budget.documentType,
        }),
      });

      const clientResultData = await clientResponse.json();

      if (!clientResultData.success) {
        toast({
          title: "Erro",
          description: clientResultData.error,
          variant: "destructive",
        });
        setIsVerifyingClient(false);
        return;
      }

      const clientMessage = clientResultData.isNewClient
        ? `🎉 Seja bem vindo, ${clientResultData.client.name}!`
        : `👋 Bem vindo de volta, ${clientResultData.client.name}!`;

      // Agora, criar o orçamento
      const budgetResponse = await fetch("/api/orcamentos/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: budget.projectType,
          complexity: budget.complexity,
          timeline: budget.timeline,
          features: budget.features,
          pages: budget.pages,
          integrations: budget.integrations,
          name: `${budget.firstName} ${budget.lastName}`,
          email: budget.email,
          phone: budget.phone,
          company: budget.company,
          details: budget.details,
          document: budget.document,
          documentType: budget.documentType,
          estimatedMin: estimate.min,
          estimatedMax: estimate.max,
          finalValue: estimate.total,
        }),
      });

      const budgetResult = await budgetResponse.json();

      if (budgetResult.success) {
        toast({
          title: "Sucesso!",
          description: `${clientMessage} ${budgetResult.message}`,
          variant: "default",
        });
        // Resetar formulário
        setBudget({
          step: 1,
          projectType: null,
          complexity: null,
          timeline: null,
          features: [],
          pages: 1,
          integrations: [],
          firstName: "",
          lastName: "",
          document: "",
          documentType: "cpf",
          email: "",
          phone: "",
          company: "",
          details: "",
        });
        setCalculated(false);
      } else {
        toast({
          title: "Erro",
          description: budgetResult.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingClient(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setBudget(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const toggleIntegration = (integrationId: string) => {
    setBudget(prev => ({
      ...prev,
      integrations: prev.integrations.includes(integrationId)
        ? prev.integrations.filter(i => i !== integrationId)
        : [...prev.integrations, integrationId],
    }));
  };

  const estimate = calculateTotal;
  const project = projectTypes.find(p => p.id === budget.projectType);
  const complexity = complexities.find(c => c.id === budget.complexity);
  const timeline = timelines.find(t => t.id === budget.timeline);

  const renderStep = () => {
    switch (budget.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Qual tipo de projeto você deseja?</h3>
              <p className="text-muted-foreground">Selecione a opção que melhor se encaixa na sua necessidade</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${budget.projectType === type.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : ""
                      }`}
                    onClick={() => setBudget({ ...budget, projectType: type.id as ProjectType })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${budget.projectType === type.id ? "bg-primary" : "bg-primary/10"
                          }`}>
                          <type.icon className={`h-8 w-8 ${budget.projectType === type.id ? "text-primary-foreground" : "text-primary"
                            }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{type.label}</h4>
                          <p className="text-sm text-muted-foreground">{type.desc}</p>
                          <p className="text-xs text-primary font-medium mt-2">
                            A partir de R$ {type.basePrice.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Qual o nível de complexidade?</h3>
              <p className="text-muted-foreground">Isso nos ajuda a entender a sofisticação do seu projeto</p>
            </div>

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Como a complexidade afeta o preço?
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Projetos mais complexos exigem mais dias de trabalho. O cálculo considera
                      <strong> dias úteis (segunda a sexta-feira)</strong>, excluindo feriados nacionais.
                      Cada diária tem custo de <strong>R$ {DEVELOPER_DAY_RATE.toLocaleString("pt-BR")}</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {complexities.map((comp) => (
                <motion.div
                  key={comp.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${budget.complexity === comp.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : ""
                      }`}
                    onClick={() => setBudget({ ...budget, complexity: comp.id as Complexity })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${budget.complexity === comp.id ? "bg-primary" : "bg-primary/10"
                          }`}>
                          <Star className={`h-8 w-8 ${budget.complexity === comp.id ? "text-primary-foreground" : "text-primary"
                            }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{comp.label}</h4>
                          <p className="text-sm text-muted-foreground">{comp.desc}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {comp.daysMultiplier === 1 ? "1x" : comp.daysMultiplier === 1.5 ? "1.5x" : "2.5x"} os dias base
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
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
                      Trabalhamos apenas em <strong>dias úteis (segunda a sexta-feira)</strong>,
                      excluindo <strong>feriados nacionais</strong>. O prazo final é calculado
                      somando os dias necessários conforme a complexidade e funcionalidades do seu projeto.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {timelines.map((time) => (
                <motion.div
                  key={time.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${budget.timeline === time.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : ""
                      }`}
                    onClick={() => setBudget({ ...budget, timeline: time.id as Timeline })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${budget.timeline === time.id ? "bg-primary" : "bg-primary/10"
                          }`}>
                          <time.icon className={`h-8 w-8 ${budget.timeline === time.id ? "text-primary-foreground" : "text-primary"
                            }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{time.label}</h4>
                          <p className="text-sm text-muted-foreground">{time.desc}</p>
                          <p className="text-xs text-primary/70 mt-1">
                            {time.id === "urgente" && "5-10 dias úteis"}
                            {time.id === "normal" && "15-30 dias úteis"}
                            {time.id === "flexivel" && "30-60 dias úteis"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Quais funcionalidades você precisa?</h3>
              <p className="text-muted-foreground">Selecione as funcionalidades desejadas (opcional)</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {featureList.map((feature) => (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${budget.features.includes(feature.id)
                        ? "border-primary bg-primary/5"
                        : ""
                      }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${budget.features.includes(feature.id) ? "bg-primary" : "bg-primary/10"
                            }`}>
                            <feature.icon className={`h-5 w-5 ${budget.features.includes(feature.id) ? "text-primary-foreground" : "text-primary"
                              }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{feature.label}</h4>
                            <p className="text-xs text-muted-foreground">+ R$ {feature.price.toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                        {budget.features.includes(feature.id) && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Quais integrações você precisa?</h3>
              <p className="text-muted-foreground">Conecte seu projeto a ferramentas externas (opcional)</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {integrationsList.map((integration) => (
                <motion.div
                  key={integration.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${budget.integrations.includes(integration.id)
                        ? "border-primary bg-primary/5"
                        : ""
                      }`}
                    onClick={() => toggleIntegration(integration.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${budget.integrations.includes(integration.id) ? "bg-primary" : "bg-primary/10"
                            }`}>
                            <Code2 className={`h-5 w-5 ${budget.integrations.includes(integration.id) ? "text-primary-foreground" : "text-primary"
                              }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{integration.label}</h4>
                            <p className="text-xs text-muted-foreground">+ R$ {integration.price.toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                        {budget.integrations.includes(integration.id) && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Quantidade de páginas estimada: {budget.pages}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={budget.pages}
                onChange={(e) => setBudget({ ...budget, pages: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {budget.pages > 1 ? `+ R$ ${((budget.pages - 1) * 300).toLocaleString("pt-BR")} para páginas adicionais` : "Inclui 1 página"}
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Último passo! Vamos nos conectar?</h3>
              <p className="text-muted-foreground">Preencha seus dados para receber o orçamento completo</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>
                  Essas informações nos ajudarão a entrar em contato com você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome *</label>
                    <input
                      type="text"
                      value={budget.firstName}
                      onChange={(e) => setBudget({ ...budget, firstName: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="João"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sobrenome *</label>
                    <input
                      type="text"
                      value={budget.lastName}
                      onChange={(e) => setBudget({ ...budget, lastName: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Silva"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CPF ou CNPJ *</label>
                    <input
                      type="text"
                      value={budget.document}
                      onChange={(e) => {
                        const formatted = formatDocument(e.target.value);
                        const digits = e.target.value.replace(/\D/g, "");
                        const documentType = digits.length > 11 ? "cnpj" : "cpf";
                        setBudget({ ...budget, document: formatted, documentType });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="000.000.000-00"
                      maxLength={18}
                    />
                    <p className="text-xs text-muted-foreground">
                      {budget.documentType === "cpf" ? "CPF (11 dígitos)" : "CNPJ (14 dígitos)"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Empresa</label>
                    <input
                      type="text"
                      value={budget.company}
                      onChange={(e) => setBudget({ ...budget, company: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Sua Empresa Ltda"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={budget.email}
                      onChange={(e) => setBudget({ ...budget, email: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="joao@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone/WhatsApp</label>
                    <input
                      type="tel"
                      value={budget.phone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setBudget({ ...budget, phone: formatted });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Preencha pelo menos um dos campos acima (Email ou Telefone)
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Detalhes Adicionais</label>
                  <textarea
                    value={budget.details}
                    onChange={(e) => setBudget({ ...budget, details: e.target.value })}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Conte mais sobre seu projeto, objetivos e qualquer informação relevante..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSummary = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold">Orçamento Calculado!</h2>
        <p className="text-muted-foreground">
          Com base nas suas escolhas, aqui está a estimativa para seu projeto
        </p>
      </motion.div>

      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Investimento Estimado</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-5xl font-bold text-primary">
              R$ {estimate.min.toLocaleString("pt-BR")}
            </span>
            <span className="text-muted-foreground">a</span>
            <span className="text-5xl font-bold text-primary">
              R$ {estimate.max.toLocaleString("pt-BR")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            * Valor final pode variar conforme detalhes do projeto
          </p>
        </CardHeader>
      </Card>

      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
              Importante sobre esta simulação
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Este é um <strong>orçamento estimativo</strong> baseado nas informações fornecidas.
            Os preços e valores podem alterar conforme condições específicas do projeto, como
            <strong> prazo, feriados, complexidade técnica e requisitos adicionais</strong>.
            O <strong>valor final será estipulado pela nossa equipe</strong> após análise detalhada
            das suas necessidades e confirmação de todos os detalhes do projeto.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Como o preço é calculado?
                  </p>
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <p>
                    <strong>Fórmula:</strong> (Dias Base do Projeto × Multiplicador de Complexidade) + Dias de Funcionalidades + Dias de Páginas + Dias de Integrações = Total de Dias Úteis
                  </p>
                  <p>
                    <strong>Valor Final:</strong> Total de Dias × R$ {DEVELOPER_DAY_RATE.toLocaleString("pt-BR")} (diária) × Multiplicador do Prazo
                  </p>
                  <p className="mt-2">
                    <strong>Importante:</strong> Trabalhamos apenas em <strong>dias úteis (segunda a sexta)</strong>,
                    sem trabalho em <strong>feriados nacionais</strong>. A complexidade do projeto influencia diretamente
                    no número de dias necessários.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dias Úteis Estimados</p>
              <p className="font-medium text-lg">{estimate.days} dias</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
              <p className="font-medium text-lg">
                {estimate.deliveryDate
                  ? estimate.deliveryDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                  : "-"
                }
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Diária do Desenvolvedor</p>
              <p className="font-medium text-lg">R$ {DEVELOPER_DAY_RATE.toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tipo de Projeto</p>
              <p className="font-medium">{project?.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Complexidade</p>
              <p className="font-medium">{complexity?.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Prazo</p>
              <p className="font-medium">{timeline?.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Páginas</p>
              <p className="font-medium">{budget.pages}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Composição do Cálculo</p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              {project && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dias base ({project.label}):</span>
                  <span className="font-medium">{PROJECT_BASE_DAYS[budget.projectType!] || 0} dias</span>
                </div>
              )}
              {complexity && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Multiplicador de complexidade ({complexity.label}):</span>
                  <span className="font-medium">× {complexity.daysMultiplier}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dias após complexidade:</span>
                <span className="font-medium">
                  {project ? Math.round((PROJECT_BASE_DAYS[budget.projectType!] || 0) * (complexity?.daysMultiplier || 1)) : 0} dias
                </span>
              </div>
              {budget.features.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dias para funcionalidades:</span>
                  <span className="font-medium">
                    +{budget.features.reduce((acc, featId) => {
                      const feat = featureList.find(f => f.id === featId);
                      return acc + Math.ceil((feat?.price || 0) / DEVELOPER_DAY_RATE);
                    }, 0)} dias
                  </span>
                </div>
              )}
              {budget.pages > 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dias para páginas adicionais:</span>
                  <span className="font-medium">+{Math.max(0, (budget.pages - 1) * 2)} dias</span>
                </div>
              )}
              {budget.integrations.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dias para integrações:</span>
                  <span className="font-medium">
                    +{budget.integrations.reduce((acc, intId) => {
                      const int = integrationsList.find(i => i.id === intId);
                      return acc + Math.ceil((int?.price || 0) / DEVELOPER_DAY_RATE);
                    }, 0)} dias
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de dias úteis:</span>
                <span className="font-bold text-primary">{estimate.days} dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor por diária:</span>
                <span className="font-medium">R$ {DEVELOPER_DAY_RATE.toLocaleString("pt-BR")}</span>
              </div>
              {timeline && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Multiplicador de prazo ({timeline.label}):</span>
                  <span className="font-medium">× {timeline.multiplier}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor base:</span>
                <span className="font-medium">R$ {(estimate.days * DEVELOPER_DAY_RATE).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor com multiplicador de prazo:</span>
                <span className="font-bold text-primary">R$ {estimate.total.toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {budget.features.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Funcionalidades Selecionadas</p>
              <div className="flex flex-wrap gap-2">
                {budget.features.map((featId) => {
                  const feat = featureList.find(f => f.id === featId);
                  return (
                    <Badge key={featId} variant="secondary">
                      {feat?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {budget.integrations.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Integrações Selecionadas</p>
              <div className="flex flex-wrap gap-2">
                {budget.integrations.map((intId) => {
                  const int = integrationsList.find(i => i.id === intId);
                  return (
                    <Badge key={intId} variant="outline">
                      {int?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {[
              "Nossa equipe analisará suas informações",
              "Entraremos em contato em até 24 horas úteis",
              "Agendaremos uma reunião para detalhar o projeto",
              "Enviaremos proposta comercial formal",
            ].map((step, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="w-full gap-2" onClick={handleSubmitBudget} disabled={isVerifyingClient}>
          {isVerifyingClient ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar Solicitação de Orçamento
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => {
            setBudget({
              step: 1,
              projectType: null,
              complexity: null,
              timeline: null,
              features: [],
              pages: 1,
              integrations: [],
              firstName: "",
              lastName: "",
              document: "",
              documentType: "cpf",
              email: "",
              phone: "",
              company: "",
              details: "",
            });
            setCalculated(false);
          }}
        >
          Novo Orçamento
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <DollarSign className="h-4 w-4 mr-1" />
            Orçamento Online
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Calcule o Investimento do seu Projeto
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Responda algumas perguntas e receba uma estimativa instantânea
            para desenvolvimento do seu software, site ou aplicativo.
          </p>
        </motion.div>

        {/* Progress Steps */}
        {!calculated && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step <= budget.step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {step < budget.step ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 6 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 mx-2 ${step < budget.step ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Projeto</span>
              <span>Complexidade</span>
              <span>Prazo</span>
              <span>Features</span>
              <span>Integrações</span>
              <span>Contato</span>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={calculated ? "summary" : `step-${budget.step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {calculated ? renderSummary() : renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!calculated && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={budget.step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-4">
              {budget.step < 6 && (
                <Button
                  onClick={handleNext}
                  disabled={
                    (budget.step === 1 && !budget.projectType) ||
                    (budget.step === 2 && !budget.complexity) ||
                    (budget.step === 3 && !budget.timeline)
                  }
                  className="gap-2"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {budget.step === 6 && (
                <Button
                  onClick={handleFinalizar}
                  disabled={
                    !budget.firstName || 
                    !budget.lastName || 
                    !budget.document || 
                    (!budget.email && !budget.phone)
                  }
                  className="gap-2"
                >
                  Revisar Orçamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}