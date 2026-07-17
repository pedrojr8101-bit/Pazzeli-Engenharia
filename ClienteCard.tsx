"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível entrar.");
        return;
      }

      router.push(searchParams.get("redirect") || "/admin");
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="w-full max-w-sm space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-paper/70">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-duskline bg-dusk px-4 py-3 text-paper outline-none focus:border-sun"
        />
      </div>

      <div>
        <label htmlFor="senha" className="mb-2 block text-sm text-paper/70">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-lg border border-duskline bg-dusk px-4 py-3 text-paper outline-none focus:border-sun"
        />
      </div>

      {erro && <p className="text-sm text-ember">{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-full bg-sun px-6 py-3 text-sm font-semibold text-night transition hover:bg-sunlight disabled:opacity-50"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
