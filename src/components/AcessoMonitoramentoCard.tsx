"use client";

import { useState } from "react";
import { empresaConfig } from "@/lib/empresa-config";

export function AcessoMonitoramentoCard({
  link,
  usuario,
  senha,
}: {
  link: string | null;
  usuario: string | null;
  senha: string | null;
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const whatsappLink = `https://wa.me/${empresaConfig.whatsapp}?text=${encodeURIComponent(
    "Oi! Ainda não tenho acesso à plataforma de monitoramento. Pode me passar?"
  )}`;

  if (!link) {
    return (
      <div className="rounded-2xl border border-borderlight p-6">
        <p className="font-display text-base font-semibold text-graphite">
          Plataforma de monitoramento
        </p>
        <p className="mt-1 text-sm text-graphitesoft">
          Seu acesso à plataforma do provedor ainda não foi cadastrado aqui. Fale com a gente pra
          receber.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full border border-borderlight px-5 py-2.5 text-sm text-graphite transition hover:border-sun"
        >
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-borderlight p-6">
      <p className="font-display text-base font-semibold text-graphite">
        Plataforma de monitoramento
      </p>
      <p className="mt-1 text-sm text-graphitesoft">
        Acompanhe a geração do seu sistema direto no site do provedor.
      </p>

      {(usuario || senha) && (
        <div className="mt-4 space-y-1.5 text-sm">
          {usuario && (
            <p className="text-graphite">
              <span className="text-graphitesoft">Usuário: </span>
              {usuario}
            </p>
          )}
          {senha && (
            <div className="flex items-center gap-2 text-graphite">
              <span className="text-graphitesoft">Senha: </span>
              <span className="font-mono">{mostrarSenha ? senha : "••••••••"}</span>
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="text-xs text-graphitesoft underline hover:text-sun"
              >
                {mostrarSenha ? "ocultar" : "ver"}
              </button>
            </div>
          )}
        </div>
      )}

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-graphite transition hover:bg-sunlight"
      >
        Abrir plataforma
      </a>
    </div>
  );
}
