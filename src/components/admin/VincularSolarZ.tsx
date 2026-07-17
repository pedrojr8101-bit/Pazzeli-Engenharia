"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UsinaEncontrada {
  id: number;
  name: string;
  installedPower: number;
  cliente?: { nome?: string; email?: string; cpf?: string };
}

export function VincularSolarZ({
  leadId,
  emailLead,
  plantIdAtual,
}: {
  leadId: string;
  emailLead: string;
  plantIdAtual: number | null;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState(emailLead);
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<UsinaEncontrada[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [usinaSelecionada, setUsinaSelecionada] = useState<UsinaEncontrada | null>(null);
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function buscar() {
    setBuscando(true);
    setErro(null);
    setResultados(null);
    try {
      const ehEmail = busca.includes("@");
      const parametro = ehEmail ? `email=${encodeURIComponent(busca)}` : `documento=${encodeURIComponent(busca)}`;
      const res = await fetch(`/api/admin/leads/${leadId}/solarz?${parametro}`);
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Erro na busca.");
        return;
      }
      setResultados(data.content ?? []);
    } finally {
      setBuscando(false);
    }
  }

  async function vincular() {
    if (!usinaSelecionada) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/solarz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solarzPlantId: usinaSelecionada.id,
          senha: senha || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível vincular.");
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
      <p className="font-display text-base font-semibold text-paper">Monitoramento SolarZ</p>

      {plantIdAtual ? (
        <p className="mt-2 text-sm text-sky">Usina vinculada — id {plantIdAtual}</p>
      ) : (
        <p className="mt-2 text-sm text-paper/50">Nenhuma usina vinculada ainda.</p>
      )}

      <div className="mt-4 flex gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="E-mail ou CPF do cliente"
          className="flex-1 rounded-lg border border-duskline bg-night px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
        <button
          onClick={buscar}
          disabled={buscando}
          className="rounded-full border border-duskline px-4 py-2 text-xs text-paper/80 hover:border-sun hover:text-sun disabled:opacity-50"
        >
          {buscando ? "Buscando..." : "Buscar na SolarZ"}
        </button>
      </div>

      {erro && <p className="mt-2 text-sm text-ember">{erro}</p>}

      {resultados && resultados.length === 0 && (
        <p className="mt-3 text-sm text-paper/40">Nenhuma usina encontrada com esse dado.</p>
      )}

      {resultados && resultados.length > 0 && (
        <div className="mt-3 space-y-2">
          {resultados.map((usina) => (
            <button
              key={usina.id}
              onClick={() => setUsinaSelecionada(usina)}
              className={`block w-full rounded-lg border p-3 text-left text-sm transition ${
                usinaSelecionada?.id === usina.id
                  ? "border-sun bg-sun/10"
                  : "border-duskline hover:border-paper/30"
              }`}
            >
              <p className="text-paper">{usina.name}</p>
              <p className="text-xs text-paper/40">
                {usina.installedPower} kWp · {usina.cliente?.nome ?? "sem nome"} ·{" "}
                {usina.cliente?.email ?? "sem e-mail"}
              </p>
            </button>
          ))}
        </div>
      )}

      {usinaSelecionada && (
        <div className="mt-4 space-y-3 border-t border-duskline pt-4">
          <div>
            <label htmlFor={`senha-${leadId}`} className="mb-1 block text-xs text-paper/50">
              {plantIdAtual
                ? "Nova senha de acesso (deixe em branco para manter a atual)"
                : "Senha de acesso do cliente"}
            </label>
            <input
              id={`senha-${leadId}`}
              type="text"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
              className="w-full rounded-lg border border-duskline bg-night px-3 py-2 text-sm text-paper outline-none focus:border-sun"
            />
          </div>
          <button
            onClick={vincular}
            disabled={salvando}
            className="rounded-full bg-sun px-5 py-2 text-xs font-semibold text-night hover:bg-sunlight disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Vincular e liberar acesso"}
          </button>
          {sucesso && <p className="text-xs text-sky">Vinculado! Já pode passar o e-mail e senha pro cliente.</p>}
        </div>
      )}
    </div>
  );
}
