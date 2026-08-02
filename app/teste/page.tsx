"use client";

import { supabase } from "@/lib/supabase";

export default function Teste() {
  async function testar() {
    console.log(supabase);
    alert("Supabase conectado!");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <button
        onClick={testar}
        className="bg-yellow-500 px-8 py-4 rounded-xl text-black font-bold rounded-lg"
      >
        Testar conexão
      </button>
    </main>
  );
}