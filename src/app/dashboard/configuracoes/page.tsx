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
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  X,
  Camera,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface ContactField {
  id: string;
  value: string;
  type: string;
  isPrimary: boolean;
}

interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  projectUpdates: boolean;
  taskUpdates: boolean;
  budgetAlerts: boolean;
  clientAlerts: boolean;
}

export default function DashboardConfiguracoes() {
  const router = useRouter();
  const { data: session, isPending: isLoadingSession } = useSession();
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
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Perfil
  const [nome, setNome] = useState("");
  const [emails, setEmails] = useState<ContactField[]>([{ id: "1", value: "", type: "pessoal", isPrimary: true }]);
  const [telefones, setTelefones] = useState<ContactField[]>([{ id: "1", value: "", type: "whatsapp", isPrimary: true }]);
  const [bio, setBio] = useState("");
  
  // Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      setNome(session.user.name || "");
      if (session.user.email) {
        setEmails([{ id: "1", value: session.user.email, type: "pessoal", isPrimary: true }]);
      }
      fetchPreferences();
    }
  }, [session]);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O avatar deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl("");
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      
      const response = await fetch("/api/auth/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Avatar atualizado!",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
        setAvatarFile(null);
      } else {
        throw new Error("Erro ao atualizar avatar");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o avatar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmail = () => {
    setEmails([...emails, { id: Date.now().toString(), value: "", type: "pessoal", isPrimary: false }]);
  };

  const removeEmail = (id: string) => {
    if (emails.length === 1) {
      toast({
        title: "Mínimo de emails",
        description: "Você precisa ter pelo menos um email cadastrado.",
        variant: "destructive",
      });
      return;
    }
    setEmails(emails.filter(e => e.id !== id));
  };

  const updateEmail = (id: string, value: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, value } : e));
  };

  const addTelefone = () => {
    setTelefones([...telefones, { id: Date.now().toString(), value: "", type: "whatsapp", isPrimary: false }]);
  };

  const removeTelefone = (id: string) => {
    if (telefones.length === 1) {
      toast({
        title: "Mínimo de telefones",
        description: "Você precisa ter pelo menos um telefone cadastrado.",
        variant: "destructive",
      });
      return;
    }
    setTelefones(telefones.filter(t => t.id !== id));
  };

  const updateTelefone = (id: string, value: string) => {
    setTelefones(telefones.map(t => t.id === id ? { ...t, value } : t));
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

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação não são iguais.",
        variant: "destructive",
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: senhaAtual,
          newPassword: novaSenha,
        }),
      });

      if (response.ok) {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi atualizada com sucesso.",
        });
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar senha");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          bio,
          emails,
          telefones,
        }),
      });

      if (response.ok) {
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Erro ao atualizar perfil");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
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

  if (isLoadingSession) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

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
                        <AvatarImage src={avatarUrl || session?.user?.image || undefined} alt={nome} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <label>
                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                              <Upload className="h-4 w-4" />
                              Alterar Foto
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>
                          {avatarUrl && (
                            <>
                              <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveAvatar} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Salvar
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={handleRemoveAvatar}>
                                <Trash2 className="h-4 w-4" />
                                Remover
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, GIF ou PNG. Máximo de 5MB.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Form */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input 
                          id="nome" 
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      {/* Emails */}
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label>Emails</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addEmail}>
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        {emails.map((email, index) => (
                          <div key={email.id} className="flex gap-2">
                            <Input
                              type="email"
                              value={email.value}
                              onChange={(e) => updateEmail(email.id, e.target.value)}
                              placeholder="email@exemplo.com"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEmail(email.id)}
                              disabled={emails.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Telefones */}
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label>Telefones</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addTelefone}>
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        {telefones.map((telefone, index) => (
                          <div key={telefone.id} className="flex gap-2">
                            <Input
                              value={telefone.value}
                              onChange={(e) => updateTelefone(telefone.id, e.target.value)}
                              placeholder="(00) 00000-0000"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTelefone(telefone.id)}
                              disabled={telefones.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Conte um pouco sobre você..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} className="gap-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                          value={senhaAtual}
                          onChange={(e) => setSenhaAtual(e.target.value)}
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
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
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
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button onClick={handleChangePassword} className="gap-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                      Escolha como e quando você quer receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Notificações por Email</p>
                            <p className="text-sm text-muted-foreground">
                              Receba atualizações e alertas por email
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.emailEnabled}
                          onCheckedChange={(checked) => updatePreference("emailEnabled", checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Notificações Push</p>
                            <p className="text-sm text-muted-foreground">
                              Receba notificações no navegador
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.pushEnabled}
                          onCheckedChange={(checked) => updatePreference("pushEnabled", checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Atualizações de Projetos</p>
                            <p className="text-sm text-muted-foreground">
                              Mudanças de status e novas atividades
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.projectUpdates}
                          onCheckedChange={(checked) => updatePreference("projectUpdates", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Atualizações de Tarefas</p>
                            <p className="text-sm text-muted-foreground">
                              Tarefas concluídas ou atribuídas
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.taskUpdates}
                          onCheckedChange={(checked) => updatePreference("taskUpdates", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Alertas de Orçamento</p>
                            <p className="text-sm text-muted-foreground">
                              Novos orçamentos e alterações
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.budgetAlerts}
                          onCheckedChange={(checked) => updatePreference("budgetAlerts", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Alertas de Clientes</p>
                            <p className="text-sm text-muted-foreground">
                              Novos clientes e atualizações
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.clientAlerts}
                          onCheckedChange={(checked) => updatePreference("clientAlerts", checked)}
                        />
                      </div>
                    </div>

                    <Button onClick={savePreferences} className="gap-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar Preferências
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
                        <div>
                          <p className="font-medium">Perfil Visível</p>
                          <p className="text-sm text-muted-foreground">
                            Seu perfil será visível para outros membros da equipe
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Atividade Visível</p>
                          <p className="text-sm text-muted-foreground">
                            Mostre sua atividade recente para a equipe
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Visível</p>
                          <p className="text-sm text-muted-foreground">
                            Seu email será visível para outros membros
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>
                      Ações irreversíveis na sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Excluir Conta
                    </Button>
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
                      Personalize a aparência do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Moon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Modo Escuro</p>
                            <p className="text-sm text-muted-foreground">
                              Alterne entre tema claro e escuro
                            </p>
                          </div>
                        </div>
                        <Switch />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Idioma</p>
                            <p className="text-sm text-muted-foreground">
                              Selecione o idioma do sistema
                            </p>
                          </div>
                        </div>
                        <select className="border rounded-md px-3 py-2 text-sm">
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                      </div>
                    </div>
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
