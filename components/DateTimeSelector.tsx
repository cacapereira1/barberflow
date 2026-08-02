"use client";

type DateTimeSelectorProps = {
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
};

const dates = [
  "02/08/2026",
  "03/08/2026",
  "04/08/2026",
  "05/08/2026",
  "06/08/2026",
];

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

export default function DateTimeSelector({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: DateTimeSelectorProps) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <div>
          <h2 className="text-4xl font-bold">Escolha a data</h2>

          <p className="mt-3 text-gray-400">
            Selecione o melhor dia para o seu atendimento.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => {
                  onSelectDate(date);
                  onSelectTime("");
                }}
                className={`rounded-xl border px-5 py-4 font-semibold transition ${
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
              Horários disponíveis para {selectedDate}.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {times.map((time) => (
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
          </div>
        )}
      </div>
    </section>
  );
}