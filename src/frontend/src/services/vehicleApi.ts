import type { CreateVehicleInput, UpdateVehicleInput, Vehicle, VehicleListResponse } from '../types/vehicle';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Semillas iniciales en caso de fallback local
const INITIAL_MOCK_VEHICLES: Vehicle[] = [
  {
    vehiculo_id: 'v-101',
    placa: 'ABC-101',
    capacidad_kg: 1500,
    capacidad_m3: 8.5,
    tipo_combustible: 'DIESEL',
    estado: 'DISPONIBLE',
    disponible: true,
    activo: true,
    creado_en: new Date().toISOString(),
  },
  {
    vehiculo_id: 'v-102',
    placa: 'XYZ-202',
    capacidad_kg: 2200,
    capacidad_m3: 12.0,
    tipo_combustible: 'GNV',
    estado: 'DISPONIBLE',
    disponible: true,
    activo: true,
    creado_en: new Date().toISOString(),
  },
  {
    vehiculo_id: 'v-103',
    placa: 'ECO-303',
    capacidad_kg: 800,
    capacidad_m3: 4.2,
    tipo_combustible: 'ELECTRICO',
    estado: 'EN_RUTA',
    disponible: false,
    activo: true,
    creado_en: new Date().toISOString(),
  },
  {
    vehiculo_id: 'v-104',
    placa: 'MNT-404',
    capacidad_kg: 3000,
    capacidad_m3: 16.0,
    tipo_combustible: 'DIESEL',
    estado: 'MANTENIMIENTO',
    disponible: false,
    activo: true,
    creado_en: new Date().toISOString(),
  },
];

class VehicleApiService {
  private localVehicles: Vehicle[] = [...INITIAL_MOCK_VEHICLES];
  private useLocalFallback = false;

  async getVehicles(status?: string, onlyAvailable?: boolean): Promise<{ data: VehicleListResponse; isLocal: boolean }> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (onlyAvailable) params.append('only_available', 'true');

      const response = await fetch(`${API_BASE_URL}/vehicles?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.statusText}`);
      }
      const data: VehicleListResponse = await response.json();
      this.useLocalFallback = false;
      return { data, isLocal: false };
    } catch {
      // Fallback local elegante si el backend FastAPI aún no está iniciado
      this.useLocalFallback = true;
      let filtered = [...this.localVehicles];
      if (onlyAvailable) {
        filtered = filtered.filter(v => v.estado === 'DISPONIBLE');
      } else if (status) {
        filtered = filtered.filter(v => v.estado.toUpperCase() === status.toUpperCase());
      }

      const activeVehicles = filtered.filter(v => v.estado !== 'INACTIVO');
      const mensaje = (!activeVehicles.length && !status) ? 'No hay vehículos activos registrados' : null;

      return {
        data: {
          total: filtered.length,
          vehiculos: filtered,
          mensaje,
        },
        isLocal: true,
      };
    }
  }

  async createVehicle(input: CreateVehicleInput): Promise<{ data: Vehicle; isLocal: boolean }> {
    const normalizedPlate = input.placa.trim().toUpperCase();

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          placa: normalizedPlate,
        }),
      });

      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'La placa ingresada ya se encuentra registrada en el sistema');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al registrar el vehículo');
      }

      const data: Vehicle = await response.json();
      return { data, isLocal: false };
    } catch (err: any) {
      if (err.message === 'La placa ingresada ya se encuentra registrada en el sistema') {
        throw err;
      }

      // Si falló por conexión de red, procesamos en fallback local validando la placa duplicada
      const duplicate = this.localVehicles.find(v => v.placa === normalizedPlate);
      if (duplicate) {
        throw new Error('La placa ingresada ya se encuentra registrada en el sistema');
      }

      const newVehicle: Vehicle = {
        vehiculo_id: `v-${Date.now()}`,
        placa: normalizedPlate,
        capacidad_kg: Number(input.capacidad_kg),
        capacidad_m3: input.capacidad_m3 ? Number(input.capacidad_m3) : null,
        tipo_combustible: input.tipo_combustible,
        estado: input.estado || 'DISPONIBLE',
        disponible: (input.estado || 'DISPONIBLE') === 'DISPONIBLE',
        activo: (input.estado || 'DISPONIBLE') !== 'INACTIVO',
        creado_en: new Date().toISOString(),
      };

      this.localVehicles.unshift(newVehicle);
      return { data: newVehicle, isLocal: true };
    }
  }

  async updateVehicle(vehicleId: string, input: UpdateVehicleInput): Promise<{ data: Vehicle; isLocal: boolean }> {
    const normalizedPlate = input.placa ? input.placa.trim().toUpperCase() : undefined;

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...input,
          ...(normalizedPlate ? { placa: normalizedPlate } : {}),
        }),
      });

      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'La placa ingresada ya se encuentra registrada en el sistema');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al actualizar el vehículo');
      }

      const data: Vehicle = await response.json();
      return { data, isLocal: false };
    } catch (err: any) {
      if (err.message === 'La placa ingresada ya se encuentra registrada en el sistema') {
        throw err;
      }

      const index = this.localVehicles.findIndex(v => v.vehiculo_id === vehicleId);
      if (index === -1) {
        throw new Error('Vehículo no encontrado');
      }

      if (normalizedPlate) {
        const duplicate = this.localVehicles.find(
          v => v.placa === normalizedPlate && v.vehiculo_id !== vehicleId
        );
        if (duplicate) {
          throw new Error('La placa ingresada ya se encuentra registrada en el sistema');
        }
      }

      const current = this.localVehicles[index];
      const updatedEstado = input.estado || current.estado;

      const updatedVehicle: Vehicle = {
        ...current,
        ...(normalizedPlate ? { placa: normalizedPlate } : {}),
        ...(input.capacidad_kg !== undefined ? { capacidad_kg: Number(input.capacidad_kg) } : {}),
        ...(input.capacidad_m3 !== undefined ? { capacidad_m3: input.capacidad_m3 ? Number(input.capacidad_m3) : null } : {}),
        ...(input.tipo_combustible ? { tipo_combustible: input.tipo_combustible } : {}),
        estado: updatedEstado,
        disponible: updatedEstado === 'DISPONIBLE',
        activo: updatedEstado !== 'INACTIVO',
      };

      this.localVehicles[index] = updatedVehicle;
      return { data: updatedVehicle, isLocal: true };
    }
  }

  isUsingLocalFallback(): boolean {
    return this.useLocalFallback;
  }
}

export const vehicleApi = new VehicleApiService();
