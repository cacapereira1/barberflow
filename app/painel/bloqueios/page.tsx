"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import {
  cadastrarBloqueio,
  excluirBloqueio,
} from "@/lib/bloqueios";

type Barbeiro = {
  id: number;
  nome: string;
  ativo: boolean;
};

type BloqueioComBarbeiro = {
  id: number;
  barbeiro_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  motivo: string | null;
  created_at: string;
  barbeiros:
    | {
        id: number;
        nome: string;
      }
    | {
        id: number;
        nome: string;
      }[]
    | null;
};

function obterDataDeHoje() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(
    hoje.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    hoje.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string) {
  if (!data) {
    return "Data não informada";
  }

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario: string) {
  return horario?.slice(0, 5) || "—";
}

function obterNomeBarbeiro(
  barbeiros: BloqueioComBarbeiro["barbeiros"],
) {
  if (!barbeiros) {
    return "Barbeiro não encontrado";
  }

  if (Array.isArray(barbeiros)) {
    return (
      barbeiros[0]?.nome ??
      "Barbeiro não encontrado"
    );
  }

  return barbeiros.nome;
}

export default function PainelBloqueios() {
  const [barbeiros, setBarbeiros] = useState<
    Barbeiro[]
  >([]);

  const [bloqueios, setBloqueios] = useState<
    BloqueioComBarbeiro[]
  >([]);

  const [barbeiroId, setBarbeiroId] =
    useState("");

  const [data, setData] = useState(
    obterDataDeHoje(),
  );

  const [horaInicio, setHoraInicio] =
    useState("09:00");

  const [horaFim, setHoraFim] =
    useState("10:00");

  const [motivo, setMotivo] = useState("");

  const [filtroBarbeiro, setFiltroBarbeiro] =
    useState("Todos");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [processandoId, setProcessandoId] =
    useState<number | null>(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] =
    useState("");

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const [
      resultadoBarbeiros,
      resultadoBloqueios,
    ] = await Promise.all([
      supabase
        .from("barbeiros")
        .select("id, nome, ativo")
        .eq("ativo", true)
        .order("nome", {
          ascending: true,
        }),

      supabase
        .from("bloqueios_agenda")
        .select(`
          id,
          barbeiro_id,
          data,
          hora_inicio,
          hora_fim,
          motivo,
          created_at,
          barbeiros (
            id,
            nome
          )
        `)
        .order("data", {
          ascending: true,
        })
        .order("hora_inicio", {
          ascending: true,
        }),
    ]);

    if (resultadoBarbeiros.error) {
      console.error(
        "Erro ao carregar barbeiros:",
        resultadoBarbeiros.error,
      );

      setErro(
        `Erro ao carregar barbeiros: ${resultadoBarbeiros.error.message}`,
      );

      setCarregando(false);
      return;
    }

    if (resultadoBloqueios.error) {
      console.error(
        "Erro ao carregar bloqueios:",
        resultadoBloqueios.error,
      );

      setErro(
        `Erro ao carregar bloqueios: ${resultadoBloqueios.error.message}`,
      );

      setCarregando(false);
      return;
    }

    const barbeirosCarregados =
      (resultadoBarbeiros.data ??
        []) as Barbeiro[];

    setBarbeiros(barbeirosCarregados);

    setBloqueios(
      (resultadoBloqueios.data ??
        []) as BloqueioComBarbeiro[],
    );

    if (
      !barbeiroId &&
      barbeirosCarregados.length > 0
    ) {
      setBarbeiroId(
        String(barbeirosCarregados[0].id),
      );
    }

    setCarregando(false);
  }, [barbeiroId]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  const bloqueiosFiltrados = useMemo(() => {
    if (filtroBarbeiro === "Todos") {
      return bloqueios;
    }

    return bloqueios.filter(
      (bloqueio) =>
        String(bloqueio.barbeiro_id) ===
        filtroBarbeiro,
    );
  }, [bloqueios, filtroBarbeiro]);

  function limparFormulario() {
    setData(obterDataDeHoje());
    setHoraInicio("09:00");
    setHoraFim("10:00");
    setMotivo("");
  }

  async function salvarBloqueio(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!barbeiroId) {
      setErro("Selecione um barbeiro.");
      return;
    }

    if (!data) {
      setErro("Selecione uma data.");
      return;
    }

    if (!horaInicio || !horaFim) {
      setErro(
        "Informe o horário inicial e final.",
      );

      return;
    }

    if (horaInicio >= horaFim) {
      setErro(
        "O horário inicial deve ser anterior ao horário final.",
      );

      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const barbeiroSelecionado =
      barbeiros.find(
        (barbeiro) =>
          barbeiro.id ===
          Number(barbeiroId),
      );

    const {
      data: bloqueiosConflitantes,
      error: erroConflito,
    } = await supabase
      .from("bloqueios_agenda")
      .select(
        "id, hora_inicio, hora_fim",
      )
      .eq(
        "barbeiro_id",
        Number(barbeiroId),
      )
      .eq("data", data)
      .lt("hora_inicio", horaFim)
      .gt("hora_fim", horaInicio)
      .limit(1);

    if (erroConflito) {
      console.error(
        "Erro ao verificar conflito:",
        erroConflito,
      );

      setErro(
        `Erro ao verificar bloqueios: ${erroConflito.message}`,
      );

      setSalvando(false);
      return;
    }

    if (
      bloqueiosConflitantes &&
      bloqueiosConflitantes.length > 0
    ) {
      setErro(
        "Já existe um bloqueio neste período.",
      );

      setSalvando(false);
      return;
    }

    const { error } =
      await cadastrarBloqueio({
        barbeiro_id:
          Number(barbeiroId),
        data,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        motivo: motivo.trim() || null,
      });

    if (error) {
      console.error(
        "Erro ao cadastrar bloqueio:",
        error,
      );

      setErro(
        `Erro ao cadastrar bloqueio: ${error.message}`,
      );

      setSalvando(false);
      return;
    }

    limparFormulario();

    setMensagem(
      `Bloqueio criado para ${
        barbeiroSelecionado?.nome ??
        "o barbeiro"
      }.`,
    );

    setSalvando(false);

    await buscarDados();
  }

  async function removerBloqueio(
    bloqueio: BloqueioComBarbeiro,
  ) {
    const confirmou = window.confirm(
      `Excluir o bloqueio de ${formatarData(
        bloqueio.data,
      )}, das ${formatarHorario(
        bloqueio.hora_inicio,
      )} às ${formatarHorario(
        bloqueio.hora_fim,
      )}?`,
    );

    if (!confirmou) {
      return;
    }

    setProcessandoId(bloqueio.id);
    setErro("");
    setMensagem("");

    const { error } =
      await excluirBloqueio(
        bloqueio.id,
      );

    if (error) {
      console.error(
        "Erro ao excluir bloqueio:",
        error,
      );

      setErro(
        `Erro ao excluir bloqueio: ${error.message}`,
      );

      setProcessandoId(null);
      return;
    }

    setBloqueios((listaAtual) =>
      listaAtual.filter(
        (item) =>
          item.id !== bloqueio.id,
      ),
    );

    setMensagem(
      "Bloqueio excluído com sucesso.",
    );

    setProcessandoId(null);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
            BarberStack
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Bloqueios de agenda
          </h1>

          <p className="mt-3 text-zinc-400">
            Bloqueie períodos específicos para
            compromissos, cursos, férias ou outras
            indisponibilidades.
          </p>
        </header>

        {erro && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-400">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 p-5 text-green-400">
            {mensagem}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={salvarBloqueio}
            className="h-fit rounded-2xl border border-white/10 bg-zinc-900 p-6"
          >
            <h2 className="text-2xl font-bold">
              Novo bloqueio
            </h2>

            <div className="mt-6">
              <label
                htmlFor="barbeiro"
                className="mb-2 block font-semibold"
              >
                Barbeiro
              </label>

              <select
                id="barbeiro"
                value={barbeiroId}
                onChange={(event) =>
                  setBarbeiroId(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              >
                {barbeiros.length === 0 && (
                  <option value="">
                    Nenhum barbeiro ativo
                  </option>
                )}

                {barbeiros.map((barbeiro) => (
                  <option
                    key={barbeiro.id}
                    value={barbeiro.id}
                  >
                    {barbeiro.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label
                htmlFor="data"
                className="mb-2 block font-semibold"
              >
                Data
              </label>

              <input
                id="data"
                type="date"
                min={obterDataDeHoje()}
                value={data}
                onChange={(event) =>
                  setData(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="horaInicio"
                  className="mb-2 block font-semibold"
                >
                  Início
                </label>

                <input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={(event) =>
                    setHoraInicio(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="horaFim"
                  className="mb-2 block font-semibold"
                >
                  Fim
                </label>

                <input
                  id="horaFim"
                  type="time"
                  value={horaFim}
                  onChange={(event) =>
                    setHoraFim(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="motivo"
                className="mb-2 block font-semibold"
              >
                Motivo
              </label>

              <textarea
                id="motivo"
                rows={4}
                value={motivo}
                onChange={(event) =>
                  setMotivo(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Consulta médica, curso ou compromisso."
                className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <button
              type="submit"
              disabled={
                salvando ||
                barbeiros.length === 0
              }
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : "Salvar bloqueio"}
            </button>
          </form>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Bloqueios cadastrados
                </h2>

                <p className="mt-1 text-zinc-400">
                  {bloqueiosFiltrados.length} bloqueio(s).
                </p>
              </div>

              <div className="w-full sm:w-64">
                <label
                  htmlFor="filtroBarbeiro"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Filtrar por barbeiro
                </label>

                <select
                  id="filtroBarbeiro"
                  value={filtroBarbeiro}
                  onChange={(event) =>
                    setFiltroBarbeiro(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                >
                  <option value="Todos">
                    Todos
                  </option>

                  {barbeiros.map((barbeiro) => (
                    <option
                      key={barbeiro.id}
                      value={barbeiro.id}
                    >
                      {barbeiro.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {carregando ? (
              <div className="py-20 text-center text-zinc-400">
                Carregando bloqueios...
              </div>
            ) : bloqueiosFiltrados.length ===
              0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
                <p className="font-bold text-yellow-500">
                  Nenhum bloqueio cadastrado.
                </p>

                <p className="mt-2 text-zinc-400">
                  Cadastre um período indisponível usando o
                  formulário.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4">
                {bloqueiosFiltrados.map(
                  (bloqueio) => {
                    const processando =
                      processandoId ===
                      bloqueio.id;

                    return (
                      <article
                        key={bloqueio.id}
                        className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6"
                      >
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-2xl font-bold">
                                {obterNomeBarbeiro(
                                  bloqueio.barbeiros,
                                )}
                              </h3>

                              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-sm font-bold text-red-400">
                                Indisponível
                              </span>
                            </div>

                            <p className="mt-4 text-lg font-semibold text-yellow-500">
                              {formatarData(
                                bloqueio.data,
                              )}
                            </p>

                            <p className="mt-2 text-zinc-300">
                              Das{" "}
                              <strong className="text-white">
                                {formatarHorario(
                                  bloqueio.hora_inicio,
                                )}
                              </strong>{" "}
                              às{" "}
                              <strong className="text-white">
                                {formatarHorario(
                                  bloqueio.hora_fim,
                                )}
                              </strong>
                            </p>

                            <p className="mt-4 text-zinc-400">
                              {bloqueio.motivo ||
                                "Sem motivo informado."}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              removerBloqueio(
                                bloqueio,
                              )
                            }
                            className="rounded-xl border border-red-500 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processando
                              ? "Excluindo..."
                              : "Excluir"}
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}