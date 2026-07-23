"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcessoMonitoramento({
  leadId,
  linkAtual,
  usuarioAtual,
  senhaAtual,
}: {
  leadId: string;
  linkAtual: string | null;
  usuarioAtual: string | null;
  senhaAtual: string | null;
}) {
  const router = useRouter();
  const [link, setLink] = useState(linkAtual ?? "");
  const [usuario, setUsuario] = useState(usuarioAtual ?? "");
  const [senha, setSenha] = useState(senhaAtual ?? "");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setSucesso(false);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monitoramentoLink: link.trim() || null,
          monitoramentoUsuario: usuario.trim() || null,
          monitoramentoSenha: senha.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.erro ?? "Não foi possível salvar.");
        return;
      }
      setSucesso(true);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-duskline p-5">
      <p className="font-display text-base font-semibold text-paper">
        Acesso à plataforma de monitoramento
      </p>
      <p className="mt-1 text-xs text-paper/40">
        Preencha com os dados de login que o cliente usa no site do provedor (ex: SolarZ, SAJ,
        Elekeeper...). Isso aparece na área do cliente pra ele acessar direto, sem precisarmos de
        integração via API.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`link-${leadId}`} className="mb-1 block text-xs text-paper/50">
            Link da plataforma do provedor
          </label>
          <input
            id={`link-${leadId}`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://app.solarz.com.br"
            className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`usuario-${leadId}`} className="mb-1 block text-xs text-paper/50">
              Usuário / e-mail de login
            </label>
            <input
              id={`usuario-${leadId}`}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="cliente@email.com"
              className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
            />
          </div>
          <div>
            <label htmlFor={`senha-${leadId}`} className="mb-1 block text-xs text-paper/50">
              Senha
            </label>
            <div className="flex gap-2">
              <input
                id={`senha-${leadId}`}
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="shrink-0 rounded-lg border border-duskline px-3 text-xs text-paper/60 hover:border-paper/30"
              >
                {mostrarSenha ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-ember/80">
        Atenção: a senha fica salva em texto simples no banco, pra poder ser mostrada de volta ao
        cliente. Não use aqui nenhuma senha que o cliente reaproveite em outras contas importantes
        — oriente-o a usar uma senha exclusiva para essa plataforma.
      </p>

      {erro && <p className="mt-3 text-sm text-ember">{erro}</p>}

      <button
        type="button"
        onClick={salvar}
        disabled={salvando}
        className="mt-4 rounded-full bg-sun px-5 py-2 text-xs font-semibold text-night hover:bg-sunlight disabled:opacity-50"
      >
        {salvando ? "Salvando..." : "Salvar"}
      </button>
      {sucesso && <p className="mt-2 text-xs text-sky">Salvo!</p>}
    </div>
  );
}
