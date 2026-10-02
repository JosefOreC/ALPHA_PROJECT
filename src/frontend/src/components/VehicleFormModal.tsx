import React, { useState } from 'react';
import type { CreateVehicleInput, FuelType, UpdateVehicleInput, Vehicle, VehicleStatus } from '../types/vehicle';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateVehicleInput | UpdateVehicleInput) => Promise<void>;
  initialVehicle?: Vehicle | null;
  serverError?: string | null;
  isSubmitting: boolean;
}

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'DIESEL', label: 'Diésel' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'GNV', label: 'Gas Natural Vehicular (GNV)' },
  { value: 'GLP', label: 'Gas Licuado de Petróleo (GLP)' },
  { value: 'ELECTRICO', label: '100% Eléctrico (Sostenible)' },
  { value: 'HIBRIDO', label: 'Híbrido' },
];

const STATUS_OPTIONS: { value: VehicleStatus; label: string; desc: string }[] = [
  { value: 'DISPONIBLE', label: 'Disponible', desc: 'Listo para asignar a rutas' },
  { value: 'EN_RUTA', label: 'En Ruta', desc: 'Operando en ruta asignada' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', desc: 'Taller o revisión técnica' },
  { value: 'INACTIVO', label: 'Inactivo', desc: 'Fuera de flota activa' },
];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialVehicle,
  serverError,
  isSubmitting,
}) => {
  const isEditing = Boolean(initialVehicle);

  const [placa, setPlaca] = useState(initialVehicle ? initialVehicle.placa : '');
  const [capacidadKg, setCapacidadKg] = useState<string>(initialVehicle ? String(initialVehicle.capacidad_kg) : '');
  const [capacidadM3, setCapacidadM3] = useState<string>(
    initialVehicle && initialVehicle.capacidad_m3 ? String(initialVehicle.capacidad_m3) : ''
  );
  const [tipoCombustible, setTipoCombustible] = useState<FuelType>(
    (initialVehicle?.tipo_combustible as FuelType) || 'DIESEL'
  );
  const [estado, setEstado] = useState<VehicleStatus>(initialVehicle?.estado || 'DISPONIBLE');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanPlate = placa.trim().toUpperCase().replace('-', '');
    if (!cleanPlate) {
      errors.placa = 'La placa es obligatoria.';
    } else if (cleanPlate.length < 3 || cleanPlate.length > 10) {
      errors.placa = 'La placa debe contener entre 3 y 10 caracteres alfanuméricos.';
    }

    const kg = parseFloat(capacidadKg);
    if (isNaN(kg) || kg <= 0) {
      errors.capacidad_kg = 'La capacidad debe ser un número mayor a 0 kg.';
    }

    if (capacidadM3) {
      const m3 = parseFloat(capacidadM3);
      if (isNaN(m3) || m3 <= 0) {
        errors.capacidad_m3 = 'El volumen debe ser mayor a 0 m³.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateVehicleInput = {
      placa: placa.trim().toUpperCase(),
      capacidad_kg: parseFloat(capacidadKg),
      capacidad_m3: capacidadM3 ? parseFloat(capacidadM3) : null,
      tipo_combustible: tipoCombustible,
      estado,
    };

    await onSubmit(payload);
  };

  return (
    <div className="modal-backdrop" id="vehicle-modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        id="vehicle-modal-container"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-badge">{isEditing ? 'Modo Edición' : 'US-001 Registro'}</div>
            <h2 className="modal-title" id="vehicle-modal-title">
              {isEditing ? `Editar Vehículo: ${initialVehicle?.placa}` : 'Registrar Nuevo Vehículo'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Actualiza los datos técnicos, capacidad o estado operativo del vehículo.'
                : 'Ingresa los datos para incorporar una nueva unidad a la flota activa.'}
            </p>
          </div>
          <button
            className="modal-close-btn"
            id="vehicle-modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div className="modal-alert-error" id="vehicle-modal-error" role="alert">
            <span className="alert-icon">⚠</span>
            <div className="alert-text">
              <strong>Error de Validación:</strong> {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form" id="vehicle-form">
          <div className="form-group">
            <label htmlFor="input-placa" className="form-label">
              Placa del Vehículo <span className="required-mark">*</span>
            </label>
            <div className="input-with-badge">
              <span className="plate-prefix">PER</span>
              <input
                id="input-placa"
                type="text"
                className={`form-input plate-input ${validationErrors.placa ? 'input-error' : ''}`}
                placeholder="Ej. ABC-123"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                maxLength={10}
                autoFocus={!isEditing}
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.placa && (
              <span className="field-error-text" id="error-placa">
                {validationErrors.placa}
              </span>
            )}
            <small className="field-hint">Formato alfanumérico sugerido de 6 caracteres (ej. ABC-123).</small>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="input-capacidad-kg" className="form-label">
                Capacidad de Carga (kg) <span className="required-mark">*</span>
              </label>
              <div className="input-unit-wrapper">
                <input
                  id="input-capacidad-kg"
                  type="number"
                  step="0.01"
                  min="1"
                  className={`form-input ${validationErrors.capacidad_kg ? 'input-error' : ''}`}
                  placeholder="Ej. 1500"
                  value={capacidadKg}
                  onChange={(e) => setCapacidadKg(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="input-unit">kg</span>
              </div>
              {validationErrors.capacidad_kg && (
                <span className="field-error-text" id="error-capacidad-kg">
                  {validationErrors.capacidad_kg}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="input-capacidad-m3" className="form-label">
                Capacidad Volumétrica (m³) <span className="optional-tag">(Opcional)</span>
              </label>
              <div className="input-unit-wrapper">
                <input
                  id="input-capacidad-m3"
                  type="number"
                  step="0.01"
                  min="0.1"
                  className={`form-input ${validationErrors.capacidad_m3 ? 'input-error' : ''}`}
                  placeholder="Ej. 8.5"
                  value={capacidadM3}
                  onChange={(e) => setCapacidadM3(e.target.value)}
                  disabled={isSubmitting}
                />
                <span className="input-unit">m³</span>
              </div>
              {validationErrors.capacidad_m3 && (
                <span className="field-error-text" id="error-capacidad-m3">
                  {validationErrors.capacidad_m3}
                </span>
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="select-combustible" className="form-label">
                Tipo de Combustible <span className="required-mark">*</span>
              </label>
              <select
                id="select-combustible"
                className="form-select"
                value={tipoCombustible}
                onChange={(e) => setTipoCombustible(e.target.value as FuelType)}
                disabled={isSubmitting}
              >
                {FUEL_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="select-estado" className="form-label">
                Estado Operativo <span className="required-mark">*</span>
              </label>
              <select
                id="select-estado"
                className="form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value as VehicleStatus)}
                disabled={isSubmitting}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label} — {st.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              id="btn-cancel-vehicle"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-vehicle"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-sm"></span> Guardando...
                </>
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Registrar Vehículo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
