from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from application.dto.vehicle_dto import (
    CreateVehicleDTO,
    UpdateVehicleDTO,
    VehicleListResponseDTO,
    VehicleResponseDTO,
)
from application.use_cases.get_vehicle_by_id import GetVehicleByIdUseCase
from application.use_cases.get_vehicles import GetVehiclesUseCase
from application.use_cases.register_vehicle import RegisterVehicleUseCase
from application.use_cases.update_vehicle import UpdateVehicleUseCase
from domain.exceptions.vehicle_exceptions import (
    InvalidVehicleDataError,
    VehicleNotFoundError,
    VehiclePlateAlreadyExistsError,
)
from domain.value_objects import VehicleStates
from interfaces.api.security.deps import protect_mutation, require_permission
from infrastructure.dependencies import (
    get_register_vehicle_use_case,
    get_update_vehicle_use_case,
    get_vehicle_by_id_use_case,
    get_vehicles_use_case,
)

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post(
    "",
    response_model=VehicleResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo vehículo en la flota (US-001)",
    dependencies=[Depends(require_permission("fleet.create")), Depends(protect_mutation)],
)
def register_vehicle(
    dto: CreateVehicleDTO,
    use_case: RegisterVehicleUseCase = Depends(get_register_vehicle_use_case),
):
    try:
        return use_case.execute(dto)
    except VehiclePlateAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except (InvalidVehicleDataError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=VehicleListResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Consultar listado de vehículos disponibles y activos (US-002)",
    dependencies=[Depends(require_permission("fleet.read"))],
)
def list_vehicles(
    status_filter: Optional[VehicleStates] = Query(None, alias="status", description="Filtrar por estado (ej. DISPONIBLE, EN_RUTA, MANTENIMIENTO, INACTIVO)"),
    only_available: bool = Query(False, description="Filtrar únicamente vehículos disponibles"),
    use_case: GetVehiclesUseCase = Depends(get_vehicles_use_case),
):
    return use_case.execute(status=status_filter, only_available=only_available)


@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Consultar detalle de un vehículo",
    dependencies=[Depends(require_permission("fleet.read"))],
)
def get_vehicle_by_id(
    vehicle_id: str,
    use_case: GetVehicleByIdUseCase = Depends(get_vehicle_by_id_use_case),
):
    try:
        return use_case.execute(vehicle_id)
    except VehicleNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.put(
    "/{vehicle_id}",
    response_model=VehicleResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Editar información y estado de un vehículo",
    dependencies=[Depends(require_permission("fleet.update")), Depends(protect_mutation)],
)
def update_vehicle(
    vehicle_id: str,
    dto: UpdateVehicleDTO,
    use_case: UpdateVehicleUseCase = Depends(get_update_vehicle_use_case),
):
    try:
        return use_case.execute(vehicle_id, dto)
    except VehicleNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except VehiclePlateAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except (InvalidVehicleDataError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
