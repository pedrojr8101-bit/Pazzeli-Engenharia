import { empresaConfig } from "@/lib/empresa-config";

const MENSAGEM_PADRAO =
  "Olá! Vim pelo site e gostaria de solicitar um orçamento. Qual o próximo passo?";

export function BotaoWhatsApp() {
  const numero = empresaConfig.whatsapp;
  if (!numero) return null;

  const link = `https://wa.me/${numero}?text=${encodeURIComponent(MENSAGEM_PADRAO)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-night shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-night" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.07-1.33A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18c-1.6 0-3.1-.43-4.4-1.19l-.32-.19-3.01.79.8-2.93-.2-.3A7.97 7.97 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8Zm4.4-5.9c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
      </svg>
      Fale no WhatsApp
    </a>
  );
}
