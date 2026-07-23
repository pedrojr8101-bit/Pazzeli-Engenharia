import { empresaConfig } from "@/lib/empresa-config";

export function CTAFinal() {
  const whatsapp = empresaConfig.whatsapp;
  const mensagem = encodeURIComponent(
    "Olá! Vim pelo site e gostaria de solicitar um orçamento. Qual o próximo passo?"
  );

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
        Energia solar é investimento. E investimento exige segurança.
      </h2>
      <p className="mt-4 text-graphitesoft">
        Você não está apenas instalando placas solares — está investindo em economia,
        previsibilidade e tranquilidade pelos próximos anos.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/simulador"
          className="inline-flex items-center gap-2 rounded-full bg-sun px-6 py-3 text-sm font-semibold text-graphite transition hover:bg-sunlight"
        >
          Simular agora
        </a>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${mensagem}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-borderlight px-6 py-3 text-sm font-semibold text-graphite transition hover:border-sun hover:text-sun"
          >
            Falar no WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
