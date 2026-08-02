const barbers = [
  {
    name: "Lucas Ferreira",
    specialty: "Cortes modernos e degradê",
    initials: "LF",
  },
  {
    name: "Rafael Santos",
    specialty: "Barba e cortes clássicos",
    initials: "RS",
  },
  {
    name: "Matheus Oliveira",
    specialty: "Pigmentação e acabamento",
    initials: "MO",
  },
];

export default function Barbers() {
  return (
    <section id="barbeiros" className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Nossa equipe
          </p>

          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            Escolha seu barbeiro
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Profissionais preparados para oferecer uma experiência de qualidade.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {barbers.map((barber) => (
            <article
              key={barber.name}
              className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
            >
              <div className="flex h-72 items-center justify-center bg-zinc-800">
                <span className="flex h-28 w-28 items-center justify-center rounded-full bg-yellow-500 text-3xl font-bold text-black">
                  {barber.initials}
                </span>
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-bold">{barber.name}</h3>

                <p className="mt-2 text-gray-400">{barber.specialty}</p>

                <button className="mt-6 font-semibold text-yellow-500 transition hover:text-yellow-400">
                  Ver horários →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}