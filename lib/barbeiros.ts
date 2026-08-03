import { supabase } from "@/lib/supabase";

export type Barbeiro = {
  id: number;
  nome: string;
  especialidade: string | null;
  hora_entrada: string;
  hora_saida: string;
  inicio_almoco: string | null;
  fim_almoco: string | null;
  dias_trabalho: number[];
  ativo: boolean;
};

export async function buscarTodosBarbeiros() {
  return supabase
    .from("barbeiros")
    .select("*")
    .order("nome", { ascending: true });
}

export async function buscarBarbeirosAtivos() {
  return supabase
    .from("barbeiros")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });
}

export async function cadastrarBarbeiro(
  barbeiro: Omit<Barbeiro, "id">,
) {
  return supabase.from("barbeiros").insert(barbeiro);
}

export async function atualizarBarbeiro(
  id: number,
  dados: Partial<Omit<Barbeiro, "id">>,
) {
  return supabase
    .from("barbeiros")
    .update(dados)
    .eq("id", id);
}

export async function excluirBarbeiro(id: number) {
  return supabase
    .from("barbeiros")
    .delete()
    .eq("id", id);
}