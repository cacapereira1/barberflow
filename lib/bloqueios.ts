import { supabase } from "@/lib/supabase";

export type BloqueioAgenda = {
  id: number;
  barbeiro_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  motivo: string | null;
  created_at: string;
};

export type NovoBloqueioAgenda = {
  barbeiro_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  motivo: string | null;
};

export async function buscarTodosBloqueios() {
  return supabase
    .from("bloqueios_agenda")
    .select(`
      id,
      barbeiro_id,
      data,
      hora_inicio,
      hora_fim,
      motivo,
      created_at,
      barbeiros (
        id,
        nome
      )
    `)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });
}

export async function buscarBloqueiosDoBarbeiro(
  barbeiroId: number,
  data?: string,
) {
  let consulta = supabase
    .from("bloqueios_agenda")
    .select(`
      id,
      barbeiro_id,
      data,
      hora_inicio,
      hora_fim,
      motivo,
      created_at
    `)
    .eq("barbeiro_id", barbeiroId)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });

  if (data) {
    consulta = consulta.eq("data", data);
  }

  return consulta;
}

export async function cadastrarBloqueio(
  bloqueio: NovoBloqueioAgenda,
) {
  return supabase
    .from("bloqueios_agenda")
    .insert(bloqueio)
    .select()
    .single();
}

export async function excluirBloqueio(
  bloqueioId: number,
) {
  return supabase
    .from("bloqueios_agenda")
    .delete()
    .eq("id", bloqueioId);
}