"use client";

import { useState } from "react";
import DateTimeSelector from "@/components/DateTimeSelector";
import ServiceSelector from "@/components/ServiceSelector";

type Service = {
  id: number;
  name: string;
  price: number;
  description: string;
};

const barbers = [
  "Lucas Ferreira",
  "Rafael Santos",
  "Matheus Oliveira",
];

export default function Agendamento() {
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold">Escolha seu barbeiro</h1>

          <p className="mt-3 text-gray-400">
            Selecione o profissional que realizará seu atendimento.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {barbers.map((barber) => (
              <button
                key={barber}
                type="button"
                onClick={() => {
                  setSelectedBarber(barber);
                  setSelectedService(null);
                  setSelectedDate("");
                  setSelectedTime("");
                }}
                className={`rounded-xl border p-8 font-bold transition ${
                  selectedBarber === barber
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-zinc-700 bg-zinc-900 hover:border-yellow-500"
                }`}
              >
                {barber}
              </button>
            ))}
          </div>

          {selectedBarber && (
            <div className="mt-10 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5">
              <p className="font-bold text-yellow-500">
                Barbeiro selecionado: {selectedBarber}
              </p>
            </div>
          )}
        </div>
      </section>

      {selectedBarber && (
        <ServiceSelector
          selectedService={selectedService}
          onSelectService={(service) => {
            setSelectedService(service);
            setSelectedDate("");
            setSelectedTime("");
          }}
        />
      )}

      {selectedBarber && selectedService && (
        <DateTimeSelector
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={setSelectedDate}
          onSelectTime={setSelectedTime}
        />
      )}

      {selectedBarber &&
        selectedService &&
        selectedDate &&
        selectedTime && (
          <section className="bg-zinc-950 px-6 py-20 text-white">
            <div className="mx-auto max-w-5xl rounded-2xl border border-yellow-500/30 bg-zinc-900 p-8">
              <h2 className="text-3xl font-bold">
                Resumo do agendamento
              </h2>

              <div className="mt-8 space-y-4 text-lg text-gray-300">
                <p>
                  <strong className="text-white">Barbeiro:</strong>{" "}
                  {selectedBarber}
                </p>

                <p>
                  <strong className="text-white">Serviço:</strong>{" "}
                  {selectedService.name}
                </p>

                <p>
                  <strong className="text-white">Valor:</strong>{" "}
                  {selectedService.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>

                <p>
                  <strong className="text-white">Data:</strong>{" "}
                  {selectedDate}
                </p>

                <p>
                  <strong className="text-white">Horário:</strong>{" "}
                  {selectedTime}
                </p>

                <p>
                  <strong className="text-white">Status:</strong>{" "}
                  <span className="font-semibold text-yellow-500">
                    Aguardando confirmação
                  </span>
                </p>
              </div>
            </div>
          </section>
        )}
    </main>
  );
}