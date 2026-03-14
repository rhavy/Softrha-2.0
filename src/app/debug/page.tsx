"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/hooks/use-auth";

export default function DebugPage() {
  const [cookies, setCookies] = useState<string[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ler cookies
    const cookieList = document.cookie.split(";").map(c => c.trim());
    setCookies(cookieList);

    // Verificar sessão
    authClient.getSession().then(data => {
      setSession(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Debug de Autenticação</h1>

      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          {cookies.length === 0 ? (
            <p className="text-gray-400">Nenhum cookie encontrado</p>
          ) : (
            <ul className="space-y-2">
              {cookies.map((cookie, i) => (
                <li key={i} className="font-mono text-sm bg-gray-700 p-2 rounded">
                  {cookie}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sessão</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : session?.user ? (
            <pre className="font-mono text-sm bg-gray-700 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-400">Nenhuma sessão ativa</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Recarregar
          </button>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Ir para Login
          </button>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
