"use client";

type CalendarProps = {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function Calendar({
  dates,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  return (
    <div>
      <h2 className="text-4xl font-bold">
        Escolha a data
      </h2>

      <p className="mt-3 text-gray-400">
        Selecione o melhor dia para o seu atendimento.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDate(date)}
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
  );
}