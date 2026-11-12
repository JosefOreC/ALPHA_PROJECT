"""Explicit synthetic network for offline tests only."""
from domain.planning import distance, SPEED_KMH
from domain.road_network import RoadNetwork


class TestRoadRouter:
    __test__ = False

    def __init__(self,*args):
        pass

    def matrix(self,points,*args):
        return RoadNetwork({(a,b):(distance(a,b),distance(a,b)/SPEED_KMH*60) for a in points for b in points})

    def route(self,points,mode,*args):
        path,legs = [],[]
        for a,b in zip(points,points[1:]):
            if not path:
                path.append({'lat':a[0],'lng':a[1]})
            path.extend([{'lat':(a[0]+b[0])/2+.0001,'lng':(a[1]+b[1])/2},{'lat':b[0],'lng':b[1]}])
            legs.append({'origin':{'lat':a[0],'lng':a[1]},'destination':{'lat':b[0],'lng':b[1]},
                         'km':distance(a,b),'minutes':distance(a,b)/SPEED_KMH*60})
        return {'path':path,'legs':legs,'routing':{'provider':'Test network','mode':mode}}
