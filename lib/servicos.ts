import { supabase } from "@/lib/supabase";

export type Servico = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
};

export async function buscarTodosServicos() {
  return supabase
    .from("servicos")
    .select("*")
    .order("nome", { ascending: true });
}

export async function buscarServicosAtivos() {
  return supabase
    .from("servicos")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });
}

export async function cadastrarServico(
  servico: Omit<Servico, "id">,
) {
  return supabase.from("servicos").insert(servico);
}

export async function atualizarServico(
  id: number,
  dados: Partial<Omit<Servico, "id">>,
) {
  return supabase
    .from("servicos")
    .update(dados)
    .eq("id", id);
}

export async function excluirServico(id: number) {
  return supabase
    .from("servicos")
    .delete()
    .eq("id", id);
}