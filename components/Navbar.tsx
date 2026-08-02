export default function Navbar() {
  return (
    <header className="bg-black text-white p-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="text-3xl font-bold">
          Barber<span className="text-yellow-500">Flow</span>
        </h1>

        <nav className="flex gap-8">
          <a href="#">Início</a>
          <a href="#">Serviços</a>
          <a href="#">Contato</a>
        </nav>

        <button className="rounded bg-yellow-500 px-5 py-2 font-bold text-black">
          Agendar
        </button>
      </div>
    </header>
  );
}