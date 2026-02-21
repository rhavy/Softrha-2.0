"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Upload,
  Trash2,
  Moon,
  Sun,
  Globe,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";

interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  projectUpdates: boolean;
  taskUpdates: boolean;
  budgetAlerts: boolean;
  clientAlerts: boolean;
}

export default function DashboardConfiguracoes() {
  const [activeTab, setActiveTab] = useState<"perfil" | "notificacoes" | "privacidade" | "aparicao">("perfil");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    pushEnabled: true,
    projectUpdates: true,
    taskUpdates: true,
    budgetAlerts: true,
    clientAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isSupported, permission, subscribeToPush, unsubscribeFromPush } = usePushNotifications();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notificacoes/preferencias");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Erro ao buscar preferências:", error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notificacoes/preferencias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "Preferências salvas!",
          description: "Suas configurações de notificação foram atualizadas.",
        });
      } else {
        throw new Error("Erro ao salvar preferências");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "privacidade", label: "Privacidade", icon: Shield },
    { id: "aparicao", label: "Aparência", icon: Palette },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Tabs */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Perfil */}
            {activeTab === "perfil" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais e de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/avatar.jpg" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          US
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Upload className="h-4 w-4" />
                          Alterar Foto
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Form */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" defaultValue="Usuário SoftRha" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input id="cargo" defaultValue="Administrador" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" defaultValue="usuario@softrha.com" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="telefone" defaultValue="(11) 99999-9999" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" defaultValue="Desenvolvedor apaixonado por tecnologia" />
                      </div>
                    </div>

                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                      Atualize sua senha para manter sua conta segura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="senha-atual">Senha Atual</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="senha-atual"
                          type={showCurrentPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nova-senha">Nova Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nova-senha"
                          type={showNewPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmar-senha"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Atualizar Senha
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Notificações */}
            {activeTab === "notificacoes" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>
                      Escolha como e quando deseja receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações por Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba atualizações e novidades por email
                          </p>
                        </div>
                        <Switch
                          checked={preferences.emailEnabled}
                          onCheckedChange={(checked) => updatePreference("emailEnabled", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações Push</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba notificações em tempo real no navegador
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSupported && (
                            <>
                              {permission === 'granted' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={unsubscribeFromPush}
                                  className="text-xs h-8"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Desativar
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={subscribeToPush}
                                  className="text-xs h-8"
                                >
                                  <Bell className="h-3 w-3 mr-1" />
                                  Ativar
                                </Button>
                              )}
                            </>
                          )}
                          <Switch
                            checked={preferences.pushEnabled}
                            onCheckedChange={(checked) => updatePreference("pushEnabled", checked)}
                            disabled={!isSupported}
                          />
                        </div>
                      </div>
                      {!isSupported && (
                        <p className="text-xs text-muted-foreground">
                          Seu navegador não suporta notificações push.
                        </p>
                      )}
                      {permission === 'denied' && (
                        <p className="text-xs text-amber-600">
                          ⚠️ Notificações bloqueadas. Permita nas configurações do navegador.
                        </p>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações de Projetos</Label>
                          <p className="text-sm text-muted-foreground">
                            Seja notificado sobre atualizações em projetos
                          </p>
                        </div>
                        <Switch
                          checked={preferences.projectUpdates}
                          onCheckedChange={(checked) => updatePreference("projectUpdates", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Notificações de Tarefas</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba lembretes de tarefas e prazos
                          </p>
                        </div>
                        <Switch
                          checked={preferences.taskUpdates}
                          onCheckedChange={(checked) => updatePreference("taskUpdates", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Alertas de Orçamento</Label>
                          <p className="text-sm text-muted-foreground">
                            Seja notificado sobre novos orçamentos
                          </p>
                        </div>
                        <Switch
                          checked={preferences.budgetAlerts}
                          onCheckedChange={(checked) => updatePreference("budgetAlerts", checked)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Alertas de Clientes</Label>
                          <p className="text-sm text-muted-foreground">
                            Seja notificado sobre novos clientes
                          </p>
                        </div>
                        <Switch
                          checked={preferences.clientAlerts}
                          onCheckedChange={(checked) => updatePreference("clientAlerts", checked)}
                        />
                      </div>
                    </div>
                    <Button className="gap-2" onClick={savePreferences} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isLoading ? "Salvando..." : "Salvar Preferências"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Privacidade */}
            {activeTab === "privacidade" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Privacidade</CardTitle>
                    <CardDescription>
                      Controle quem pode ver suas informações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Perfil Público</Label>
                          <p className="text-sm text-muted-foreground">
                            Tornar seu perfil visível para outros membros
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Mostrar Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Exibir seu email para outros membros da equipe
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Mostrar Telefone</Label>
                          <p className="text-sm text-muted-foreground">
                            Exibir seu telefone para outros membros
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Status Online</Label>
                          <p className="text-sm text-muted-foreground">
                            Mostrar quando você está online
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>
                      Ações irreversíveis relacionadas à sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="font-medium">Excluir Conta</p>
                        <p className="text-sm text-muted-foreground">
                          Esta ação não pode ser desfeita
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Aparência */}
            {activeTab === "aparicao" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Aparência</CardTitle>
                    <CardDescription>
                      Personalize a aparência do dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Moon className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <Label>Modo Escuro</Label>
                            <p className="text-sm text-muted-foreground">
                              Alternar entre tema claro e escuro
                            </p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Globe className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <Label>Idioma</Label>
                            <p className="text-sm text-muted-foreground">
                              Selecione o idioma da interface
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Português (BR)</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Sun className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <Label>Densidade</Label>
                            <p className="text-sm text-muted-foreground">
                              Ajustar espaçamento da interface
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Compacto</Button>
                          <Button size="sm">Confortável</Button>
                        </div>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Preferências
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
