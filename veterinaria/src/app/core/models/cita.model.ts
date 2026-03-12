export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Cita {
  id: string;
  mascotaId: string;
  fechaHora: string;
  motivo: string;
  tipoServicio: string;
  veterinario: string;
  telefonoContacto: string;
  emailContacto: string;
  notas: string;
  estado: EstadoCita;
  resumenAtencion: string;
  createdAt: string;
}

export interface CitaDraft {
  mascotaId: string;
  fechaHora: string;
  motivo: string;
  tipoServicio: string;
  veterinario: string;
  telefonoContacto: string;
  emailContacto: string;
  notas: string;
}

export interface DayAvailability {
  fecha: string;
  disponibles: number;
  ocupadas: number;
}
