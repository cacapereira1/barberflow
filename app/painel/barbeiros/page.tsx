"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type Barbeiro = {
  id: number;
  nome: string;
  especialidade: string | null;
  hora_entrada: string;
  hora_saida: string;
  inicio_almoco: string | null;
  fim_almoco: string | null;
  dias_trabalho: number[];
  ativo: boolean;
};

const diasDaSemana = [
  { numero: 0, nome: "Dom" },
  { numero: 1, nome: "Seg" },
  { numero: 2, nome: "Ter" },
  { numero: 3, nome: "Qua" },
  { numero: 4, nome: "Qui" },
  { numero: 5, nome: "Sex" },
  { numero: 6, nome: "Sáb" },
];

function normalizarHorario(
  horario: string | null | undefined,
  padrao: string,
) {
  if (!horario) {
    return padrao;
  }

  return horario.slice(0, 5);
}

export default function PainelBarbeiros() {
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [processandoId, setProcessandoId] =
    useState<number | null>(null);

  const [barbeiroEmEdicao, setBarbeiroEmEdicao] =
    useState<Barbeiro | null>(null);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [horaEntrada, setHoraEntrada] = useState("09:00");
  const [horaSaida, setHoraSaida] = useState("19:00");
  const [inicioAlmoco, setInicioAlmoco] =
    useState("12:00");
  const [fimAlmoco, setFimAlmoco] =
    useState("13:00");

  const [diasTrabalho, setDiasTrabalho] =
    useState<number[]>([1, 2, 3, 4, 5, 6]);

  const buscarBarbeiros = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("barbeiros")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar barbeiros:", error);

      setErro(
        `Erro ao carregar barbeiros: ${error.message}`,
      );

      setCarregando(false);
      return;
    }

    setBarbeiros((data ?? []) as Barbeiro[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    buscarBarbeiros();
  }, [buscarBarbeiros]);

  function alternarDia(numero: number) {
    setDiasTrabalho((diasAtuais) =>
      diasAtuais.includes(numero)
        ? diasAtuais.filter((dia) => dia !== numero)
        : [...diasAtuais, numero].sort(
            (primeiro, segundo) =>
              primeiro - segundo,
          ),
    );
  }

  function limparFormulario() {
    setNome("");
    setEspecialidade("");
    setHoraEntrada("09:00");
    setHoraSaida("19:00");
    setInicioAlmoco("12:00");
    setFimAlmoco("13:00");
    setDiasTrabalho([1, 2, 3, 4, 5, 6]);
    setBarbeiroEmEdicao(null);
  }

  function iniciarEdicao(barbeiro: Barbeiro) {
    setBarbeiroEmEdicao(barbeiro);

    setNome(barbeiro.nome);
    setEspecialidade(
      barbeiro.especialidade ?? "",
    );

    setHoraEntrada(
      normalizarHorario(
        barbeiro.hora_entrada,
        "09:00",
      ),
    );

    setHoraSaida(
      normalizarHorario(
        barbeiro.hora_saida,
        "19:00",
      ),
    );

    setInicioAlmoco(
      normalizarHorario(
        barbeiro.inicio_almoco,
        "12:00",
      ),
    );

    setFimAlmoco(
      normalizarHorario(
        barbeiro.fim_almoco,
        "13:00",
      ),
    );

    setDiasTrabalho(
      barbeiro.dias_trabalho ?? [],
    );

    setErro("");
    setMensagem("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    limparFormulario();
    setErro("");
    setMensagem("Edição cancelada.");
  }

  function validarFormulario() {
    if (!nome.trim()) {
      setErro("Digite o nome do barbeiro.");
      return false;
    }

    if (diasTrabalho.length === 0) {
      setErro(
        "Selecione pelo menos um dia de trabalho.",
      );

      return false;
    }

    if (horaEntrada >= horaSaida) {
      setErro(
        "O horário de entrada deve ser anterior ao horário de saída.",
      );

      return false;
    }

    if (
      inicioAlmoco &&
      fimAlmoco &&
      inicioAlmoco >= fimAlmoco
    ) {
      setErro(
        "O início do almoço deve ser anterior ao fim do almoço.",
      );

      return false;
    }

    if (
      inicioAlmoco &&
      (inicioAlmoco < horaEntrada ||
        inicioAlmoco > horaSaida)
    ) {
      setErro(
        "O início do almoço precisa estar dentro do expediente.",
      );

      return false;
    }

    if (
      fimAlmoco &&
      (fimAlmoco < horaEntrada ||
        fimAlmoco > horaSaida)
    ) {
      setErro(
        "O fim do almoço precisa estar dentro do expediente.",
      );

      return false;
    }

    return true;
  }

  async function salvarBarbeiro(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const dadosDoBarbeiro = {
      nome: nome.trim(),
      especialidade:
        especialidade.trim() || null,
      hora_entrada: horaEntrada,
      hora_saida: horaSaida,
      inicio_almoco:
        inicioAlmoco || null,
      fim_almoco:
        fimAlmoco || null,
      dias_trabalho: diasTrabalho,
    };

    if (barbeiroEmEdicao) {
      const { error } = await supabase
        .from("barbeiros")
        .update(dadosDoBarbeiro)
        .eq("id", barbeiroEmEdicao.id);

      if (error) {
        console.error(
          "Erro ao editar barbeiro:",
          error,
        );

        setErro(
          `Erro ao editar barbeiro: ${error.message}`,
        );

        setSalvando(false);
        return;
      }

      const nomeEditado = nome.trim();

      limparFormulario();

      setMensagem(
        `${nomeEditado} foi atualizado com sucesso!`,
      );

      setSalvando(false);
      await buscarBarbeiros();
      return;
    }

    const { error } = await supabase
      .from("barbeiros")
      .insert({
        ...dadosDoBarbeiro,
        ativo: true,
      });

    if (error) {
      console.error(
        "Erro ao cadastrar barbeiro:",
        error,
      );

      setErro(
        `Erro ao cadastrar barbeiro: ${error.message}`,
      );

      setSalvando(false);
      return;
    }

    limparFormulario();

    setMensagem(
      "Barbeiro cadastrado com sucesso!",
    );

    setSalvando(false);
    await buscarBarbeiros();
  }

  async function alternarStatus(
    barbeiro: Barbeiro,
  ) {
    setProcessandoId(barbeiro.id);
    setErro("");
    setMensagem("");

    const novoStatus = !barbeiro.ativo;

    const { error } = await supabase
      .from("barbeiros")
      .update({
        ativo: novoStatus,
      })
      .eq("id", barbeiro.id);

    if (error) {
      console.error(
        "Erro ao atualizar barbeiro:",
        error,
      );

      setErro(
        `Erro ao atualizar barbeiro: ${error.message}`,
      );

      setProcessandoId(null);
      return;
    }

    setBarbeiros((listaAtual) =>
      listaAtual.map((item) =>
        item.id === barbeiro.id
          ? {
              ...item,
              ativo: novoStatus,
            }
          : item,
      ),
    );

    setMensagem(
      novoStatus
        ? `${barbeiro.nome} foi ativado.`
        : `${barbeiro.nome} foi desativado.`,
    );

    setProcessandoId(null);
  }

  async function excluirBarbeiro(
    barbeiro: Barbeiro,
  ) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir ${barbeiro.nome}?\n\n` +
        "Essa ação é permanente e não poderá ser desfeita.",
    );

    if (!confirmou) {
      return;
    }

    setProcessandoId(barbeiro.id);
    setErro("");
    setMensagem("");

    const { error } = await supabase
      .from("barbeiros")
      .delete()
      .eq("id", barbeiro.id);

    if (error) {
      console.error(
        "Erro ao excluir barbeiro:",
        error,
      );

      setErro(
        `Erro ao excluir barbeiro: ${error.message}`,
      );

      setProcessandoId(null);
      return;
    }

    setBarbeiros((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== barbeiro.id,
      ),
    );

    if (
      barbeiroEmEdicao?.id === barbeiro.id
    ) {
      limparFormulario();
    }

    setMensagem(
      `${barbeiro.nome} foi excluído com sucesso.`,
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
            Gerenciar barbeiros
          </h1>

          <p className="mt-3 text-zinc-400">
            Cadastre profissionais e configure seus dias e
            horários de trabalho.
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
            onSubmit={salvarBarbeiro}
            className={`h-fit rounded-2xl border p-6 ${
              barbeiroEmEdicao
                ? "border-yellow-500/60 bg-yellow-500/5"
                : "border-white/10 bg-zinc-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {barbeiroEmEdicao
                    ? "Editar barbeiro"
                    : "Novo barbeiro"}
                </h2>

                {barbeiroEmEdicao && (
                  <p className="mt-2 text-sm text-yellow-500">
                    Editando:{" "}
                    {barbeiroEmEdicao.nome}
                  </p>
                )}
              </div>

              {barbeiroEmEdicao && (
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-500">
                  EDIÇÃO
                </span>
              )}
            </div>

            <div className="mt-6">
              <label
                htmlFor="nome"
                className="mb-2 block font-semibold"
              >
                Nome
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                placeholder="Ex.: João Silva"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="especialidade"
                className="mb-2 block font-semibold"
              >
                Especialidade
              </label>

              <input
                id="especialidade"
                type="text"
                value={especialidade}
                onChange={(event) =>
                  setEspecialidade(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Degradê e cortes modernos"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="horaEntrada"
                  className="mb-2 block font-semibold"
                >
                  Entrada
                </label>

                <input
                  id="horaEntrada"
                  type="time"
                  value={horaEntrada}
                  onChange={(event) =>
                    setHoraEntrada(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="horaSaida"
                  className="mb-2 block font-semibold"
                >
                  Saída
                </label>

                <input
                  id="horaSaida"
                  type="time"
                  value={horaSaida}
                  onChange={(event) =>
                    setHoraSaida(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="inicioAlmoco"
                  className="mb-2 block font-semibold"
                >
                  Início do almoço
                </label>

                <input
                  id="inicioAlmoco"
                  type="time"
                  value={inicioAlmoco}
                  onChange={(event) =>
                    setInicioAlmoco(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="fimAlmoco"
                  className="mb-2 block font-semibold"
                >
                  Fim do almoço
                </label>

                <input
                  id="fimAlmoco"
                  type="time"
                  value={fimAlmoco}
                  onChange={(event) =>
                    setFimAlmoco(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 font-semibold">
                Dias de trabalho
              </p>

              <div className="grid grid-cols-4 gap-3">
                {diasDaSemana.map((dia) => {
                  const selecionado =
                    diasTrabalho.includes(
                      dia.numero,
                    );

                  return (
                    <button
                      key={dia.numero}
                      type="button"
                      onClick={() =>
                        alternarDia(dia.numero)
                      }
                      className={`rounded-xl border px-3 py-3 font-semibold transition ${
                        selecionado
                          ? "border-yellow-500 bg-yellow-500 text-black"
                          : "border-zinc-700 bg-black text-zinc-300 hover:border-yellow-500"
                      }`}
                    >
                      {dia.nome}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="mt-7 w-full rounded-xl bg-yellow-500 px-6 py-4 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : barbeiroEmEdicao
                  ? "Salvar alterações"
                  : "Cadastrar barbeiro"}
            </button>

            {barbeiroEmEdicao && (
              <button
                type="button"
                onClick={cancelarEdicao}
                disabled={salvando}
                className="mt-3 w-full rounded-xl border border-zinc-600 px-6 py-4 font-bold text-zinc-300 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar edição
              </button>
            )}
          </form>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Barbeiros cadastrados
                </h2>

                <p className="mt-1 text-zinc-400">
                  {barbeiros.length} profissional(is).
                </p>
              </div>

              <button
                type="button"
                onClick={buscarBarbeiros}
                disabled={carregando}
                className="rounded-xl border border-yellow-500 px-4 py-2 font-semibold text-yellow-500 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>
            </div>

            {carregando ? (
              <p className="py-16 text-center text-zinc-400">
                Carregando barbeiros...
              </p>
            ) : barbeiros.length === 0 ? (
              <p className="py-16 text-center text-zinc-400">
                Nenhum barbeiro cadastrado.
              </p>
            ) : (
              <div className="mt-6 grid gap-4">
                {barbeiros.map((barbeiro) => {
                  const processando =
                    processandoId === barbeiro.id;

                  const sendoEditado =
                    barbeiroEmEdicao?.id ===
                    barbeiro.id;

                  return (
                    <article
                      key={barbeiro.id}
                      className={`rounded-2xl border p-6 transition ${
                        sendoEditado
                          ? "border-yellow-500 bg-yellow-500/5"
                          : "border-zinc-700 bg-zinc-900"
                      }`}
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold">
                              {barbeiro.nome}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-sm font-bold ${
                                barbeiro.ativo
                                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                                  : "border-red-500/40 bg-red-500/10 text-red-400"
                              }`}
                            >
                              {barbeiro.ativo
                                ? "Ativo"
                                : "Inativo"}
                            </span>

                            {sendoEditado && (
                              <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-500">
                                Editando
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-zinc-400">
                            {barbeiro.especialidade ||
                              "Sem especialidade informada"}
                          </p>

                          <div className="mt-5 grid gap-2 text-zinc-300 sm:grid-cols-2">
                            <p>
                              <strong className="text-white">
                                Expediente:
                              </strong>{" "}
                              {normalizarHorario(
                                barbeiro.hora_entrada,
                                "—",
                              )}{" "}
                              às{" "}
                              {normalizarHorario(
                                barbeiro.hora_saida,
                                "—",
                              )}
                            </p>

                            <p>
                              <strong className="text-white">
                                Almoço:
                              </strong>{" "}
                              {normalizarHorario(
                                barbeiro.inicio_almoco,
                                "—",
                              )}{" "}
                              às{" "}
                              {normalizarHorario(
                                barbeiro.fim_almoco,
                                "—",
                              )}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {diasDaSemana.map(
                              (dia) => {
                                const trabalha =
                                  barbeiro.dias_trabalho?.includes(
                                    dia.numero,
                                  );

                                return (
                                  <span
                                    key={dia.numero}
                                    className={`rounded-lg px-3 py-1 text-sm ${
                                      trabalha
                                        ? "bg-yellow-500 text-black"
                                        : "bg-zinc-800 text-zinc-500"
                                    }`}
                                  >
                                    {dia.nome}
                                  </span>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              iniciarEdicao(barbeiro)
                            }
                            className="rounded-xl border border-yellow-500 px-5 py-3 font-bold text-yellow-500 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              alternarStatus(barbeiro)
                            }
                            className={`rounded-xl px-5 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              barbeiro.ativo
                                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                : "bg-green-500 text-black hover:bg-green-400"
                            }`}
                          >
                            {processando
                              ? "Processando..."
                              : barbeiro.ativo
                                ? "Desativar"
                                : "Ativar"}
                          </button>

                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              excluirBarbeiro(
                                barbeiro,
                              )
                            }
                            className="rounded-xl border border-red-500 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}