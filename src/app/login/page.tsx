"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Github,
  Chrome,
  AlertCircle,
  Sparkles,
  Rocket,
  Zap,
  Shield,
} from "lucide-react";
import { authClient } from "@/hooks/use-auth";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Erro ao fazer login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError("Erro ao conectar com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (err) {
      setError("Erro ao conectar com GitHub.");
    } finally {
      setLoading(false);
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
              Bem-vindo de volta
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold drop-shadow-lg"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Acesse sua Conta
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-cyan-100/80 max-w-md"
          >
            Gerencie seus projetos e acompanhe o progresso em tempo real.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-6 pt-8"
          >
            {[
              { icon: Rocket, label: "Projetos" },
              { icon: Zap, label: "Rápido" },
              { icon: Shield, label: "Seguro" },
              { icon: Sparkles, label: "Moderno" },
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
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

          <Card className="border-cyan-400/20 backdrop-blur-sm bg-slate-900/50">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.png" alt="SoftRha" className="h-10 w-10 rounded-lg" />
                <span className="text-xl font-bold text-white">SoftRha</span>
              </div>
              <CardTitle className="text-2xl text-white">Login</CardTitle>
              <CardDescription className="text-cyan-100/70">
                Entre com suas credenciais para acessar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-md bg-red-500/20 border border-red-400/30 text-red-300 text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyan-100">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cyan-100">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-100/50" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-900/50 border-cyan-400/30 text-white placeholder:text-cyan-100/40 focus:border-cyan-400/60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-cyan-100/50 hover:text-cyan-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900/50 px-2 text-cyan-100/70 backdrop-blur-sm">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGithubSignIn} className="gap-2 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" onClick={handleGoogleSignIn} className="gap-2 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                  <Chrome className="h-4 w-4" />
                  Google
                </Button>
              </div>

              <p className="text-center text-sm text-cyan-100/70">
                Não tem uma conta?{" "}
                <Link href="/registro" className="text-cyan-300 font-medium hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
