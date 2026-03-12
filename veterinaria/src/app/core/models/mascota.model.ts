export type EspecieMascota = 'Perro' | 'Gato' | 'Ave' | 'Otro';

export interface Dueno {
  nombreCompleto: string;
  telefono: string;
  email: string;
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: EspecieMascota;
  raza: string;
  fechaNacimiento: string;
  pesoKg: number;
  dueno: Dueno;
  notas: string;
  createdAt: string;
}

export interface MascotaDraft {
  nombre: string;
  especie: EspecieMascota;
  raza: string;
  fechaNacimiento: string;
  pesoKg: number;
  dueno: Dueno;
  notas: string;
}
