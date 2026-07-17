"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginClienteForm() {
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
      const res = await fetch("/api/cliente/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível entrar.");
        return;
      }

      router.push(searchParams.get("redirect") || "/cliente");
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="w-full max-w-sm space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-graphitesoft">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-borderlight bg-cloud px-4 py-3 text-graphite outline-none focus:border-sun"
        />
      </div>

      <div>
        <label htmlFor="senha" className="mb-2 block text-sm text-graphitesoft">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-lg border border-borderlight bg-cloud px-4 py-3 text-graphite outline-none focus:border-sun"
        />
      </div>

      {erro && <p className="text-sm text-ember">{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-full bg-sun px-6 py-3 text-sm font-semibold text-graphite transition hover:bg-sunlight disabled:opacity-50"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-center text-xs text-graphite/40">
        Esqueceu a senha ou ainda não tem acesso? Fale com a nossa equipe.
      </p>
    </form>
  );
}
