"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Barbeiro = {
  id: number;
  nome: string;
  especialidade: string | null;
  ativo: boolean;
};

type BarberSelectorProps = {
  selectedBarber: string;
  onSelectBarber: (barber: string) => void;
};

export default function BarberSelector({
  selectedBarber,
  onSelectBarber,
}: BarberSelectorProps) {
  const [barbers, setBarbers] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBarbers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("barbeiros")
      .select("id, nome, especialidade, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar barbeiros:", error);
      setErrorMessage(`Erro ao carregar barbeiros: ${error.message}`);
      setBarbers([]);
      setLoading(false);
      return;
    }

    setBarbers((data ?? []) as Barbeiro[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  return (
    <section className="bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-4xl font-bold">Escolha seu barbeiro</h2>

            <p className="mt-3 text-gray-400">
              Selecione o profissional que realizará seu atendimento.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBarbers}
            disabled={loading}
            className="w-fit rounded-xl border border-yellow-500 px-5 py-3 font-semibold text-yellow-500 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Atualizando..." : "Atualizar profissionais"}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-400">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="text-yellow-500">
              Carregando profissionais disponíveis...
            </p>
          </div>
        ) : barbers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
            <p className="font-bold text-yellow-500">
              Nenhum barbeiro disponível.
            </p>

            <p className="mt-2 text-gray-400">
              Cadastre ou ative um profissional no painel da barbearia.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {barbers.map((barber) => {
              const isSelected = selectedBarber === barber.nome;

              return (
                <button
                  type="button"
                  key={barber.id}
                  onClick={() => onSelectBarber(barber.nome)}
                  className={`rounded-2xl border p-8 text-left transition ${
                    isSelected
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-zinc-700 bg-zinc-900 text-white hover:-translate-y-1 hover:border-yellow-500"
                  }`}
                >
                  <div
                    className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                      isSelected
                        ? "bg-black/15"
                        : "bg-zinc-800"
                    }`}
                  >
                    💈
                  </div>

                  <h3 className="text-xl font-bold">{barber.nome}</h3>

                  <p
                    className={`mt-2 text-sm ${
                      isSelected
                        ? "text-black/70"
                        : "text-gray-400"
                    }`}
                  >
                    {barber.especialidade ||
                      "Barbeiro profissional"}
                  </p>

                  <p
                    className={`mt-5 text-sm font-bold ${
                      isSelected
                        ? "text-black"
                        : "text-yellow-500"
                    }`}
                  >
                    {isSelected
                      ? "Profissional selecionado ✓"
                      : "Selecionar profissional →"}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {selectedBarber && (
          <div className="mt-10 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
            <p className="font-bold text-yellow-500">
              Você escolheu: {selectedBarber}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}