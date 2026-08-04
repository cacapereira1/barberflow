"use client";

import { useCallback, useEffect, useState } from "react";
import { buscarServicosAtivos } from "@/lib/servicos";

export type Service = {
  id: number;
  name: string;
  price: number;
  description: string;
  durationMinutes: number;
};

type ServicoDoBanco = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number | string;
  duracao_minutos: number;
  ativo: boolean;
};

type ServiceSelectorProps = {
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
};

export default function ServiceSelector({
  selectedService,
  onSelectService,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await buscarServicosAtivos();

    if (error) {
      console.error("Erro ao buscar serviços:", error);
      setErrorMessage(`Erro ao carregar serviços: ${error.message}`);
      setServices([]);
      setLoading(false);
      return;
    }

    const formattedServices = ((data ?? []) as ServicoDoBanco[]).map(
      (service) => ({
        id: service.id,
        name: service.nome,
        price: Number(service.preco),
        description:
          service.descricao || "Serviço oferecido pela barbearia.",
        durationMinutes: service.duracao_minutos,
      }),
    );

    setServices(formattedServices);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <section className="border-t border-white/10 bg-zinc-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-4xl font-bold">Escolha o serviço</h2>

            <p className="mt-3 text-gray-400">
              Selecione o atendimento desejado.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="w-fit rounded-xl border border-yellow-500 px-5 py-3 font-semibold text-yellow-500 transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Atualizando..." : "Atualizar serviços"}
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
              Carregando serviços disponíveis...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">
            <p className="font-bold text-yellow-500">
              Nenhum serviço disponível.
            </p>

            <p className="mt-2 text-gray-400">
              Cadastre ou ative um serviço no painel da barbearia.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => {
              const isSelected = selectedService?.id === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onSelectService(service)}
                  className={`rounded-2xl border p-6 text-left transition ${
                    isSelected
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-zinc-700 bg-zinc-900 hover:-translate-y-1 hover:border-yellow-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {service.name}
                      </h3>

                      <p
                        className={`mt-2 text-sm ${
                          isSelected
                            ? "text-black/70"
                            : "text-gray-400"
                        }`}
                      >
                        {service.description}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-lg font-bold">
                      {service.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        isSelected
                          ? "bg-black/15 text-black"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {service.durationMinutes} minutos
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        isSelected
                          ? "text-black"
                          : "text-yellow-500"
                      }`}
                    >
                      {isSelected
                        ? "Serviço selecionado ✓"
                        : "Selecionar serviço →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedService && (
          <div className="mt-10 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5">
            <p className="font-bold text-yellow-500">
              Serviço selecionado: {selectedService.name}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-white">
              <p>
                Valor:{" "}
                {selectedService.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              <p>
                Duração: {selectedService.durationMinutes} minutos
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}