"use client";

type CustomerFormProps = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes: string;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeNotes: (value: string) => void;
};

export default function CustomerForm({
  customerName,
  customerPhone,
  customerEmail,
  customerNotes,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onChangeNotes,
}: CustomerFormProps) {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold">Seus dados</h2>

        <p className="mt-3 text-gray-400">
          Preencha as informações para concluir o agendamento.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="customerName"
              className="mb-2 block font-semibold"
            >
              Nome completo
            </label>

            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(event) => onChangeName(event.target.value)}
              placeholder="Digite seu nome"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>

          <div>
            <label
              htmlFor="customerPhone"
              className="mb-2 block font-semibold"
            >
              WhatsApp
            </label>

            <input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(event) => onChangePhone(event.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="customerEmail"
              className="mb-2 block font-semibold"
            >
              E-mail <span className="text-gray-500">(opcional)</span>
            </label>

            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(event) => onChangeEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="customerNotes"
              className="mb-2 block font-semibold"
            >
              Observações <span className="text-gray-500">(opcional)</span>
            </label>

            <textarea
              id="customerNotes"
              value={customerNotes}
              onChange={(event) => onChangeNotes(event.target.value)}
              placeholder="Exemplo: gostaria de fazer degradê baixo..."
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 outline-none transition placeholder:text-zinc-500 focus:border-yellow-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}