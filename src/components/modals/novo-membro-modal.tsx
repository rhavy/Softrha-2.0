"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, User, Code, Briefcase, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberFormData {
  userId: string;
  area: string;
  role: string;
  technologies: string[];
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MemberData extends MemberFormData {
  id?: string;
}

interface NovoMembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: MemberData) => void;
  memberToEdit?: MemberData | null;
}

const areaOptions = [
  { value: "frontend", label: "Frontend", icon: "🎨" },
  { value: "backend", label: "Backend", icon: "⚙️" },
  { value: "fullstack", label: "Full Stack", icon: "🔄" },
  { value: "mobile", label: "Mobile", icon: "📱" },
  { value: "design", label: "Design/UI/UX", icon: "🎭" },
  { value: "pm", label: "Gerente de Projetos", icon: "📋" },
  { value: "qa", label: "QA/Testing", icon: "✅" },
  { value: "devops", label: "DevOps", icon: "🚀" },
];

const roleOptions = [
  { value: "Desenvolvedor Júnior", label: "Desenvolvedor Júnior" },
  { value: "Desenvolvedor Pleno", label: "Desenvolvedor Pleno" },
  { value: "Desenvolvedor Sênior", label: "Desenvolvedor Sênior" },
  { value: "Tech Lead", label: "Tech Lead" },
  { value: "Designer", label: "Designer" },
  { value: "Gerente de Projetos", label: "Gerente de Projetos" },
  { value: "QA Tester", label: "QA Tester" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
];

const technologyOptions = [
  // Frontend
  { value: "react", label: "React", category: "frontend" },
  { value: "vue", label: "Vue.js", category: "frontend" },
  { value: "angular", label: "Angular", category: "frontend" },
  { value: "nextjs", label: "Next.js", category: "frontend" },
  { value: "typescript", label: "TypeScript", category: "frontend" },
  { value: "javascript", label: "JavaScript", category: "frontend" },
  { value: "html_css", label: "HTML/CSS", category: "frontend" },
  { value: "tailwind", label: "TailwindCSS", category: "frontend" },
  // Backend
  { value: "nodejs", label: "Node.js", category: "backend" },
  { value: "python", label: "Python", category: "backend" },
  { value: "java", label: "Java", category: "backend" },
  { value: "csharp", label: "C#", category: "backend" },
  { value: "php", label: "PHP", category: "backend" },
  { value: "go", label: "Go", category: "backend" },
  { value: "dotnet", label: ".NET", category: "backend" },
  // Database
  { value: "postgresql", label: "PostgreSQL", category: "backend" },
  { value: "mysql", label: "MySQL", category: "backend" },
  { value: "mongodb", label: "MongoDB", category: "backend" },
  { value: "redis", label: "Redis", category: "backend" },
  // Mobile
  { value: "react_native", label: "React Native", category: "mobile" },
  { value: "flutter", label: "Flutter", category: "mobile" },
  { value: "ios", label: "iOS (Swift)", category: "mobile" },
  { value: "android", label: "Android (Kotlin)", category: "mobile" },
  // DevOps
  { value: "docker", label: "Docker", category: "devops" },
  { value: "kubernetes", label: "Kubernetes", category: "devops" },
  { value: "aws", label: "AWS", category: "devops" },
  { value: "azure", label: "Azure", category: "devops" },
  { value: "gcp", label: "Google Cloud", category: "devops" },
  { value: "git", label: "Git", category: "devops" },
  // Design
  { value: "figma", label: "Figma", category: "design" },
  { value: "adobe_xd", label: "Adobe XD", category: "design" },
  { value: "photoshop", label: "Photoshop", category: "design" },
  { value: "illustrator", label: "Illustrator", category: "design" },
];

const statusOptions = [
  { value: "active", label: "Disponível" },
  { value: "busy", label: "Ocupado" },
  { value: "away", label: "Ausente" },
];

export function NovoMembroModal({
  open,
  onOpenChange,
  onSubmit,
  memberToEdit,
}: NovoMembroModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [technologyFilter, setTechnologyFilter] = useState<string>("todos");

  const form = useForm<MemberFormData>({
    defaultValues: {
      userId: "",
      area: "",
      role: "",
      technologies: [],
      status: "active",
    },
  });

  // Carregar usuários disponíveis
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch("/api/equipe/usuarios-disponiveis");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Carregar dados do membro quando estiver editando
  useEffect(() => {
    if (memberToEdit && open) {
      form.reset({
        userId: memberToEdit.id || "",
        area: memberToEdit.area || "",
        role: memberToEdit.role || "",
        technologies: memberToEdit.technologies || [],
        status: memberToEdit.status || "active",
      });
      setSelectedTechnologies(memberToEdit.technologies || []);
    } else if (!memberToEdit && open) {
      form.reset({
        userId: "",
        area: "",
        role: "",
        technologies: [],
        status: "active",
      });
      setSelectedTechnologies([]);
    }
  }, [memberToEdit, open, form]);

  const toggleTechnology = (techId: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(techId)
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };

  const getTechnologyLabel = (techId: string) => {
    const tech = technologyOptions.find(t => t.value === techId);
    return tech?.label || techId;
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || userId;
  };

  const getUserInitials = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return "??";
    const parts = user.name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  const handleSubmit = (data: MemberFormData) => {
    onSubmit?.({ 
      ...data, 
      id: memberToEdit?.id,
      technologies: selectedTechnologies,
    });
    form.reset();
    setSelectedTechnologies([]);
    onOpenChange(false);
  };

  const selectedArea = form.watch("area");

  // Filtrar tecnologias por área selecionada
  const filteredTechnologies = technologyOptions.filter(tech => {
    if (technologyFilter === "todos") return true;
    return tech.category === technologyFilter;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {memberToEdit ? "Editar Membro da Equipe" : "Adicionar Membro à Equipe"}
          </DialogTitle>
          <DialogDescription>
            {memberToEdit
              ? "Atualize as informações do membro da equipe"
              : "Selecione um usuário e defina suas informações na equipe"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Seleção de Usuário */}
            {!memberToEdit && (
              <FormField
                control={form.control}
                name="userId"
                rules={{ required: "Selecione um usuário" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : users.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            Nenhum usuário disponível
                          </div>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Apenas usuários que ainda não são membros da equipe
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Área de Atuação */}
              <FormField
                control={form.control}
                name="area"
                rules={{ required: "Área é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Atuação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cargo */}
              <FormField
                control={form.control}
                name="role"
                rules={{ required: "Cargo é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tecnologias */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Tecnologias
                </FormLabel>
                <Badge variant="secondary">
                  {selectedTechnologies.length} selecionada(s)
                </Badge>
              </div>

              {/* Filtro de categorias */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={technologyFilter === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTechnologyFilter("todos")}
                >
                  Todas
                </Button>
                {selectedArea && (
                  <>
                    <Button
                      type="button"
                      variant={technologyFilter === selectedArea ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTechnologyFilter(selectedArea)}
                    >
                      {areaOptions.find(a => a.value === selectedArea)?.label}
                    </Button>
                    <Button
                      type="button"
                      variant={technologyFilter === "backend" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTechnologyFilter("backend")}
                    >
                      Backend
                    </Button>
                    <Button
                      type="button"
                      variant={technologyFilter === "devops" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTechnologyFilter("devops")}
                    >
                      DevOps
                    </Button>
                  </>
                )}
              </div>

              <ScrollArea className="h-48 border rounded-lg p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredTechnologies.map((tech) => {
                    const isSelected = selectedTechnologies.includes(tech.value);
                    return (
                      <button
                        key={tech.value}
                        type="button"
                        onClick={() => toggleTechnology(tech.value)}
                        className={`p-2 rounded-lg text-sm transition-colors text-left ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {tech.label}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Tecnologias selecionadas */}
              {selectedTechnologies.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnologies.map((techId) => (
                      <Badge
                        key={techId}
                        variant="outline"
                        className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => toggleTechnology(techId)}
                      >
                        {getTechnologyLabel(techId)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {memberToEdit ? "Salvar Alterações" : "Adicionar à Equipe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
