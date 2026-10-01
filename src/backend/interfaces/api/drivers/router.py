from fastapi import APIRouter, Depends, HTTPException, status

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
):
    drivers = use_case.execute()

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
):
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
