export default function Footer() {
  return (
    <footer id="contato" className="border-t border-white/10 bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Barber<span className="text-yellow-500">Flow</span>
          </h2>

          <p className="mt-2 text-gray-400">
            Seu tempo vale mais. Agende em segundos.
          </p>
        </div>

        <div className="text-gray-400 md:text-right">
          <p>Rua Exemplo, 123 — São Paulo/SP</p>
          <p className="mt-1">(11) 99999-9999</p>
          <p className="mt-1">Segunda a sábado, das 9h às 20h</p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-gray-500">
        © 2026 BarberFlow. Todos os direitos reservados.
      </div>
    </footer>
  );
}