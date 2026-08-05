"use client";

import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { format, parse } from "date-fns";

type CalendarProps = {
  dates?: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function converterTextoParaData(data: string) {
  if (!data) {
    return undefined;
  }

  return parse(data, "dd/MM/yyyy", new Date());
}

function removerHorario(data: Date) {
  const novaData = new Date(data);

  novaData.setHours(0, 0, 0, 0);

  return novaData;
}

export default function Calendar({
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const hoje = removerHorario(new Date());

  const dataSelecionada =
    converterTextoParaData(selectedDate);

  function selecionarData(data: Date | undefined) {
    if (!data) {
      return;
    }

    const dataFormatada = format(
      data,
      "dd/MM/yyyy",
    );

    onSelectDate(dataFormatada);
  }

  return (
    <div>
      <h2 className="text-4xl font-bold">
        Escolha a data
      </h2>

      <p className="mt-3 text-gray-400">
        Selecione o melhor dia para o seu atendimento.
      </p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:p-8">
        <DayPicker
          mode="single"
          locale={ptBR}
          selected={dataSelecionada}
          onSelect={selecionarData}
          disabled={{
            before: hoje,
          }}
          startMonth={hoje}
          showOutsideDays
          animate
          footer={
            dataSelecionada
              ? `Data selecionada: ${format(
                  dataSelecionada,
                  "dd 'de' MMMM 'de' yyyy",
                  {
                    locale: ptBR,
                  },
                )}`
              : "Escolha uma data para continuar."
          }
          classNames={{
            root: "mx-auto w-full",
            months: "flex justify-center",
            month: "w-full max-w-xl",

            month_caption:
              "relative mb-8 flex h-12 items-center justify-center",
            caption_label:
              "text-xl font-bold capitalize text-white sm:text-2xl",

            nav: "absolute inset-x-0 top-0 flex h-12 items-center justify-between",
            button_previous:
              "relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-black text-yellow-500 transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black",
            button_next:
              "relative z-10 ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-black text-yellow-500 transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black",
            chevron: "h-5 w-5 fill-current",

            month_grid:
              "w-full table-fixed border-collapse",
            weekdays:
              "border-b border-zinc-800",
            weekday:
              "pb-4 text-center text-xs font-bold uppercase text-zinc-500 sm:text-sm",

            weeks: "mt-3",
            week: "",
            day: "p-1 text-center sm:p-2",
            day_button:
              "mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-yellow-500 sm:h-12 sm:w-12 sm:text-base",

            selected:
              "[&>button]:bg-yellow-500 [&>button]:text-black [&>button]:shadow-lg [&>button]:shadow-yellow-500/20 hover:[&>button]:bg-yellow-400",
            today:
              "[&>button]:border [&>button]:border-yellow-500 [&>button]:text-yellow-500",
            disabled:
              "opacity-25 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent [&>button]:hover:text-zinc-200",
            outside:
              "opacity-20",
            hidden: "invisible",

            footer:
              "mt-8 border-t border-zinc-800 pt-5 text-center text-sm font-semibold capitalize text-yellow-500",
          }}
        />
      </div>
    </div>
  );
}