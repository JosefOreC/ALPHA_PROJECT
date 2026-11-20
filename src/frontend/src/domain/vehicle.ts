export type VehicleStatus = 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO' | 'INACTIVO';

export type FuelType = 'DIESEL' | 'GASOLINA' | 'GNV' | 'GLP' | 'ELECTRICO' | 'HIBRIDO';

export interface Vehicle {
  vehiculo_id: string;
  placa: string;
  capacidad_kg: number;
  capacidad_m3?: number | null;
  tipo_combustible: FuelType | string;
  estado: VehicleStatus;
  disponible: boolean;
  activo: boolean;
  creado_en: string;
}

export interface CreateVehicleInput {
  placa: string;
  capacidad_kg: number;
  capacidad_m3?: number | null;
  tipo_combustible: FuelType | string;
  estado?: VehicleStatus;
}

export interface UpdateVehicleInput {
  placa?: string;
  capacidad_kg?: number;
  capacidad_m3?: number | null;
  tipo_combustible?: FuelType | string;
  estado?: VehicleStatus;
}

export interface VehicleListResponse {
  total: number;
  vehiculos: Vehicle[];
  mensaje?: string | null;
}
