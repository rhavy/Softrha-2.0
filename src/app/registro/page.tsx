"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Upload,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Rocket,
  Zap,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  phone: string;
  sex: string;
  avatar: File | null;
  avatarPreview: string | null;
}

const sexOptions = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "other", label: "Outro" },
  { value: "prefer-not-say", label: "Prefiro não informar" },
];

export default function RegistroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    phone: "",
    sex: "",
    avatar: null,
    avatarPreview: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Senhas não conferem";
    if (!formData.birthDate) newErrors.birthDate = "Data de nascimento é obrigatória";
    if (!formData.phone) newErrors.phone = "Telefone é obrigatório";
    if (!formData.sex) newErrors.sex = "Sexo é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          birthDate: formData.birthDate,
          phone: formData.phone,
          sex: formData.sex,
        }),
      });

      if (response.ok) {
        toast({
          title: "Conta criada!",
          description: "Redirecionando para login...",
        });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const error = await response.json();
        setErrors({ submit: error.error || "Erro ao criar conta" });
      }
    } catch (error) {
      setErrors({ submit: "Erro ao criar conta. Tente novamente." });
    } finally {
      setIsLoading(false);
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
      setFormData({
        ...formData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <FuturisticBackground />

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 p-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm border-cyan-400/30 bg-cyan-500/20 text-cyan-100 backdrop-blur-sm mb-6">
              <Sparkles className="h-3 w-3 mr-2" />
              Crie sua conta grátis
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold drop-shadow-lg"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Comece Agora
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-cyan-100/80 max-w-md"
          >
            Junte-se a dezenas de clientes satisfeitos e transforme suas ideias em realidade.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-6 pt-8"
          >
            {[
              { icon: Rocket, label: "Projetos Ilimitados" },
              { icon: Zap, label: "Dashboard Moderna" },
              { icon: Shield, label: "Segurança Total" },
              { icon: Sparkles, label: "Tecnologia de Ponta" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20"
              >
                <feature.icon className="h-8 w-8 text-cyan-300" />
                <span className="text-sm font-medium text-white">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-cyan-100/70 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <Card className="border-cyan-400/20 backdrop-blur-sm bg-slate-900/50 mt-12">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-white">Criar Conta</CardTitle>
              <CardDescription className="text-cyan-100/70">
                Preencha os dados abaixo para se cadastrar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.submit && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/20 border border-red-400/30 text-red-300 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatarPreview || undefined} />
                    <AvatarFallback className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xl backdrop-blur-sm">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 h-8 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:from-cyan-400 hover:to-blue-400 transition-colors">
                    <Upload className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-cyan-100">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyan-100">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-cyan-100">Data de Nascimento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="pl-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                        required
                      />
                    </div>
                    {errors.birthDate && <p className="text-xs text-red-400">{errors.birthDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-cyan-100">Sexo</Label>
                    <select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-cyan-400/30 bg-slate-900/50 text-cyan-100 px-3 py-2 text-sm focus:border-cyan-400/60"
                      required
                    >
                      <option value="" className="bg-slate-900">Selecione</option>
                      {sexOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-900">{option.label}</option>
                      ))}
                    </select>
                    {errors.sex && <p className="text-xs text-red-400">{errors.sex}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-cyan-100">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cyan-100">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-cyan-100/50 hover:text-cyan-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-cyan-100">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-cyan-100/50 hover:text-cyan-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Criar Conta
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-cyan-100/70">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-cyan-300 font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
