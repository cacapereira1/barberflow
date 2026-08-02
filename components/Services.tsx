const services = [
  {
    name: "Corte tradicional",
    price: "R$ 40",
    description: "Corte moderno ou clássico, feito sob medida para você.",
  },
  {
    name: "Barba",
    price: "R$ 30",
    description: "Modelagem, acabamento e cuidado completo para sua barba.",
  },
  {
    name: "Corte + barba",
    price: "R$ 60",
    description: "O pacote completo para renovar o seu visual.",
  },
];

export default function Services() {
  return (
    <section id="servicos" className="bg-zinc-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
            Nossos serviços
          </p>

          <h2 className="mt-3 text-4xl font-bold md:text-5xl">
            Escolha sua experiência
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Serviços pensados para cuidar do seu estilo com qualidade,
            praticidade e atendimento profissional.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.name}
              className="rounded-2xl border border-white/10 bg-zinc-900 p-7 transition duration-300 hover:-translate-y-2 hover:border-yellow-500"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold">{service.name}</h3>

                <span className="whitespace-nowrap font-bold text-yellow-500">
                  {service.price}
                </span>
              </div>

              <p className="mt-4 leading-7 text-gray-400">
                {service.description}
              </p>

              <button className="mt-7 font-semibold text-yellow-500 transition hover:text-yellow-400">
                Agendar serviço →
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}