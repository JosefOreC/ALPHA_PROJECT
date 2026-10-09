from fastapi import APIRouter, Depends, HTTPException, status
from domain.access_control import Identity, scope_for
from interfaces.api.security.deps import protect_mutation, require_permission

from application.dto.driver_dto import (
    CreateDriverRequest,
    DriverListResponse,
    DriverResponse,
    UpdateDriverRequest,
)
from application.use_cases.activate_driver import ActivateDriver
from application.use_cases.deactivate_driver import DeactivateDriver
from application.use_cases.get_driver_by_id import GetDriverById
from application.use_cases.get_drivers import GetDrivers
from application.use_cases.register_driver import RegisterDriver
from application.use_cases.update_driver import UpdateDriver
from domain.exceptions.driver_exceptions import (
    DriverAlreadyExistsError,
    DriverNotFoundError,
)
from infrastructure.dependencies import (
    get_activate_driver,
    get_deactivate_driver,
    get_get_driver_by_id,
    get_get_drivers,
    get_register_driver,
    get_update_driver,
)


router = APIRouter(
    prefix="/drivers",
    tags=["Drivers"],
)


@router.post(
    "",
    response_model=DriverResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("drivers.create")), Depends(protect_mutation)],
)
def register_driver(
    request: CreateDriverRequest,
    use_case: RegisterDriver = Depends(get_register_driver),
):
    try:
        driver = use_case.execute(
            nombre_completo=request.nombre_completo,
            dni=request.dni,
            licencia=request.licencia,
            vehiculo_id=request.vehiculo_id,
            estado=request.estado,
        )

        return DriverResponse.from_domain(driver)

    except DriverAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get(
    "",
    response_model=DriverListResponse,
)
def get_drivers(
    use_case: GetDrivers = Depends(get_get_drivers),
    principal: Identity = Depends(require_permission("drivers.read")),
):
    drivers = use_case.execute()
    if scope_for(principal.role, "drivers.read") == "own":
        drivers = [driver for driver in drivers if driver.conductor_id == principal.driver_id]

    return DriverListResponse(
        items=[
            DriverResponse.from_domain(driver)
            for driver in drivers
        ],
        total=len(drivers),
    )


@router.get(
    "/{conductor_id}",
    response_model=DriverResponse,
)
def get_driver_by_id(
    conductor_id: str,
    use_case: GetDriverById = Depends(get_get_driver_by_id),
    principal: Identity = Depends(require_permission("drivers.read")),
):
    if scope_for(principal.role, "drivers.read") == "own" and conductor_id != principal.driver_id:
        raise HTTPException(404, "Conductor no encontrado.")
    try:
        driver = use_case.execute(conductor_id)

        return DriverResponse.from_domain(driver)

    except DriverNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.put(
    "/{conductor_id}",
    response_model=DriverResponse,
    dependencies=[Depends(require_permission("drivers.update")), Depends(protect_mutation)],
)
def update_driver(
    conductor_id: str,
    request: UpdateDriverRequest,
    use_case: UpdateDriver = Depends(get_update_driver),
):
    try:
        driver = use_case.execute(
            conductor_id=conductor_id,
            nombre_completo=request.nombre_completo,
            dni=request.dni,
            licencia=request.licencia,
            vehiculo_id=request.vehiculo_id,
            estado=request.estado,
        )

        return DriverResponse.from_domain(driver)

    except DriverNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    except DriverAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.patch(
    "/{conductor_id}/activate",
    response_model=DriverResponse,
    dependencies=[Depends(require_permission("drivers.update")), Depends(protect_mutation)],
)
def activate_driver(
    conductor_id: str,
    use_case: ActivateDriver = Depends(get_activate_driver),
):
    try:
        driver = use_case.execute(conductor_id)

        return DriverResponse.from_domain(driver)

    except DriverNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.patch(
    "/{conductor_id}/deactivate",
    response_model=DriverResponse,
    dependencies=[Depends(require_permission("drivers.update")), Depends(protect_mutation)],
)
def deactivate_driver(
    conductor_id: str,
    use_case: DeactivateDriver = Depends(get_deactivate_driver),
):
    try:
        driver = use_case.execute(conductor_id)

        return DriverResponse.from_domain(driver)

    except DriverNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
