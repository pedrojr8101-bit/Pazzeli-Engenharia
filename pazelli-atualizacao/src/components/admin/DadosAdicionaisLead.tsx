"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIPOS_IMOVEL = [
  { valor: "RESIDENCIAL", rotulo: "Residencial" },
  { valor: "COMERCIAL", rotulo: "Comercial" },
] as const;

export function DadosAdicionaisLead({
  leadId,
  tipoImovelAtual,
  contratoUrlAtual,
}: {
  leadId: string;
  tipoImovelAtual: string | null;
  contratoUrlAtual: string | null;
}) {
  const router = useRouter();
  const [tipoImovel, setTipoImovel] = useState(tipoImovelAtual ?? "");
  const [contratoUrl, setContratoUrl] = useState(contratoUrlAtual ?? "");
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
          tipoImovel: tipoImovel || null,
          contratoUrl: contratoUrl.trim() || null,
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
        Imóvel e contrato
      </p>
      <p className="mt-1 text-xs text-paper/40">
        Usado no dashboard (residencial x comercial) e na área do cliente (botão de baixar
        contrato).
      </p>

      <div className="mt-4">
        <p className="mb-2 text-xs text-paper/50">Tipo de imóvel</p>
        <div className="flex gap-2">
          {TIPOS_IMOVEL.map((tipo) => (
            <button
              key={tipo.valor}
              type="button"
              onClick={() => setTipoImovel(tipo.valor)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                tipoImovel === tipo.valor
                  ? "border-sun bg-sun/10 text-sun"
                  : "border-duskline text-paper/60 hover:border-paper/30"
              }`}
            >
              {tipo.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor={`contrato-${leadId}`} className="mb-1 block text-xs text-paper/50">
          Link do contrato assinado (ex: PDF no Google Drive, com compartilhamento público)
        </label>
        <input
          id={`contrato-${leadId}`}
          value={contratoUrl}
          onChange={(e) => setContratoUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="w-full rounded-lg border border-duskline bg-dusk px-3 py-2 text-sm text-paper outline-none focus:border-sun"
        />
      </div>

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
