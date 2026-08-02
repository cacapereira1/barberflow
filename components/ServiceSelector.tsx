"use client";

type Service = {
  id: number;
  name: string;
  price: number;
  description: string;
};

type ServiceSelectorProps = {
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
};

const services: Service[] = [
  {
    id: 1,
    name: "Corte",
    price: 40,
    description: "Corte moderno ou clássico.",
  },
  {
    id: 2,
    name: "Barba",
    price: 30,
    description: "Modelagem e acabamento completo.",
  },
  {
    id: 3,
    name: "Corte + Barba",
    price: 60,
    description: "O pacote completo para renovar o visual.",
  },
  {
    id: 4,
    name: "Sobrancelha",
    price: 15,
    description: "Acabamento rápido e preciso.",
  },
  {
    id: 5,
    name: "Corte + Barba + Sobrancelha",
    price: 70,
    description: "Pacote completo com corte, barba e sobrancelha.",
  },
  {
    id: 6,
    name: "Pigmentação",
    price: 25,
    description: "Pigmentação natural para barba ou cabelo.",
  },
  {
    id: 7,
    name: "Hidratação",
    price: 20,
    description: "Tratamento para cabelo e barba.",
  },
  {
    id: 8,
    name: "Pezinho",
    price: 10,
    description: "Acabamento rápido para manter o corte alinhado.",
  },
];

export default function ServiceSelector({
  selectedService,
  onSelectService,
}: ServiceSelectorProps) {
  return (
    <section className="border-t border-white/10 bg-zinc-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold">Escolha o serviço</h2>

        <p className="mt-3 text-gray-400">
          Selecione o atendimento desejado.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const isSelected = selectedService?.id === service.id;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelectService(service)}
                className={`rounded-xl border p-6 text-left transition ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-zinc-700 bg-zinc-900 hover:border-yellow-500"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold">{service.name}</h3>

                  <span className="whitespace-nowrap font-bold">
                    {service.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>

                <p
                  className={`mt-3 ${
                    isSelected ? "text-black/70" : "text-gray-400"
                  }`}
                >
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>

        {selectedService && (
          <div className="mt-10 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5">
            <p className="font-bold text-yellow-500">
              Serviço selecionado: {selectedService.name}
            </p>

            <p className="mt-2 text-white">
              Valor:{" "}
              {selectedService.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}