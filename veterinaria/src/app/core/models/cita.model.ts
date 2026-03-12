export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  mascotaId: string;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
  resumenAtencion: string;
  createdAt: string;
}

export interface CitaDraft {
  mascotaId: string;
  fechaHora: string;
  motivo: string;
}

export interface DayAvailability {
  fecha: string;
  disponibles: number;
  ocupadas: number;
}
