"use client";

import { useMemo, useState } from "react";
import { ClienteCard } from "./ClienteCard";

interface ClienteResumo {
  leadId: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string | null;
  uf: string | null;
  fechadoEm: Date;
  simulacao: {
    id: string;
    potenciaInstaladaKwp: number;
    numeroPaineis: number;
    economiaMensalEstimada: number;
    investimentoEstimado: number;
    investimentoFinal: number | null;
  } | null;
}

export function ClientesGrid({ clientes }: { clientes: ClienteResumo[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo) ||
        (c.cidade ?? "").toLowerCase().includes(termo)
    );
  }, [clientes, busca]);

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar cliente por nome, e-mail ou cidade..."
        className="mb-4 w-full rounded-lg border border-duskline bg-dusk px-4 py-2.5 text-sm text-paper outline-none focus:border-sun sm:max-w-sm"
      />

      {filtrados.length === 0 ? (
        <p className="rounded-2xl border border-duskline p-6 text-sm text-paper/50">
          Nenhum cliente encontrado.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtrados.map((cliente) => (
            <ClienteCard key={cliente.leadId} {...cliente} />
          ))}
        </div>
      )}
    </div>
  );
}
