"""Directed road costs supplied by a routing engine; no geographic fallback."""
from dataclasses import dataclass


class RoadServiceUnavailable(RuntimeError):
    pass


@dataclass
class RoadNetwork:
    costs: dict

    def leg(self, origin, destination):
        if origin == destination:
            return (0.0, 0.0)
        return self.costs.get((origin, destination))
