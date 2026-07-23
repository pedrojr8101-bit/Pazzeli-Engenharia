import { empresaConfig } from "@/lib/empresa-config";

export function InfoEmpresaCard() {
  const endereco = empresaConfig.endereco;
  const whatsappLink = `https://wa.me/${empresaConfig.whatsapp}`;

  return (
    <div className="rounded-2xl border border-borderlight p-6">
      <p className="font-display text-base font-semibold text-graphite">{empresaConfig.nome}</p>
      <p className="mt-1 text-sm text-graphitesoft">
        {endereco.rua}, {endereco.bairro} — {endereco.cidade}/{endereco.uf}
      </p>

      <div className="mt-4 space-y-1.5 text-sm">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-graphite hover:text-sun"
        >
          WhatsApp: {empresaConfig.telefoneSecundario}
        </a>
        <p className="text-graphitesoft">Telefone: {empresaConfig.telefone}</p>
        <a href={`mailto:${empresaConfig.email}`} className="block text-graphite hover:text-sun">
          {empresaConfig.email}
        </a>
      </div>
    </div>
  );
}
