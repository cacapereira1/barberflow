"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Calendar from "./Calendar";

type DateTimeSelectorProps = {
  selectedBarber: string;
  selectedDate: string;
  selectedTime: string;
  selectedServiceDuration: number;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
};

type AgendamentoOcupado = {
  horario: string;
  duracao_minutos: number | null;
};

type ExpedienteBarbeiro = {
  hora_entrada: string;
  hora_saida: string;
  inicio_almoco: string | null;
  fim_almoco: string | null;
  dias_trabalho: number[];
  ativo: boolean;
};

const INTERVALO_MINUTOS = 30;

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

function displayDateToDate(displayDate: string) {
  const [day, month, year] = displayDate.split("/").map(Number);

  return new Date(year, month - 1, day);
}

function isToday(displayDate: string) {
  return displayDate === formatDateToDisplay(new Date());
}

function normalizeTime(time: string) {
  return time.slice(0, 5);
}

function convertTimeToMinutes(time: string) {
  const normalizedTime = normalizeTime(time);
  const [hours, minutes] = normalizedTime.split(":").map(Number);

  return hours * 60 + minutes;
}

function convertMinutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}`;
}

function hasTimePassed(time: string) {
  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  return convertTimeToMinutes(time) <= currentMinutes;
}

function intervalsOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

function generateTimes(
  startTime: string,
  endTime: string,
) {
  const generatedTimes: string[] = [];

  let currentTime = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);

  while (currentTime < endMinutes) {
    generatedTimes.push(
      convertMinutesToTime(currentTime),
    );

    currentTime += INTERVALO_MINUTOS;
  }

  return generatedTimes;
}

export default function DateTimeSelector({
  selectedBarber,
  selectedDate,
  selectedTime,
  selectedServiceDuration,
  onSelectDate,
  onSelectTime,
}: DateTimeSelectorProps) {
  const [occupiedAppointments, setOccupiedAppointments] =
    useState<AgendamentoOcupado[]>([]);

  const [barberSchedule, setBarberSchedule] =
    useState<ExpedienteBarbeiro | null>(null);

  const [loadingTimes, setLoadingTimes] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function fetchScheduleAndAppointments() {
      if (!selectedBarber) {
        setBarberSchedule(null);
        setOccupiedAppointments([]);
        return;
      }

      setLoadingTimes(true);
      setErrorMessage("");

      const {
        data: barberData,
        error: barberError,
      } = await supabase
        .from("barbeiros")
        .select(
          `
            hora_entrada,
            hora_saida,
            inicio_almoco,
            fim_almoco,
            dias_trabalho,
            ativo
          `,
        )
        .eq("nome", selectedBarber)
        .eq("ativo", true)
        .maybeSingle();

      if (barberError) {
        console.error(
          "Erro ao buscar expediente:",
          barberError,
        );

        setErrorMessage(
          `Não foi possível carregar o expediente: ${barberError.message}`,
        );

        setBarberSchedule(null);
        setOccupiedAppointments([]);
        setLoadingTimes(false);
        return;
      }

      if (!barberData) {
        setErrorMessage(
          "O barbeiro selecionado não está disponível.",
        );

        setBarberSchedule(null);
        setOccupiedAppointments([]);
        setLoadingTimes(false);
        return;
      }

      setBarberSchedule(
        barberData as ExpedienteBarbeiro,
      );

      if (!selectedDate) {
        setOccupiedAppointments([]);
        setLoadingTimes(false);
        return;
      }

      const databaseDate =
        formatDateToDatabase(selectedDate);

      const {
        data: appointmentsData,
        error: appointmentsError,
      } = await supabase
        .from("agendamentos")
        .select("horario, duracao_minutos")
        .eq("barbeiro", selectedBarber)
        .eq("data", databaseDate)
        .neq("status", "Cancelado");

      if (appointmentsError) {
        console.error(
          "Erro ao buscar horários ocupados:",
          appointmentsError,
        );

        setErrorMessage(
          `Não foi possível carregar os horários: ${appointmentsError.message}`,
        );

        setOccupiedAppointments([]);
        setLoadingTimes(false);
        return;
      }

      setOccupiedAppointments(
        (appointmentsData ?? []) as AgendamentoOcupado[],
      );

      setLoadingTimes(false);
    }

    fetchScheduleAndAppointments();
  }, [selectedBarber, selectedDate]);

  const barberWorksOnSelectedDate = useMemo(() => {
    if (!selectedDate || !barberSchedule) {
      return false;
    }

    const selectedDay =
      displayDateToDate(selectedDate).getDay();

    return barberSchedule.dias_trabalho.includes(
      selectedDay,
    );
  }, [selectedDate, barberSchedule]);

  const availableTimes = useMemo(() => {
    if (
      !selectedDate ||
      !barberSchedule ||
      !barberWorksOnSelectedDate
    ) {
      return [];
    }

    const generatedTimes = generateTimes(
      barberSchedule.hora_entrada,
      barberSchedule.hora_saida,
    );

    const serviceDuration =
      selectedServiceDuration > 0
        ? selectedServiceDuration
        : 30;

    const businessClosing =
      convertTimeToMinutes(
        barberSchedule.hora_saida,
      );

    const lunchStart = barberSchedule.inicio_almoco
      ? convertTimeToMinutes(
          barberSchedule.inicio_almoco,
        )
      : null;

    const lunchEnd = barberSchedule.fim_almoco
      ? convertTimeToMinutes(
          barberSchedule.fim_almoco,
        )
      : null;

    return generatedTimes.filter((time) => {
      const candidateStart =
        convertTimeToMinutes(time);

      const candidateEnd =
        candidateStart + serviceDuration;

      if (
        isToday(selectedDate) &&
        hasTimePassed(time)
      ) {
        return false;
      }

      if (candidateEnd > businessClosing) {
        return false;
      }

      if (
        lunchStart !== null &&
        lunchEnd !== null
      ) {
        const crossesLunch = intervalsOverlap(
          candidateStart,
          candidateEnd,
          lunchStart,
          lunchEnd,
        );

        if (crossesLunch) {
          return false;
        }
      }

      const conflictsWithAppointment =
        occupiedAppointments.some(
          (appointment) => {
            const appointmentStart =
              convertTimeToMinutes(
                appointment.horario,
              );

            const appointmentDuration =
              appointment.duracao_minutos &&
              appointment.duracao_minutos > 0
                ? appointment.duracao_minutos
                : 30;

            const appointmentEnd =
              appointmentStart +
              appointmentDuration;

            return intervalsOverlap(
              candidateStart,
              candidateEnd,
              appointmentStart,
              appointmentEnd,
            );
          },
        );

      return !conflictsWithAppointment;
    });
  }, [
    barberSchedule,
    barberWorksOnSelectedDate,
    occupiedAppointments,
    selectedDate,
    selectedServiceDuration,
  ]);

  useEffect(() => {
    if (
      selectedTime &&
      !availableTimes.includes(selectedTime)
    ) {
      onSelectTime("");
    }
  }, [
    availableTimes,
    selectedTime,
    onSelectTime,
  ]);

  return (
    <section className="border-t border-white/10 bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            onSelectDate(date);
            onSelectTime("");
          }}
        />

        {selectedDate && (
          <div className="mt-16">
            <h2 className="text-4xl font-bold">
              Escolha o horário
            </h2>

            <p className="mt-3 text-gray-400">
              Horários disponíveis para{" "}
              {selectedDate} com {selectedBarber}.
            </p>

            <p className="mt-2 text-sm text-yellow-500">
              Duração do serviço:{" "}
              {selectedServiceDuration} minutos
            </p>

            {barberSchedule && (
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-lg bg-zinc-900 px-4 py-2 text-zinc-300">
                  Expediente:{" "}
                  {normalizeTime(
                    barberSchedule.hora_entrada,
                  )}{" "}
                  às{" "}
                  {normalizeTime(
                    barberSchedule.hora_saida,
                  )}
                </span>

                {barberSchedule.inicio_almoco &&
                  barberSchedule.fim_almoco && (
                    <span className="rounded-lg bg-zinc-900 px-4 py-2 text-zinc-300">
                      Almoço:{" "}
                      {normalizeTime(
                        barberSchedule.inicio_almoco,
                      )}{" "}
                      às{" "}
                      {normalizeTime(
                        barberSchedule.fim_almoco,
                      )}
                    </span>
                  )}
              </div>
            )}

            {loadingTimes && (
              <div className="mt-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-500">
                Carregando horários disponíveis...
              </div>
            )}

            {errorMessage && (
              <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-400">
                {errorMessage}
              </div>
            )}

            {!loadingTimes &&
              !errorMessage &&
              barberSchedule &&
              !barberWorksOnSelectedDate && (
                <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-center">
                  <p className="font-bold text-yellow-500">
                    Este barbeiro não trabalha nesta data.
                  </p>

                  <p className="mt-2 text-gray-400">
                    Escolha outro dia para continuar.
                  </p>
                </div>
              )}

            {!loadingTimes &&
              !errorMessage &&
              barberWorksOnSelectedDate &&
              availableTimes.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() =>
                        onSelectTime(time)
                      }
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
              barberWorksOnSelectedDate &&
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