import { empresaConfig } from "@/lib/empresa-config";

export function ContratoCard({ contratoUrl }: { contratoUrl: string | null }) {
  const whatsappLink = `https://wa.me/${empresaConfig.whatsapp}?text=${encodeURIComponent(
    "Oi! Gostaria de receber uma cópia do meu contrato."
  )}`;

  return (
    <div className="rounded-2xl border border-borderlight p-6">
      <p className="font-display text-base font-semibold text-graphite">Seu contrato</p>

      {contratoUrl ? (
        <>
          <p className="mt-1 text-sm text-graphitesoft">
            O contrato assinado do seu sistema está disponível para consulta.
          </p>
          <a
            href={contratoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-graphite transition hover:bg-sunlight"
          >
            Ver contrato
          </a>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-graphitesoft">
            Seu contrato ainda não foi disponibilizado aqui. Fale com a gente pra receber uma
            cópia.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-borderlight px-5 py-2.5 text-sm text-graphite transition hover:border-sun"
          >
            Falar no WhatsApp
          </a>
        </>
      )}
    </div>
  );
}
