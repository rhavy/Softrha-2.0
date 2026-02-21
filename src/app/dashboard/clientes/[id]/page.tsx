"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  FileText,
  Edit2,
  FolderKanban,
  DollarSign,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatCNPJ, formatCPF, formatPhone, formatCEP } from "@/lib/validators";

export default function ClienteDetalhes() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
                      {client.emails?.map((email: any) => (
                        <div key={email.id} className="flex items-center gap-2">
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
                      {client.phones?.map((phone: any) => (
                        <div key={phone.id} className="flex items-center gap-2">
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
                <Link href={`/dashboard/projetos?clientId=${client.id}`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Ver Projetos
                  </Button>
                </Link>
                <Link href={`/dashboard/orcamento?clientId=${client.id}`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <DollarSign className="h-4 w-4" />
                    Novo Orçamento
                  </Button>
                </Link>
                <Link href={`/dashboard/clientes`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit2 className="h-4 w-4" />
                    Editar Cliente
                  </Button>
                </Link>
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
      </motion.div>
    </DashboardLayout>
  );
}
