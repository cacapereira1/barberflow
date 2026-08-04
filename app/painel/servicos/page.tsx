"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  atualizarServico,
  buscarTodosServicos,
  cadastrarServico,
  excluirServico,
  type Servico,
} from "@/lib/servicos";

export default function PainelServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] =
    useState<number | null>(null);

  const [servicoEditandoId, setServicoEditandoId] =
    useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState("30");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const editando = servicoEditandoId !== null;

  const buscarServicos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const { data, error } = await buscarTodosServicos();

    if (error) {
      console.error("Erro ao buscar serviços:", error);
      setErro(`Erro ao carregar serviços: ${error.message}`);
      setCarregando(false);
      return;
    }

    setServicos((data ?? []) as Servico[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    buscarServicos();
  }, [buscarServicos]);

  function limparFormulario() {
    setServicoEditandoId(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setDuracaoMinutos("30");
  }

  function iniciarEdicao(servico: Servico) {
    setServicoEditandoId(servico.id);
    setNome(servico.nome);
    setDescricao(servico.descricao ?? "");
    setPreco(
      Number(servico.preco)
        .toFixed(2)
        .replace(".", ","),
    );
    setDuracaoMinutos(
      String(servico.duracao_minutos),
    );

    setErro("");
    setMensagem("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvarServico(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const precoNumerico = Number(
      preco.replace(",", "."),
    );

    const duracaoNumerica = Number(duracaoMinutos);

    if (!nome.trim()) {
      setErro("Digite o nome do serviço.");
      return;
    }

    if (
      Number.isNaN(precoNumerico) ||
      precoNumerico < 0
    ) {
      setErro("Digite um preço válido.");
      return;
    }

    if (
      Number.isNaN(duracaoNumerica) ||
      duracaoNumerica <= 0
    ) {
      setErro("Digite uma duração válida.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const dadosServico = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco: precoNumerico,
      duracao_minutos: duracaoNumerica,
    };

    if (servicoEditandoId !== null) {
      const { error } = await atualizarServico(
        servicoEditandoId,
        dadosServico,
      );

      if (error) {
        console.error(
          "Erro ao editar serviço:",
          error,
        );

        setErro(
          `Erro ao editar serviço: ${error.message}`,
        );

        setSalvando(false);
        return;
      }

      setMensagem(
        "Serviço atualizado com sucesso!",
      );
    } else {
      const { error } = await cadastrarServico({
        ...dadosServico,
        ativo: true,
      });

      if (error) {
        console.error(
          "Erro ao cadastrar serviço:",
          error,
        );

        setErro(
          `Erro ao cadastrar serviço: ${error.message}`,
        );

        setSalvando(false);
        return;
      }

      setMensagem(
        "Serviço cadastrado com sucesso!",
      );
    }

    limparFormulario();
    setSalvando(false);

    await buscarServicos();
  }

  async function alternarStatus(servico: Servico) {
    setProcessandoId(servico.id);
    setErro("");
    setMensagem("");

    const novoStatus = !servico.ativo;

    const { error } = await atualizarServico(
      servico.id,
      {
        ativo: novoStatus,
      },
    );

    if (error) {
      console.error(
        "Erro ao atualizar serviço:",
        error,
      );

      setErro(
        `Erro ao atualizar serviço: ${error.message}`,
      );

      setProcessandoId(null);
      return;
    }

    setServicos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === servico.id
          ? {
              ...item,
              ativo: novoStatus,
            }
          : item,
      ),
    );

    setMensagem(
      novoStatus
        ? `${servico.nome} foi ativado.`
        : `${servico.nome} foi desativado.`,
    );

    setProcessandoId(null);
  }

  async function removerServico(servico: Servico) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir "${servico.nome}"?\n\nEssa ação não poderá ser desfeita.`,
    );

    if (!confirmou) {
      return;
    }

    setProcessandoId(servico.id);
    setErro("");
    setMensagem("");

    const { error } = await excluirServico(
      servico.id,
    );

    if (error) {
      console.error(
        "Erro ao excluir serviço:",
        error,
      );

      setErro(
        `Erro ao excluir serviço: ${error.message}`,
      );

      setProcessandoId(null);
      return;
    }

    setServicos((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== servico.id,
      ),
    );

    if (servicoEditandoId === servico.id) {
      limparFormulario();
    }

    setMensagem(
      `${servico.nome} foi excluído com sucesso.`,
    );

    setProcessandoId(null);
  }

  function formatarDinheiro(valor: number) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarDuracao(minutos: number) {
    if (minutos < 60) {
      return `${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (minutosRestantes === 0) {
      return horas === 1
        ? "1 hora"
        : `${horas} horas`;
    }

    return `${horas}h${String(
      minutosRestantes,
    ).padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
            BarberStack
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Gerenciar serviços
          </h1>

          <p className="mt-3 text-zinc-400">
            Cadastre e edite serviços, preços e
            durações da barbearia.
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
            onSubmit={salvarServico}
            className={`h-fit rounded-2xl border p-6 ${
              editando
                ? "border-blue-500/50 bg-blue-500/5"
                : "border-white/10 bg-zinc-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {editando
                    ? "Editar serviço"
                    : "Novo serviço"}
                </h2>

                {editando && (
                  <p className="mt-1 text-sm text-blue-400">
                    Altere os dados e salve.
                  </p>
                )}
              </div>

              {editando && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white hover:text-white"
                >
                  Cancelar
                </button>
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
                placeholder="Ex.: Corte social"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="descricao"
                className="mb-2 block font-semibold"
              >
                Descrição
              </label>

              <textarea
                id="descricao"
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
                }
                placeholder="Ex.: Corte moderno ou clássico."
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="preco"
                  className="mb-2 block font-semibold"
                >
                  Preço
                </label>

                <input
                  id="preco"
                  type="text"
                  inputMode="decimal"
                  value={preco}
                  onChange={(event) =>
                    setPreco(event.target.value)
                  }
                  placeholder="40,00"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label
                  htmlFor="duracao"
                  className="mb-2 block font-semibold"
                >
                  Duração
                </label>

                <input
                  id="duracao"
                  type="number"
                  min="1"
                  value={duracaoMinutos}
                  onChange={(event) =>
                    setDuracaoMinutos(
                      event.target.value,
                    )
                  }
                  placeholder="30"
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />

                <p className="mt-2 text-sm text-zinc-500">
                  Informe em minutos.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className={`mt-7 w-full rounded-xl px-6 py-4 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                editando
                  ? "bg-blue-500 text-white hover:bg-blue-400"
                  : "bg-yellow-500 text-black hover:bg-yellow-400"
              }`}
            >
              {salvando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar serviço"}
            </button>
          </form>

          <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Serviços cadastrados
                </h2>

                <p className="mt-1 text-zinc-400">
                  {servicos.length} serviço(s).
                </p>
              </div>

              <button
                type="button"
                onClick={buscarServicos}
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
                Carregando serviços...
              </p>
            ) : servicos.length === 0 ? (
              <p className="py-16 text-center text-zinc-400">
                Nenhum serviço cadastrado.
              </p>
            ) : (
              <div className="mt-6 grid gap-4">
                {servicos.map((servico) => {
                  const processando =
                    processandoId === servico.id;

                  const sendoEditado =
                    servicoEditandoId === servico.id;

                  return (
                    <article
                      key={servico.id}
                      className={`rounded-2xl border p-6 transition ${
                        sendoEditado
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-zinc-700 bg-zinc-900"
                      }`}
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold">
                              {servico.nome}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-sm font-bold ${
                                servico.ativo
                                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                                  : "border-red-500/40 bg-red-500/10 text-red-400"
                              }`}
                            >
                              {servico.ativo
                                ? "Ativo"
                                : "Inativo"}
                            </span>

                            {sendoEditado && (
                              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-400">
                                Editando
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-zinc-400">
                            {servico.descricao ||
                              "Sem descrição informada."}
                          </p>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <span className="rounded-lg bg-yellow-500 px-3 py-2 font-bold text-black">
                              {formatarDinheiro(
                                servico.preco,
                              )}
                            </span>

                            <span className="rounded-lg bg-zinc-800 px-3 py-2 font-semibold text-zinc-300">
                              {formatarDuracao(
                                servico.duracao_minutos,
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              iniciarEdicao(servico)
                            }
                            className="rounded-xl bg-blue-500 px-5 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              alternarStatus(servico)
                            }
                            className={`rounded-xl px-5 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              servico.ativo
                                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                : "bg-green-500 text-black hover:bg-green-400"
                            }`}
                          >
                            {processando
                              ? "Processando..."
                              : servico.ativo
                                ? "Desativar"
                                : "Ativar"}
                          </button>

                          <button
                            type="button"
                            disabled={processando}
                            onClick={() =>
                              removerServico(servico)
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