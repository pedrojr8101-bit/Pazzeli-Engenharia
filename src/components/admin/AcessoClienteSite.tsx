"use client";

import { useState } from "react";

function gerarSenhaAleatoria() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let senha = "";
  for (let i = 0; i < 8; i++) {
    senha += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return senha;
}

export function AcessoClienteSite({ leadId, emailLead }: { leadId: string; emailLead: string }) {
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/acesso-cliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível salvar.");
        return;
      }
      setSalvo(true);
    } finally {
      setSalvando(false);
    }
  }

  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Já liberamos seu acesso à área do cliente. Acesse com o e-mail ${emailLead} e a senha: ${senha}`
  );

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <p className="font-display text-base font-semibold text-paper">
        Acesso do cliente ao site
      </p>
      <p className="mt-1 text-xs text-paper/40">
        Define a senha que o cliente usa pra logar em <code>/cliente/login</code> com o e-mail{" "}
        <span className="text-paper/70">{emailLead}</span>.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="mínimo 6 caracteres"
          className="flex-1 rounded-lg border border-duskline bg-night px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
        <button
          type="button"
          onClick={() => setSenha(gerarSenhaAleatoria())}
          className="shrink-0 rounded-full border border-duskline px-3 text-xs text-paper/70 hover:border-paper/30"
        >
          Gerar
        </button>
      </div>

      {erro && <p className="mt-2 text-sm text-ember">{erro}</p>}

      <button
        type="button"
        onClick={salvar}
        disabled={salvando || senha.length < 6}
        className="mt-4 rounded-full bg-sun px-5 py-2 text-xs font-semibold text-night hover:bg-sunlight disabled:opacity-50"
      >
        {salvando ? "Salvando..." : "Salvar e liberar acesso"}
      </button>

      {salvo && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-sky">
            Acesso liberado! Envie o e-mail e a senha pro cliente — a senha não fica salva em
            texto simples, então só aparece aqui agora, não dá pra recuperar depois.
          </p>
          <a
            href={`https://wa.me/?text=${mensagemWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-duskline px-4 py-1.5 text-xs text-paper/80 hover:border-sun hover:text-sun"
          >
            Enviar pelo WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
