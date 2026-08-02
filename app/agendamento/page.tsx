"use client";

import { useState } from "react";
import CustomerForm from "@/components/CustomerForm";
import DateTimeSelector from "@/components/DateTimeSelector";
import ServiceSelector from "@/components/ServiceSelector";
import { supabase } from "@/lib/supabase";

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

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resetConfirmation = () => {
    setIsConfirmed(false);
    setErrorMessage("");
  };

  const handleConfirmAppointment = async () => {
    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !selectedBarber ||
      !selectedService ||
      !selectedDate ||
      !selectedTime
    ) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setIsConfirmed(false);

    const dateParts = selectedDate.split("/");

    if (dateParts.length !== 3) {
      setErrorMessage("A data selecionada é inválida.");
      setIsSaving(false);
      return;
    }

    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    const { error } = await supabase.from("agendamentos").insert({
      cliente: customerName.trim(),
      telefone: customerPhone.trim(),
      email: customerEmail.trim() || null,
      barbeiro: selectedBarber,
      servico: selectedService.name,
      data: formattedDate,
      horario: selectedTime,
      valor: selectedService.price,
      status: "Pendente",
      observacoes: customerNotes.trim() || null,
    });

    if (error) {
      console.error("Erro ao salvar agendamento:", error);
      setErrorMessage(`Erro ao salvar: ${error.message}`);
      setIsSaving(false);
      return;
    }

    setIsConfirmed(true);
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
            BarberFlow
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Agende seu horário
          </h1>

          <p className="mt-4 text-lg text-gray-400">
            Escolha o profissional, o serviço e o melhor horário para você.
          </p>

          <div className="mt-16">
            <h2 className="text-4xl font-bold">Escolha seu barbeiro</h2>

            <p className="mt-3 text-gray-400">
              Selecione o profissional que realizará seu atendimento.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {barbers.map((barber) => {
                const isSelected = selectedBarber === barber;

                return (
                  <button
                    key={barber}
                    type="button"
                    onClick={() => {
                      setSelectedBarber(barber);
                      setSelectedService(null);
                      setSelectedDate("");
                      setSelectedTime("");
                      resetConfirmation();
                    }}
                    className={`rounded-xl border p-8 font-bold transition ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-500 text-black"
                        : "border-zinc-700 bg-zinc-900 hover:border-yellow-500"
                    }`}
                  >
                    {barber}
                  </button>
                );
              })}
            </div>

            {selectedBarber && (
              <div className="mt-10 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5">
                <p className="font-bold text-yellow-500">
                  Barbeiro selecionado: {selectedBarber}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedBarber && (
        <ServiceSelector
          selectedService={selectedService}
          onSelectService={(service) => {
            setSelectedService(service);
            setSelectedDate("");
            setSelectedTime("");
            resetConfirmation();
          }}
        />
      )}

      {selectedBarber && selectedService && (
        <DateTimeSelector
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setSelectedTime("");
            resetConfirmation();
          }}
          onSelectTime={(time) => {
            setSelectedTime(time);
            resetConfirmation();
          }}
        />
      )}

      {selectedBarber &&
        selectedService &&
        selectedDate &&
        selectedTime && (
          <CustomerForm
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            customerNotes={customerNotes}
            onChangeName={(value) => {
              setCustomerName(value);
              resetConfirmation();
            }}
            onChangePhone={(value) => {
              setCustomerPhone(value);
              resetConfirmation();
            }}
            onChangeEmail={(value) => {
              setCustomerEmail(value);
              resetConfirmation();
            }}
            onChangeNotes={(value) => {
              setCustomerNotes(value);
              resetConfirmation();
            }}
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

              <div className="mt-8 grid gap-5 text-lg text-gray-300 md:grid-cols-2">
                <p>
                  <strong className="text-white">Cliente:</strong>{" "}
                  {customerName || "Não informado"}
                </p>

                <p>
                  <strong className="text-white">WhatsApp:</strong>{" "}
                  {customerPhone || "Não informado"}
                </p>

                <p>
                  <strong className="text-white">Barbeiro:</strong>{" "}
                  {selectedBarber}
                </p>

                <p>
                  <strong className="text-white">Serviço:</strong>{" "}
                  {selectedService.name}
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
                  <strong className="text-white">Valor:</strong>{" "}
                  <span className="font-bold text-yellow-500">
                    {selectedService.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </p>

                <p>
                  <strong className="text-white">Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      isConfirmed
                        ? "text-green-400"
                        : "text-yellow-500"
                    }`}
                  >
                    {isConfirmed
                      ? "Agendamento realizado"
                      : "Aguardando confirmação"}
                  </span>
                </p>

                {customerEmail && (
                  <p className="md:col-span-2">
                    <strong className="text-white">E-mail:</strong>{" "}
                    {customerEmail}
                  </p>
                )}

                {customerNotes && (
                  <p className="md:col-span-2">
                    <strong className="text-white">Observações:</strong>{" "}
                    {customerNotes}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={
                  !customerName.trim() ||
                  !customerPhone.trim() ||
                  isSaving ||
                  isConfirmed
                }
                onClick={handleConfirmAppointment}
                className="mt-10 w-full rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {isSaving
                  ? "Salvando agendamento..."
                  : isConfirmed
                    ? "Agendamento salvo"
                    : "Confirmar agendamento"}
              </button>

              {!customerName.trim() || !customerPhone.trim() ? (
                <p className="mt-3 text-center text-sm text-gray-500">
                  Preencha o nome e o WhatsApp para confirmar.
                </p>
              ) : null}

              {errorMessage && (
                <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-center">
                  <p className="font-semibold text-red-400">
                    {errorMessage}
                  </p>
                </div>
              )}

              {isConfirmed && (
                <div className="mt-8 rounded-2xl border border-green-500/40 bg-green-500/10 p-7 text-center">
                  <div className="text-5xl">✅</div>

                  <h3 className="mt-4 text-2xl font-bold text-green-400">
                    Agendamento realizado!
                  </h3>

                  <p className="mt-2 text-gray-300">
                    Seu agendamento foi salvo e está aguardando a confirmação
                    da barbearia.
                  </p>

                  <div className="mx-auto mt-6 max-w-md rounded-xl bg-black/30 p-5 text-left">
                    <p>
                      <strong>Cliente:</strong> {customerName}
                    </p>

                    <p className="mt-2">
                      <strong>WhatsApp:</strong> {customerPhone}
                    </p>

                    <p className="mt-2">
                      <strong>Barbeiro:</strong> {selectedBarber}
                    </p>

                    <p className="mt-2">
                      <strong>Serviço:</strong> {selectedService.name}
                    </p>

                    <p className="mt-2">
                      <strong>Valor:</strong>{" "}
                      {selectedService.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>

                    <p className="mt-2">
                      <strong>Data:</strong> {selectedDate}
                    </p>

                    <p className="mt-2">
                      <strong>Horário:</strong> {selectedTime}
                    </p>

                    <p className="mt-2">
                      <strong>Status:</strong>{" "}
                      <span className="text-yellow-500">
                        Pendente
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
    </main>
  );
}