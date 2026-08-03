"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type StatusAgendamento =
  | "Pendente"
  | "Confirmado"
  | "Cancelado"
  | "Finalizado";

type Agendamento = {
  id: number;
  cliente: string;
  telefone: string | null;
  email: string | null;
  barbeiro: string;
  servico: string;
  data: string;
  horario: string;
  valor: number | string;
  status: StatusAgendamento | string | null;
  observacoes: string | null;
  created_at: string | null;
};

function formatarDinheiro(valor: number | string) {
  const numero = Number(valor);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

function obterDataLocal() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function classeDoStatus(status: string | null) {
  switch (status) {
    case "Confirmado":
      return "border-green-500/40 bg-green-500/10 text-green-400";

    case "Cancelado":
      return "border-red-500/40 bg-red-500/10 text-red-400";

    case "Finalizado":
      return "border-blue-500/40 bg-blue-500/10 text-blue-400";

    default:
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  }
}

export default function Painel() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroBarbeiro, setFiltroBarbeiro] = useState("Todos");

  const buscarAgendamentos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })
      .order("horario", { ascending: true });

    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
      setErro(`Erro ao carregar os agendamentos: ${error.message}`);
      setCarregando(false);
      return;
    }

    setAgendamentos((data ?? []) as Agendamento[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    buscarAgendamentos();
  }, [buscarAgendamentos]);

  async function atualizarStatus(
    id: number,
    novoStatus: StatusAgendamento,
  ) {
    setAtualizandoId(id);
    setErro("");

    const { error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status:", error);
      setErro(`Erro ao atualizar o agendamento: ${error.message}`);
      setAtualizandoId(null);
      return;
    }

    setAgendamentos((agendamentosAtuais) =>
      agendamentosAtuais.map((agendamento) =>
        agendamento.id === id
          ? { ...agendamento, status: novoStatus }
          : agendamento,
      ),
    );

    setAtualizandoId(null);
  }

  const hoje = obterDataLocal();

  const agendamentosHoje = useMemo(
    () =>
      agendamentos.filter(
        (agendamento) =>
          agendamento.data === hoje &&
          agendamento.status !== "Cancelado",
      ),
    [agendamentos, hoje],
  );

  const pendentes = useMemo(
    () =>
      agendamentos.filter(
        (agendamento) => agendamento.status === "Pendente",
      ),
    [agendamentos],
  );

  const confirmados = useMemo(
    () =>
      agendamentos.filter(
        (agendamento) => agendamento.status === "Confirmado",
      ),
    [agendamentos],
  );

  const faturamentoPrevisto = useMemo(
    () =>
      agendamentos
        .filter(
          (agendamento) =>
            agendamento.status === "Confirmado" ||
            agendamento.status === "Finalizado",
        )
        .reduce(
          (total, agendamento) => total + Number(agendamento.valor),
          0,
        ),
    [agendamentos],
  );

  const barbeiros = useMemo(
    () =>
      Array.from(
        new Set(agendamentos.map((agendamento) => agendamento.barbeiro)),
      ),
    [agendamentos],
  );

  const agendamentosFiltrados = useMemo(
    () =>
      agendamentos.filter((agendamento) => {
        const atendeStatus =
          filtroStatus === "Todos" ||
          agendamento.status === filtroStatus;

        const atendeBarbeiro =
          filtroBarbeiro === "Todos" ||
          agendamento.barbeiro === filtroBarbeiro;

        return atendeStatus && atendeBarbeiro;
      }),
    [agendamentos, filtroStatus, filtroBarbeiro],
  );

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
              BarberFlow
            </p>

            <h1 className="mt-3 text-4xl font-bold md:text-5xl">
              Painel da Barbearia
            </h1>

            <p className="mt-3 text-zinc-400">
              Gerencie os agendamentos e acompanhe o movimento da barbearia.
            </p>
          </div>

          <button
            type="button"
            onClick={buscarAgendamentos}
            disabled={carregando}
            className="rounded-xl border border-yellow-500 px-6 py-3 font-bold text-yellow-500 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Atualizando..." : "Atualizar agenda"}
          </button>
        </header>

        {erro && (
          <div className="mb-8 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-400">
            {erro}
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
            <p className="text-sm uppercase tracking-wider text-zinc-400">
              Agendamentos hoje
            </p>

            <p className="mt-3 text-4xl font-bold">
              {agendamentosHoje.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
            <p className="text-sm uppercase tracking-wider text-zinc-400">
              Pendentes
            </p>

            <p className="mt-3 text-4xl font-bold text-yellow-500">
              {pendentes.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
            <p className="text-sm uppercase tracking-wider text-zinc-400">
              Confirmados
            </p>

            <p className="mt-3 text-4xl font-bold text-green-400">
              {confirmados.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1d1d1d] p-6">
            <p className="text-sm uppercase tracking-wider text-zinc-400">
              Faturamento previsto
            </p>

            <p className="mt-3 text-3xl font-bold text-yellow-500">
              {formatarDinheiro(faturamentoPrevisto)}
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-[#181818] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Agendamentos</h2>

              <p className="mt-2 text-zinc-400">
                {agendamentosFiltrados.length} agendamento(s) encontrado(s).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={filtroStatus}
                  onChange={(event) => setFiltroStatus(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                >
                  <option>Todos</option>
                  <option>Pendente</option>
                  <option>Confirmado</option>
                  <option>Cancelado</option>
                  <option>Finalizado</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="barbeiro"
                  className="mb-2 block text-sm font-semibold text-zinc-300"
                >
                  Barbeiro
                </label>

                <select
                  id="barbeiro"
                  value={filtroBarbeiro}
                  onChange={(event) => setFiltroBarbeiro(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-yellow-500"
                >
                  <option>Todos</option>

                  {barbeiros.map((barbeiro) => (
                    <option key={barbeiro}>{barbeiro}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="py-20 text-center text-zinc-400">
              Carregando agendamentos...
            </div>
          ) : agendamentosFiltrados.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-700 py-20 text-center text-zinc-400">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {agendamentosFiltrados.map((agendamento) => {
                const atualizando = atualizandoId === agendamento.id;

                return (
                  <article
                    key={agendamento.id}
                    className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-yellow-500">
                          {formatarData(agendamento.data)} às{" "}
                          {agendamento.horario}
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                          {agendamento.cliente}
                        </h3>

                        <p className="mt-1 text-zinc-400">
                          {agendamento.telefone || "Telefone não informado"}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${classeDoStatus(
                          agendamento.status,
                        )}`}
                      >
                        {agendamento.status || "Pendente"}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 text-zinc-300 sm:grid-cols-2">
                      <p>
                        <strong className="text-white">Barbeiro:</strong>{" "}
                        {agendamento.barbeiro}
                      </p>

                      <p>
                        <strong className="text-white">Serviço:</strong>{" "}
                        {agendamento.servico}
                      </p>

                      <p>
                        <strong className="text-white">Valor:</strong>{" "}
                        <span className="font-bold text-yellow-500">
                          {formatarDinheiro(agendamento.valor)}
                        </span>
                      </p>

                      <p>
                        <strong className="text-white">E-mail:</strong>{" "}
                        {agendamento.email || "Não informado"}
                      </p>
                    </div>

                    {agendamento.observacoes && (
                      <div className="mt-5 rounded-xl bg-black/30 p-4 text-zinc-300">
                        <strong className="text-white">Observações:</strong>{" "}
                        {agendamento.observacoes}
                      </div>
                    )}

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <button
                        type="button"
                        disabled={
                          atualizando ||
                          agendamento.status === "Confirmado"
                        }
                        onClick={() =>
                          atualizarStatus(agendamento.id, "Confirmado")
                        }
                        className="rounded-xl bg-green-500 px-4 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Confirmar
                      </button>

                      <button
                        type="button"
                        disabled={
                          atualizando ||
                          agendamento.status === "Finalizado"
                        }
                        onClick={() =>
                          atualizarStatus(agendamento.id, "Finalizado")
                        }
                        className="rounded-xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Finalizar
                      </button>

                      <button
                        type="button"
                        disabled={
                          atualizando ||
                          agendamento.status === "Cancelado"
                        }
                        onClick={() =>
                          atualizarStatus(agendamento.id, "Cancelado")
                        }
                        className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Cancelar
                      </button>
                    </div>

                    {atualizando && (
                      <p className="mt-4 text-center text-sm text-zinc-400">
                        Atualizando status...
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}