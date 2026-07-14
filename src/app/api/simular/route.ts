import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { simular } from "@/lib/dimensionamento";

export const dynamic = "force-dynamic";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo."),
  email: z.string().trim().email("E-mail inválido."),
  telefone: z.string().trim().min(8, "Telefone inválido."),
  cep: z.string().trim().min(8, "CEP inválido."),
  grupoTarifario: z.enum(["A", "B"]),
  tipoLigacao: z.enum(["MONOFASICO", "BIFASICO", "TRIFASICO"]).optional(),
  consumoMedioKwh: z.coerce.number().positive("Informe um consumo médio válido."),
  tarifaKwh: z.coerce.number().positive().optional(),
  origem: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Dados inválidos.", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const dados = parsed.data;

  try {
    const resultado = await simular({
      cep: dados.cep,
      grupoTarifario: dados.grupoTarifario,
      tipoLigacao: dados.tipoLigacao,
      consumoMedioKwh: dados.consumoMedioKwh,
      tarifaKwh: dados.tarifaKwh,
    });

    const lead = await prisma.lead.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cep: dados.cep,
        cidade: resultado.localizacao.cidade,
        uf: resultado.localizacao.uf,
        origem: dados.origem ?? "site",
        simulacoes: {
          create: {
            cep: dados.cep,
            grupoTarifario: dados.grupoTarifario,
            tipoLigacao: dados.tipoLigacao,
            consumoMedioKwh: dados.consumoMedioKwh,
            tarifaKwh: resultado.tarifaKwhUtilizada,

            latitude: resultado.localizacao.latitude,
            longitude: resultado.localizacao.longitude,
            cidade: resultado.localizacao.cidade,
            uf: resultado.localizacao.uf,

            hspMedioAnual: resultado.irradiacao.hspMedioAnual,
            hspMensal: resultado.irradiacao.hspMensal,

            potenciaNecessariaKwp: resultado.potenciaNecessariaKwp,
            potenciaInstaladaKwp: resultado.potenciaInstaladaKwp,
            numeroPaineis: resultado.numeroPaineis,
            potenciaPainelW: resultado.potenciaPainelW,
            geracaoMensalKwh: resultado.geracaoMensalKwh,
            geracaoAnualKwh: resultado.geracaoAnualKwh,
            classificacaoGD: resultado.classificacaoGD,

            percentualFioBAno: resultado.percentualFioBAno,
            fatorSimultaneidade: resultado.fatorSimultaneidade,
            custoFioBMensal: resultado.custoFioBMensal,
            custoDisponibilidadeMensal: resultado.custoDisponibilidadeMensal,

            economiaMensalEstimada: resultado.economiaMensalEstimada,
            economiaAnualEstimada: resultado.economiaAnualEstimada,
            investimentoEstimado: resultado.investimentoEstimado,
            paybackAnos: Number.isFinite(resultado.paybackAnos) ? resultado.paybackAnos : null,
          },
        },
      },
    });

    return NextResponse.json({ leadId: lead.id, resultado });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro inesperado ao simular.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }
}
