"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, AlertCircle, Loader2 } from "lucide-react";

export default function AdminPromotePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `✅ ${data.message}` });
        setEmail("");
        loadUsers();
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Erro ao conectar com servidor' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/promote');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Administração de Usuários
          </h1>
        </div>

        {/* Promote Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Promover para ADMIN
            </CardTitle>
            <CardDescription>
              Digite o email do usuário para torná-lo ADMIN e verificar seu email automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email do Usuário
                </label>
                <Input
                  type="email"
                  placeholder="admin@softrha.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  {message.text}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Promover para ADMIN
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
            <CardDescription>
              Lista de todos os usuários com seus cargos e status de email.
            </CardDescription>
            <Button onClick={loadUsers} variant="outline" size="sm">
              Atualizar Lista
            </Button>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Clique em "Atualizar Lista" para carregar os usuários.
              </p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{user.name || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                        {user.emailVerified ? 'Verificado' : 'Não verificado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
