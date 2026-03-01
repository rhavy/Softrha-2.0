"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar as CalendarIcon,
  CheckCircle2,
  Video,
  Mic,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { contactInfo } from "@/lib/contact-info";

export default function Contato() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    telefone: "",
    tipo: "",
    mensagem: "",
  });

  // Estados para agendamento
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<"manha" | "tarde" | "">("");
  const [scheduledDates, setScheduledDates] = useState<Date[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedulePhone, setSchedulePhone] = useState("");
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleStep, setScheduleStep] = useState<"date" | "confirm">("date");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  // Máscara de telefone
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  // Máscara de telefone para agendamento
  const handleSchedulePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setSchedulePhone(formatted);
  };

  // Carregar datas agendadas
  const fetchScheduledDates = async () => {
    try {
      setScheduleLoading(true);
      const response = await fetch("/api/agendamentos/datas");
      if (response.ok) {
        const data = await response.json();
        setScheduledDates(data.dates.map((d: string) => new Date(d)));
      }
    } catch (error) {
      console.error("Erro ao buscar datas agendadas:", error);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Abrir dialog de agendamento
  const handleOpenSchedule = () => {
    fetchScheduledDates();
    setScheduleDialogOpen(true);
    setSelectedDate(undefined);
    setSelectedPeriod("");
    setSchedulePhone("");
    setScheduleStep("date");
  };

  // Lidar com seleção de data
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedPeriod("");
    // Quando selecionar data, vai para etapa do telefone
    setScheduleStep("confirm");
  };

  // Validar telefone WhatsApp
  const isValidWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    // WhatsApp brasileiro: 10 ou 11 dígitos (com ou sem 9 na frente)
    // Aceita: (11) 99999-9999 ou (11) 9999-9999
    return digits.length === 10 || digits.length === 11;
  };

  // Verificar se pode habilitar os botões (nome e WhatsApp válidos)
  const canEnableButtons = () => {
    return scheduleName.trim().length >= 2 && isValidWhatsApp(schedulePhone);
  };

  // Lidar com seleção de período e confirmar agendamento
  const handlePeriodSelect = async (period: "manha" | "tarde") => {
    if (!selectedDate) {
      toast({
        title: "Data obrigatória",
        description: "Selecione uma data para continuar",
        variant: "destructive",
      });
      return;
    }

    if (!scheduleName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe seu nome para o agendamento",
        variant: "destructive",
      });
      return;
    }

    if (!isValidWhatsApp(schedulePhone)) {
      toast({
        title: "Telefone inválido",
        description: "Insira um WhatsApp válido com 10 ou 11 dígitos (ex: 11999999999)",
        variant: "destructive",
      });
      return;
    }

    setSelectedPeriod(period);

    try {
      setScheduleLoading(true);
      const response = await fetch("/api/agendamentos/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          period,
          phone: schedulePhone,
          name: scheduleName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Agendamento realizado!",
          description: "Confirmação será enviada no WhatsApp em breve.",
          variant: "default",
        });
        setScheduleDialogOpen(false);
        setScheduleStep("date");
        setSchedulePhone("");
        setScheduleName("");
        setSelectedPeriod("");
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao agendar. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast({
        title: "Erro",
        description: "Erro ao agendar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formData.nome || !formData.email || !formData.empresa || !formData.telefone || !formData.tipo || !formData.mensagem) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar telefone (mínimo 10 dígitos)
    const phoneDigits = formData.telefone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um telefone válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Mensagem enviada!",
          description: result.message,
          variant: "default",
        });
        // Limpar formulário
        setFormData({
          nome: "",
          email: "",
          empresa: "",
          telefone: "",
          tipo: "",
          mensagem: "",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-slate-950">
      <FuturisticBackground />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 px-4 py-2 border-cyan-400/30 bg-cyan-500/20 text-cyan-100 backdrop-blur-md">
                Contato
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                Vamos Conversar Sobre seu <span className="text-cyan-400">Projeto</span>
              </h1>
              <p className="mt-6 text-lg text-cyan-100/70 max-w-2xl">
                Estamos prontos para transformar sua ideia em realidade.
                Entre em contato e receba uma consultoria especializada gratuita.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form & Info Section */}
        <section className="pb-20 md:pb-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">

              {/* Formulário */}
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-900/60 backdrop-blur-xl border-cyan-400/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <MessageSquare className="h-5 w-5 text-cyan-400" />
                      Envie uma Mensagem
                    </CardTitle>
                    <CardDescription className="text-cyan-100/60">
                      Entraremos em contato em até 24 horas úteis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome" className="text-cyan-100/90 text-xs uppercase tracking-wider">Nome Completo *</Label>
                          <Input
                            id="nome"
                            name="nome"
                            placeholder="Ex: João Silva"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                            className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-cyan-100/90 text-xs uppercase tracking-wider">Email Profissional *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="empresa" className="text-cyan-100/90 text-xs uppercase tracking-wider">Empresa *</Label>
                          <Input
                            id="empresa"
                            name="empresa"
                            placeholder="Nome da sua empresa"
                            value={formData.empresa}
                            onChange={handleChange}
                            required
                            className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone" className="text-cyan-100/90 text-xs uppercase tracking-wider">WhatsApp / Telefone *</Label>
                          <Input
                            id="telefone"
                            name="telefone"
                            placeholder="(00) 00000-0000"
                            value={formData.telefone}
                            onChange={handlePhoneChange}
                            required
                            maxLength={15}
                            className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipo" className="text-cyan-100/90 text-xs uppercase tracking-wider">Tipo de Projeto *</Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                          required
                        >
                          <SelectTrigger className="bg-slate-950/50 border-cyan-400/20 text-cyan-100 focus:ring-cyan-400">
                            <SelectValue placeholder="Selecione uma categoria..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-cyan-400/20">
                            <SelectItem value="web" className="text-cyan-100 focus:bg-cyan-600 focus:text-white">Desenvolvimento Web (SaaS, Portais)</SelectItem>
                            <SelectItem value="mobile" className="text-cyan-100 focus:bg-cyan-600 focus:text-white">Aplicativo Mobile (iOS/Android)</SelectItem>
                            <SelectItem value="software" className="text-cyan-100 focus:bg-cyan-600 focus:text-white">Software Sob Medida / ERP</SelectItem>
                            <SelectItem value="consultoria" className="text-cyan-100 focus:bg-cyan-600 focus:text-white">Consultoria / CTO as a Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mensagem" className="text-cyan-100/90 text-xs uppercase tracking-wider">Detalhes do Projeto *</Label>
                        <textarea
                          id="mensagem"
                          name="mensagem"
                          rows={4}
                          placeholder="Conte-nos brevemente sobre sua ideia..."
                          value={formData.mensagem}
                          onChange={handleChange}
                          required
                          className="flex w-full rounded-md border border-cyan-400/20 bg-slate-950/50 text-cyan-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none transition-all"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-900/20 uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            Enviando...
                          </>
                        ) : (
                          <>
                            Enviar Solicitação
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Informações de Apoio */}
              <div className="space-y-8">
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <h2 className="text-2xl font-bold text-white mb-4">Canais Diretos</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {contactInfo.map((item, idx) => (
                      <Card key={idx} className="bg-slate-900/40 border-white/5 hover:border-cyan-400/30 transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                            <item.icon className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] uppercase text-cyan-100/40 font-bold tracking-widest">{item.title}</p>
                            <a href={item.href} className="text-sm text-white hover:text-cyan-400 transition-colors truncate block">
                              {item.value}
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>

                {/* Card de Agendamento */}
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card className="bg-gradient-to-br from-cyan-950 to-blue-950 border-cyan-500/30 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CalendarIcon className="h-24 w-24" />
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="h-5 w-5 text-cyan-400" />
                        Agende uma Reunião
                      </CardTitle>
                      <CardDescription className="text-cyan-100/60">
                        Prefere uma conversa por vídeo? Escolha um horário.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm text-cyan-50/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Diagnóstico técnico gratuito
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Estimativa de ROI e prazos
                        </li>
                      </ul>
                      <Button
                        type="button"
                        onClick={handleOpenSchedule}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                      >
                        Ver Agenda Disponível
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-950/80 border-t border-white/5">
          <div className="container mx-auto px-4 text-center mb-12">
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 mb-4 uppercase text-[10px] tracking-[0.2em]">Dúvidas Comuns</Badge>
            <h2 className="text-3xl font-bold text-white">FAQ</h2>
          </div>
          <div className="container mx-auto px-4 max-w-4xl grid gap-4">
            {[
              { q: "Qual o prazo médio?", a: "Projetos Web variam de 3 a 8 semanas, dependendo da complexidade das integrações." },
              { q: "Vocês trabalham com manutenção?", a: "Sim, oferecemos planos de evolução contínua (SLA) para garantir que seu software nunca fique defasado." }
            ].map((faq, i) => (
              <motion.div key={i} {...fadeInUp}>
                <Card className="bg-slate-900/30 border-white/5 hover:border-white/10 transition-all">
                  <CardHeader className="py-4 px-6">
                    <CardTitle className="text-base text-white">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-4">
                    <p className="text-sm text-cyan-100/50">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Dialog de Agendamento */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-cyan-400/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-cyan-400" />
              Agende uma Reunião
            </DialogTitle>
            <DialogDescription className="text-cyan-100/60">
              {scheduleStep === "date" && "Selecione um dia disponível para agendar sua reunião."}
              {scheduleStep === "confirm" && "Informe seu WhatsApp e selecione o período para confirmação."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Etapa 1: Calendário */}
            {scheduleStep === "date" && (
              <div className="space-y-2">
                <Label className="text-cyan-100/90 text-xs uppercase tracking-wider">
                  {scheduleLoading ? "Carregando datas..." : "Selecione um dia:"}
                </Label>
                <CalendarComponent
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  disabledDates={scheduledDates}
                  minDate={new Date()}
                />
              </div>
            )}

            {/* Etapa 2: Telefone e Período */}
            {scheduleStep === "confirm" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Campo de Nome */}
                <div className="space-y-2">
                  <Label htmlFor="scheduleName" className="text-cyan-100/90 text-xs uppercase tracking-wider">
                    Seu Nome *
                  </Label>
                  <Input
                    id="scheduleName"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60 transition-all"
                  />
                </div>

                {/* Campo de Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="schedulePhone" className="text-cyan-100/90 text-xs uppercase tracking-wider">
                    WhatsApp para Confirmação *
                  </Label>
                  <Input
                    id="schedulePhone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={schedulePhone}
                    onChange={handleSchedulePhoneChange}
                    maxLength={15}
                    className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60 transition-all"
                  />
                  <p className="text-xs text-cyan-100/50">
                    📱 Enviaremos uma mensagem de confirmação no WhatsApp
                  </p>
                </div>

                {/* Data Selecionada */}
                {selectedDate && (
                  <div className="bg-cyan-950/30 border border-cyan-400/20 rounded-lg p-3">
                    <p className="text-sm text-cyan-100/80 font-semibold mb-1">Data Selecionada:</p>
                    <p className="text-cyan-400 font-medium">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {/* Seleção de Período */}
                <div className="space-y-2">
                  <Label className="text-cyan-100/90 text-xs uppercase tracking-wider">
                    Horário preferido:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={scheduleLoading || !canEnableButtons()}
                      onClick={() => handlePeriodSelect("manha")}
                      className={`h-14 gap-2 transition-all ${selectedPeriod === "manha"
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "border-cyan-400/20 text-cyan-100 hover:bg-cyan-900"
                        } ${!canEnableButtons() ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Mic className="h-5 w-5 text-cyan-800" />
                      <div className="flex flex-col items-start text-cyan-800">
                        <span className="font-semibold">Manhã</span>
                        <span className="text-xs opacity-70">9h às 12h</span>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={scheduleLoading || !canEnableButtons()}
                      onClick={() => handlePeriodSelect("tarde")}
                      className={`h-14 gap-2 transition-all ${selectedPeriod === "tarde"
                        ? "bg-cyan-600 border-cyan-400 text-white"
                        : "border-cyan-400/20 text-cyan-100 hover:bg-cyan-900"
                        } ${!canEnableButtons() ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Mic className="h-5 w-5 text-cyan-800" />
                      <div className="flex flex-col items-start text-cyan-800">
                        <span className="font-semibold">Tarde</span>
                        <span className="text-xs opacity-70">14h às 18h</span>
                      </div>
                    </Button>
                  </div>
                  {!canEnableButtons() && (schedulePhone.length < 11) && (
                    <p className="text-xs text-amber-400">
                      ⚠️ Preencha nome e WhatsApp (11 dígitos com 9) para habilitar
                    </p>
                  )}
                </div>

                {/* Botão Voltar */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setScheduleStep("date");
                    setSelectedDate(undefined);
                    setSelectedPeriod("");
                  }}
                  className="w-full border-cyan-400/20 text-cyan-400 hover:bg-cyan-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar para selecionar data
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
