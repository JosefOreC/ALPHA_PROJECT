"""Composición del planificador vial; los escenarios no acceden a persistencia."""
from functools import partial
from fastapi import Depends
from infrastructure import road_routing


def get_simulation_router():
    return road_routing.ValhallaRouter(45)


def get_simulation_planner(road_router=Depends(get_simulation_router)):
    return partial(road_routing.road_proposal, router=road_router)
