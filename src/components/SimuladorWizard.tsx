"use client";

import { useState, type FormEvent } from "react";
import type { ResultadoSimulacao } from "@/lib/types";
import { ResultadoCard } from "./ResultadoCard";

type GrupoTarifario = "A" | "B";
type TipoLigacao = "MONOFASICO" | "BIFASICO" | "TRIFASICO";

interface DadosTecnicos {
  cep: string;
  grupoTarifario: GrupoTarifario;
  tipoLigacao: TipoLigacao;
  consumoMedioKwh: string;
  tarifaKwh: string;
}

interface DadosContato {
  nome: string;
  email: string;
  telefone: string;
}

const DADOS_TECNICOS_INICIAIS: DadosTecnicos = {
  cep: "",
  grupoTarifario: "B",
  tipoLigacao: "TRIFASICO",
  consumoMedioKwh: "",
  tarifaKwh: "",
};

const DADOS_CONTATO_INICIAIS: DadosContato = { nome: "", email: "", telefone: "" };

export function SimuladorWizard() {
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [tecnicos, setTecnicos] = useState<DadosTecnicos>(DADOS_TECNICOS_INICIAIS);
  const [contato, setContato] = useState<DadosContato>(DADOS_CONTATO_INICIAIS);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  function avancarParaContato(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setPasso(2);
  }

  async function enviarSimulacao(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contato,
          cep: tecnicos.cep,
          grupoTarifario: tecnicos.grupoTarifario,
          tipoLigacao: tecnicos.tipoLigacao,
          consumoMedioKwh: tecnicos.consumoMedioKwh,
          tarifaKwh: tecnicos.tarifaKwh || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.erro ?? "Não foi possível concluir a simulação.");
      }

      setResultado(data.resultado);
      setPasso(3);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  if (passo === 3 && resultado) {
    return <ResultadoCard resultado={resultado} />;
  }

  return (
    <div>
      <ol className="mb-8 flex gap-2 text-xs text-paper/40">
        <li className={passo === 1 ? "text-sun" : ""}>1. Consumo</li>
        <span>·</span>
        <li className={passo === 2 ? "text-sun" : ""}>2. Contato</li>
        <span>·</span>
        <li>3. Resultado</li>
      </ol>

      {passo === 1 && (
        <form onSubmit={avancarParaContato} className="space-y-6">
          <Campo label="CEP" htmlFor="cep">
            <input
              id="cep"
              required
              inputMode="numeric"
              placeholder="00000-000"
              value={tecnicos.cep}
              onChange={(e) => setTecnicos({ ...tecnicos, cep: e.target.value })}
              className={inputClasse}
            />
          </Campo>

          <Campo label="Grupo tarifário" htmlFor="grupo">
            <div className="flex gap-3">
              {(["B", "A"] as const).map((grupo) => (
                <button
                  type="button"
                  key={grupo}
                  onClick={() => setTecnicos({ ...tecnicos, grupoTarifario: grupo })}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    tecnicos.grupoTarifario === grupo
                      ? "border-sun bg-sun/10 text-sun"
                      : "border-duskline text-paper/60 hover:border-paper/30"
                  }`}
                >
                  Grupo {grupo} {grupo === "B" ? "(residencial/comercial)" : "(alta tensão)"}
                </button>
              ))}
            </div>
          </Campo>

          {tecnicos.grupoTarifario === "B" && (
            <Campo label="Tipo de ligação" htmlFor="ligacao">
              <select
                id="ligacao"
                value={tecnicos.tipoLigacao}
                onChange={(e) =>
                  setTecnicos({ ...tecnicos, tipoLigacao: e.target.value as TipoLigacao })
                }
                className={inputClasse}
              >
                <option value="MONOFASICO">Monofásico</option>
                <option value="BIFASICO">Bifásico</option>
                <option value="TRIFASICO">Trifásico</option>
              </select>
            </Campo>
          )}

          <Campo label="Consumo médio mensal (kWh)" htmlFor="consumo">
            <input
              id="consumo"
              required
              inputMode="decimal"
              placeholder="ex: 450"
              value={tecnicos.consumoMedioKwh}
              onChange={(e) => setTecnicos({ ...tecnicos, consumoMedioKwh: e.target.value })}
              className={inputClasse}
            />
            <p className="mt-1 text-xs text-paper/40">
              Está na sua fatura de energia, em kWh.
            </p>
          </Campo>

          <Campo label="Tarifa (R$/kWh) — opcional" htmlFor="tarifa">
            <input
              id="tarifa"
              inputMode="decimal"
              placeholder="ex: 0,92"
              value={tecnicos.tarifaKwh}
              onChange={(e) => setTecnicos({ ...tecnicos, tarifaKwh: e.target.value })}
              className={inputClasse}
            />
          </Campo>

          <button type="submit" className={botaoClasse}>
            Continuar
          </button>
        </form>
      )}

      {passo === 2 && (
        <form onSubmit={enviarSimulacao} className="space-y-6">
          <Campo label="Nome completo" htmlFor="nome">
            <input
              id="nome"
              required
              value={contato.nome}
              onChange={(e) => setContato({ ...contato, nome: e.target.value })}
              className={inputClasse}
            />
          </Campo>
          <Campo label="E-mail" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              value={contato.email}
              onChange={(e) => setContato({ ...contato, email: e.target.value })}
              className={inputClasse}
            />
          </Campo>
          <Campo label="Telefone / WhatsApp" htmlFor="telefone">
            <input
              id="telefone"
              required
              placeholder="(00) 00000-0000"
              value={contato.telefone}
              onChange={(e) => setContato({ ...contato, telefone: e.target.value })}
              className={inputClasse}
            />
          </Campo>

          {erro && <p className="text-sm text-ember">{erro}</p>}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={carregando} className={botaoClasse}>
              {carregando ? "Calculando..." : "Ver meu resultado"}
            </button>
            <button
              type="button"
              onClick={() => setPasso(1)}
              className="text-sm text-paper/50 hover:text-paper"
            >
              Voltar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputClasse =
  "w-full rounded-lg border border-duskline bg-night px-4 py-3 text-paper outline-none transition focus:border-sun";
const botaoClasse =
  "rounded-full bg-sun px-6 py-3 text-sm font-semibold text-night transition hover:bg-sunlight disabled:opacity-50";

function Campo({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm text-paper/70">
        {label}
      </label>
      {children}
    </div>
  );
}
