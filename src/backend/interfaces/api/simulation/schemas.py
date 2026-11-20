from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class Point(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)
    id: str = Field(min_length=1, max_length=30, pattern=r'^[\w -]+$')
    x: float = Field(ge=-100, le=100)
    y: float = Field(ge=-100, le=100)


class Mobile(Point):
    capacity: float = Field(gt=0, le=100000)


class Delivery(Point):
    weight: float = Field(gt=0, le=100000)
    fromMinute: int = Field(ge=0, le=1440)
    toMinute: int = Field(gt=0, le=1440)

    @model_validator(mode='after')
    def valid_window(self):
        if self.fromMinute >= self.toMinute:
            raise ValueError('La ventana debe terminar después de su inicio.')
        return self


class Settings(BaseModel):
    model_config = ConfigDict(extra='forbid')
    goal: Literal['distance', 'time', 'co2', 'balanced'] = 'distance'
    respectWindows: bool = True
    prioritizeLowEmission: bool = False
    returnToDepot: bool = False


class Scenario(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)
    vehicles: list[Mobile] = Field(min_length=1, max_length=15)
    orders: list[Delivery] = Field(min_length=1, max_length=50)
    speedKmh: float = Field(default=25, ge=5, le=100)
    settings: Settings = Field(default_factory=Settings)

    @model_validator(mode='after')
    def unique_ids(self):
        for items in (self.vehicles, self.orders):
            if len({item.id for item in items}) != len(items):
                raise ValueError('Los identificadores deben ser únicos dentro de cada lista.')
        return self
