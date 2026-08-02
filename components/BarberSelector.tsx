"use client";

import { useState } from "react";

const barbers = [
  "Lucas Ferreira",
  "Rafael Santos",
  "Matheus Oliveira",
];

export default function BarberSelector() {
  const [selectedBarber, setSelectedBarber] = useState("");

  return (
    <section className="min-h-screen bg-zinc-900 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-4xl font-bold">
          Escolha seu barbeiro
        </h1>

        <p className="mb-10 text-gray-400">
          Selecione o profissional que vai realizar o atendimento.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {barbers.map((barber) => {
            const isSelected = selectedBarber === barber;

            return (
              <button
                type="button"
                key={barber}
                onClick={() => setSelectedBarber(barber)}
                className={`rounded-xl border p-8 text-left transition ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-zinc-700 bg-zinc-800 text-white hover:border-yellow-500"
                }`}
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700 text-2xl">
                  💈
                </div>

                <h2 className="text-xl font-bold">{barber}</h2>

                <p
                  className={`mt-2 text-sm ${
                    isSelected ? "text-black/70" : "text-gray-400"
                  }`}
                >
                  Barbeiro profissional
                </p>
              </button>
            );
          })}
        </div>

        {selectedBarber !== "" && (
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