"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Eye,
  Award,
  Users,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Sobre() {
  const values = [
    {
      icon: Target,
      title: "Foco em Resultados",
      description: "Cada linha de código é escrita pensando no impacto real para o seu negócio.",
    },
    {
      icon: Lightbulb,
      title: "Inovação Constante",
      description: "Mantemos nossa stack sempre atualizada com as melhores tecnologias.",
    },
    {
      icon: Award,
      title: "Excelência Técnica",
      description: "Padrões de qualidade rigorosos em cada entrega de projeto.",
    },
    {
      icon: Users,
      title: "Parceria Genuína",
      description: "Tratamos cada projeto como se fosse nosso próprio negócio.",
    },
  ];

  const stats = [
    { value: "5+", label: "Anos de Experiência" },
    { value: "50+", label: "Projetos Entregues" },
    { value: "30+", label: "Clientes Satisfeitos" },
    { value: "98%", label: "Taxa de Satisfação" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Sobre a SoftRha
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Transformamos Ideias em{" "}
              <span className="text-primary">Soluções Digitais</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Somos especialistas em desenvolvimento de software de alta performance,
              utilizando as tecnologias mais modernas do mercado para entregar
              resultados excepcionais.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Nossa Missão</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Converter necessidades de negócio em soluções tecnológicas escaláveis
                e seguras, demonstrando autoridade técnica e visão estratégica em
                cada projeto. Educamos nossos clientes sobre os benefícios de
                tecnologias modernas para garantir decisões informadas e resultados
                superiores.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Nossa Visão</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Ser referência em desenvolvimento de software de alta qualidade,
                reconhecidos pela excelência técnica, inovação constante e capacidade
                de transformar desafios complexos em soluções elegantes e eficientes
                que impulsionam o crescimento dos nossos clientes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mb-16"
          >
            <Badge variant="outline" className="px-4 py-2">
              Nossos Valores
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              O Que Nos Define
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="outline" className="px-4 py-2">
              Nossa Abordagem
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Como Trabalhamos
            </h2>
            <p className="text-muted-foreground">
              Combinamos metodologia ágil com práticas de desenvolvimento modernas
              para entregar valor de forma consistente e previsível.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Descoberta",
                description: "Entendemos profundamente suas necessidades e objetivos de negócio.",
              },
              {
                step: "02",
                title: "Desenvolvimento",
                description: "Construímos com tecnologias modernas, seguindo melhores práticas.",
              },
              {
                step: "03",
                title: "Entrega & Evolução",
                description: "Lançamos com excelência e continuamos evoluindo a solução.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-4">
                  {item.step}
                </div>
                <div className="relative bg-card rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-16 text-center text-primary-foreground"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <CheckCircle className="h-16 w-16 mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Pronto para Começar seu Projeto?
              </h2>
              <p className="text-lg opacity-90">
                Vamos conversar sobre como podemos transformar sua ideia em uma
                solução digital de alta performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/contato">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Fale Conosco
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/servicos">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Conhecer Serviços
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
