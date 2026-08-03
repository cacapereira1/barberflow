import { supabase } from "@/lib/supabase";

export type Agendamento = {
  id?: number;
  cliente: string;
  telefone: string;
  email: string | null;
  barbeiro: string;
  servico: string;
  data: string;
  horario: string;
  valor: number;
  status: string;
  observacoes: string | null;
};

export async function buscarAgendamentos() {
  return supabase
    .from("agendamentos")
    .select("*")
    .order("data", { ascending: true })
    .order("horario", { ascending: true });
}

export async function criarAgendamento(
  agendamento: Omit<Agendamento, "id">,
) {
  return supabase
    .from("agendamentos")
    .insert(agendamento);
}

export async function atualizarStatusAgendamento(
  id: number,
  status: string,
) {
  return supabase
    .from("agendamentos")
    .update({ status })
    .eq("id", id);
}

export async function verificarHorarioOcupado(
  barbeiro: string,
  data: string,
  horario: string,
) {
  return supabase
    .from("agendamentos")
    .select("id")
    .eq("barbeiro", barbeiro)
    .eq("data", data)
    .eq("horario", horario)
    .neq("status", "Cancelado")
    .limit(1);
}