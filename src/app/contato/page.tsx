"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    telefone: "",
    tipo: "",
    mensagem: "",
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Aqui você conectaria com sua API ou serviço de email
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: Mail, title: "Email", value: "contato@softrha.com", href: "mailto:contato@softrha.com" },
    { icon: Phone, title: "Telefone", value: "+55 (11) 99999-9999", href: "tel:+551199999999" },
    { icon: MapPin, title: "Localização", value: "São Paulo, SP - Brasil", href: "#" },
    { icon: Clock, title: "Atendimento", value: "Seg-Sex: 9h às 18h", href: "#" },
  ];

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
                          <Label htmlFor="empresa" className="text-cyan-100/90 text-xs uppercase tracking-wider">Empresa</Label>
                          <Input
                            id="empresa"
                            name="empresa"
                            placeholder="Nome da sua empresa"
                            value={formData.empresa}
                            onChange={handleChange}
                            className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone" className="text-cyan-100/90 text-xs uppercase tracking-wider">WhatsApp / Telefone</Label>
                          <Input
                            id="telefone"
                            name="telefone"
                            placeholder="(00) 00000-0000"
                            value={formData.telefone}
                            onChange={handleChange}
                            className="bg-slate-950/50 border-cyan-400/20 text-white focus:border-cyan-400/60"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipo" className="text-cyan-100/90 text-xs uppercase tracking-wider">Tipo de Projeto *</Label>
                        <select
                          id="tipo"
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleChange}
                          required
                          className="flex h-10 w-full rounded-md border border-cyan-400/20 bg-slate-950/50 text-cyan-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none transition-all cursor-pointer"
                        >
                          <option value="" className="bg-slate-900">Selecione uma categoria...</option>
                          <option value="web" className="bg-slate-900">Desenvolvimento Web (SaaS, Portais)</option>
                          <option value="mobile" className="bg-slate-900">Aplicativo Mobile (iOS/Android)</option>
                          <option value="software" className="bg-slate-900">Software Sob Medida / ERP</option>
                          <option value="consultoria" className="bg-slate-900">Consultoria / CTO as a Service</option>
                        </select>
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

                      <Button type="submit" className="w-full h-12 gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-900/20 uppercase tracking-widest text-xs transition-all active:scale-[0.98]">
                        Enviar Solicitação
                        <Send className="h-4 w-4" />
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
                      <Calendar className="h-24 w-24" />
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-cyan-400" />
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
                      <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold">
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
    </div>
  );
}