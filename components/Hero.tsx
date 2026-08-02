export default function Hero() {
  return (
    <section className="flex min-h-screen items-center bg-black px-6 text-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Agendamento simples e rápido
          </p>

          <h2 className="text-5xl font-bold leading-tight md:text-7xl">
            Seu estilo.
            <br />
            Seu horário.
            <br />
            <span className="text-yellow-500">Sua escolha.</span>
          </h2>

          <p className="mt-6 max-w-xl text-lg text-gray-400">
            Escolha o serviço, o barbeiro e o melhor horário para você em poucos
            segundos.
          </p>

          <button className="mt-8 rounded-lg bg-yellow-500 px-7 py-4 font-semibold text-black transition hover:bg-yellow-400">
            Agendar agora
          </button>
        </div>

        <div className="flex min-h-[450px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-900">
          <div className="text-center">
            <span className="text-8xl">💈</span>
            <p className="mt-4 text-gray-500">
              Em breve colocaremos uma foto profissional
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}