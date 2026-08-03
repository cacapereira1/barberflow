"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type DateTimeSelectorProps = {
  selectedBarber: string;
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
};

const times = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

function formatDateToDisplay(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateToDatabase(displayDate: string) {
  const [day, month, year] = displayDate.split("/");

  return `${year}-${month}-${day}`;
}

function isToday(displayDate: string) {
  return displayDate === formatDateToDisplay(new Date());
}

function hasTimePassed(time: string) {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const appointmentTime = new Date();
  appointmentTime.setHours(hours, minutes, 0, 0);

  return appointmentTime <= now;
}

export default function DateTimeSelector({
  selectedBarber,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: DateTimeSelectorProps) {
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dates = useMemo(() => {
    const generatedDates: string[] = [];
    const today = new Date();

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + index);

      generatedDates.push(formatDateToDisplay(date));
    }

    return generatedDates;
  }, []);

  useEffect(() => {
    async function fetchOccupiedTimes() {
      if (!selectedDate || !selectedBarber) {
        setOccupiedTimes([]);
        return;
      }

      setLoadingTimes(true);
      setErrorMessage("");

      const databaseDate = formatDateToDatabase(selectedDate);

      const { data, error } = await supabase
        .from("agendamentos")
        .select("horario")
        .eq("barbeiro", selectedBarber)
        .eq("data", databaseDate)
        .neq("status", "Cancelado");

      if (error) {
        console.error("Erro ao buscar horários ocupados:", error);
        setErrorMessage(
          `Não foi possível carregar os horários: ${error.message}`,
        );
        setOccupiedTimes([]);
        setLoadingTimes(false);
        return;
      }

      const alreadyOccupied = (data ?? []).map(
        (appointment) => appointment.horario,
      );

      setOccupiedTimes(alreadyOccupied);
      setLoadingTimes(false);
    }

    fetchOccupiedTimes();
  }, [selectedBarber, selectedDate]);

  const availableTimes = useMemo(() => {
    return times.filter((time) => {
      const isOccupied = occupiedTimes.includes(time);
      const isPast = isToday(selectedDate) && hasTimePassed(time);

      return !isOccupied && !isPast;
    });
  }, [occupiedTimes, selectedDate]);

  return (
    <section className="border-t border-white/10 bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div>
          <h2 className="text-4xl font-bold">Escolha a data</h2>

          <p className="mt-3 text-gray-400">
            Selecione o melhor dia para o seu atendimento.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => {
                  onSelectDate(date);
                  onSelectTime("");
                }}
                className={`rounded-xl border px-4 py-4 font-semibold transition ${
                  selectedDate === date
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-zinc-700 bg-zinc-900 hover:border-yellow-500"
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="mt-16">
            <h2 className="text-4xl font-bold">Escolha o horário</h2>

            <p className="mt-3 text-gray-400">
              Horários disponíveis para {selectedDate} com {selectedBarber}.
            </p>

            {loadingTimes && (
              <p className="mt-8 text-yellow-500">
                Carregando horários disponíveis...
              </p>
            )}

            {errorMessage && (
              <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-400">
                {errorMessage}
              </div>
            )}

            {!loadingTimes &&
              !errorMessage &&
              availableTimes.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => onSelectTime(time)}
                      className={`rounded-xl border px-5 py-4 font-semibold transition ${
                        selectedTime === time
                          ? "border-yellow-500 bg-yellow-500 text-black"
                          : "border-zinc-700 bg-zinc-900 hover:border-yellow-500"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

            {!loadingTimes &&
              !errorMessage &&
              availableTimes.length === 0 && (
                <div className="mt-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
                  <p className="font-bold text-yellow-500">
                    Não existem horários disponíveis nesta data.
                  </p>

                  <p className="mt-2 text-gray-400">
                    Escolha outro dia para continuar.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  );
}