"use client";

type TimeGridProps = {
  selectedTime: string;
  onSelectTime: (time: string) => void;
};

export default function TimeGrid({
  selectedTime,
  onSelectTime,
}: TimeGridProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-2xl font-bold text-white">
        Horários
      </h2>

      <p className="text-gray-400">
        Aqui aparecerão os horários disponíveis.
      </p>
    </div>
  );
}