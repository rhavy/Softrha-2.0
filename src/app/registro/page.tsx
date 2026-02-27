"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

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

interface FieldStatus {
  name: "empty" | "valid" | "invalid";
  email: "empty" | "valid" | "invalid";
  password: "empty" | "valid" | "invalid";
  confirmPassword: "empty" | "valid" | "invalid";
  birthDate: "empty" | "valid" | "invalid";
  phone: "empty" | "valid" | "invalid";
  sex: "empty" | "valid" | "invalid";
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

  const [fieldStatus, setFieldStatus] = useState<FieldStatus>({
    name: "empty",
    email: "empty",
    password: "empty",
    confirmPassword: "empty",
    birthDate: "empty",
    phone: "empty",
    sex: "empty",
  });

  // Validar campos quando mudarem
  useEffect(() => {
    validateField("name", formData.name);
    validateField("email", formData.email);
    validateField("password", formData.password);
    validateField("confirmPassword", formData.confirmPassword);
    validateField("birthDate", formData.birthDate);
    validateField("phone", formData.phone);
    validateField("sex", formData.sex);
  }, [formData]);

  const validateField = (field: keyof FieldStatus, value: string) => {
    let status: "empty" | "valid" | "invalid" = "empty";

    switch (field) {
      case "name":
        status = value.trim().length >= 3 ? "valid" : value ? "invalid" : "empty";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        status = emailRegex.test(value) ? "valid" : value ? "invalid" : "empty";
        break;
      case "password":
        status = value.length >= 6 ? "valid" : value ? "invalid" : "empty";
        break;
      case "confirmPassword":
        status = value === formData.password && value ? "valid" : value ? "invalid" : "empty";
        break;
      case "birthDate":
        const date = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        status = value && age >= 13 && age <= 120 ? "valid" : value ? "invalid" : "empty";
        break;
      case "phone":
        const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
        status = value ? (phoneRegex.test(value) ? "valid" : "invalid") : "empty";
        break;
      case "sex":
        status = value ? "valid" : "empty";
        break;
    }

    setFieldStatus(prev => ({ ...prev, [field]: status }));
  };

  const handleInputChange = (field: keyof FormData) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSexChange = (value: string) => {
    setFormData(prev => ({ ...prev, sex: value }));
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2}).*/, "($1");
      }
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O avatar deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: null,
      avatarPreview: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar todos os campos obrigatórios
    const requiredFields: (keyof FormData)[] = ["name", "email", "password", "confirmPassword", "birthDate", "sex"];
    let hasError = false;

    for (const field of requiredFields) {
      if (!formData[field]) {
        hasError = true;
        validateField(field as keyof FieldStatus, formData[field] as string);
      }
    }

    // Verificar status dos campos
    const invalidFields = Object.entries(fieldStatus).filter(
      ([, status]) => status === "invalid"
    );

    if (hasError || invalidFields.length > 0) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos inválidos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Verificar se senhas coincidem
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Preparar dados para envio
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("birthDate", formData.birthDate);
      submitData.append("phone", formData.phone);
      submitData.append("sex", formData.sex);
      
      if (formData.avatar) {
        submitData.append("avatar", formData.avatar);
      }

      const response = await fetch("/api/auth/registro", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta");
      }

      toast({
        title: "Conta criada!",
        description: "Redirecionando para login...",
      });

      // Aguardar e redirecionar
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldColor = (status: "empty" | "valid" | "invalid") => {
    switch (status) {
      case "valid":
        return "border-green-500 focus-visible:ring-green-500";
      case "invalid":
        return "border-red-500 focus-visible:ring-red-500";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: "empty" | "valid" | "invalid") => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-muted">
                    <AvatarImage src={formData.avatarPreview || undefined} />
                    <AvatarFallback className="text-2xl">
                      {formData.name ? formData.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  {formData.avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute top-0 right-0 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    className={`pl-10 ${getFieldColor(fieldStatus.name)}`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getStatusIcon(fieldStatus.name)}
                  </div>
                </div>
                {fieldStatus.name === "invalid" && (
                  <p className="text-xs text-red-500">Nome deve ter pelo menos 3 caracteres</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className={`pl-10 ${getFieldColor(fieldStatus.email)}`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getStatusIcon(fieldStatus.email)}
                  </div>
                </div>
                {fieldStatus.email === "invalid" && (
                  <p className="text-xs text-red-500">Digite um email válido</p>
                )}
              </div>

              {/* Data de Nascimento e Sexo */}
              <div className="grid grid-cols-2 gap-4">
                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange("birthDate")}
                      className={`pl-10 ${getFieldColor(fieldStatus.birthDate)}`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getStatusIcon(fieldStatus.birthDate)}
                    </div>
                  </div>
                  {fieldStatus.birthDate === "invalid" && (
                    <p className="text-xs text-red-500">Idade deve ser entre 13 e 120 anos</p>
                  )}
                </div>

                {/* Sexo */}
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo *</Label>
                  <Select onValueChange={handleSexChange} value={formData.sex}>
                    <SelectTrigger className={getFieldColor(fieldStatus.sex)}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {sexOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldStatus.sex === "invalid" && (
                    <p className="text-xs text-red-500">Selecione uma opção</p>
                  )}
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`pl-10 ${getFieldColor(fieldStatus.phone)}`}
                    maxLength={15}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getStatusIcon(fieldStatus.phone)}
                  </div>
                </div>
                {fieldStatus.phone === "invalid" && (
                  <p className="text-xs text-red-500">Formato: (00) 00000-0000</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className={`pl-10 pr-10 ${getFieldColor(fieldStatus.password)}`}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {getStatusIcon(fieldStatus.password)}
                  </div>
                </div>
                {fieldStatus.password === "invalid" && (
                  <p className="text-xs text-red-500">Senha deve ter pelo menos 6 caracteres</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className={`pl-10 pr-10 ${getFieldColor(fieldStatus.confirmPassword)}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {getStatusIcon(fieldStatus.confirmPassword)}
                  </div>
                </div>
                {fieldStatus.confirmPassword === "invalid" && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              {/* Botão de Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Criando conta...
                  </div>
                ) : (
                  "Criar Conta"
                )}
              </Button>

              {/* Link para Login */}
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <a href="/login" className="text-blue-600 hover:underline font-medium">
                  Fazer Login
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
