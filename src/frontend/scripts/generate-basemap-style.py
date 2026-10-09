"""Adapt a downloaded OpenFreeMap Liberty style using the shared map palette.

Usage from src/frontend:
  python scripts/generate-basemap-style.py .test-deps/liberty-style.json
Source: https://tiles.openfreemap.org/styles/liberty
Licenses and attribution: public/maps/README.md and accompanying license files.
"""

import copy
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
style = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
tokens = (ROOT / "src/shared/ui/tokens.css").read_text(encoding="utf-8")
palette = dict(re.findall(r"--map-base-([\w-]+):\s*([^;]+);", tokens))

def color(name):
    return palette[name].strip()

def guard_shield_filter(value):
    """Skip shields whose tiles omit the numeric road reference length."""
    if value == ["get", "ref_length"]:
        return ["coalesce", value, 999]
    if isinstance(value, list):
        return [guard_shield_filter(item) for item in value]
    return value

style["name"] = "Lima · calles y tonos pastel"
style["metadata"] = {
    "source": "https://tiles.openfreemap.org/styles/liberty",
    "adaptation": "ALPHA_PROJECT: flat pastel palette, road hierarchy, fewer labels, no relief or 3D.",
    "palette": "src/shared/ui/tokens.css --map-base-*",
}
style["sources"].pop("ne2_shaded", None)
style["sources"]["openmaptiles"]["attribution"] = (
    '<a href="https://openfreemap.org/">OpenFreeMap</a> · '
    '<a href="https://openmaptiles.org/">© OpenMapTiles</a> · '
    '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>'
)
layers = []
for original in style["layers"]:
    layer = copy.deepcopy(original)
    name, kind = layer["id"], layer["type"]
    if kind in ("raster", "fill-extrusion") or name == "park_outline" or "hatching" in name or "one_way" in name:
        continue
    if "shield" in name and "filter" in layer:
        layer["filter"] = guard_shield_filter(layer["filter"])
    paint = layer.setdefault("paint", {})
    if kind == "background":
        paint["background-color"] = color("land")
    elif kind == "fill":
        paint.pop("fill-pattern", None)
        paint.pop("fill-outline-color", None)
        paint["fill-opacity"] = 1
        if "water" in name:
            paint["fill-color"] = color("water")
        elif any(x in name for x in ("park", "wood", "grass", "pitch", "track", "cemetery", "wetland")):
            paint["fill-color"] = color("green")
        elif name == "landuse_residential":
            layer.pop("maxzoom", None)
            paint["fill-color"] = color("urban")
        elif name == "building":
            layer["minzoom"] = 15
            layer.pop("maxzoom", None)
            paint["fill-color"] = color("building")
        else:
            paint["fill-color"] = color("urban") if "landuse" in name else color("land")
    elif kind == "line":
        if name.startswith("waterway"):
            paint["line-color"] = color("water" if "river" in name else "stream")
        elif any(x in name for x in ("road_", "bridge_", "tunnel_")):
            casing = "casing" in name
            if "motorway" in name:
                paint["line-color"] = color("highway-edge" if casing else "highway")
            elif "trunk_primary" in name:
                paint["line-color"] = color("arterial-edge" if casing else "arterial")
            else:
                paint["line-color"] = color("road-edge" if casing else "road")
        else:
            paint["line-color"] = color("road-edge")
    elif kind == "symbol":
        layout = layer.setdefault("layout", {})
        if "text-field" in layout and "name" in json.dumps(layout["text-field"]):
            layout["text-field"] = ["coalesce", ["get", "name:es"], ["get", "name"], ["get", "name:latin"], ["get", "name_en"]]
        paint["text-color"] = color("water-text" if "water" in name else "text")
        paint["text-halo-color"] = color("road")
        paint["text-halo-width"] = 1
        if name.startswith("poi"):
            layer["minzoom"] = max(layer.get("minzoom", 0), 15)
            paint["text-color"] = color("text-muted")
        elif name == "highway-name-major":
            layer["minzoom"] = 12
        elif name == "label_other":
            layer["minzoom"] = 11
        elif name == "highway-shield-non-us":
            layer["minzoom"] = 11
            layout["symbol-spacing"] = 400
    layers.append(layer)
style["layers"] = layers
target = ROOT / "public/maps/lima-pastel.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(style, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {target.name}: {len(layers)} layers, palette from shared tokens.")
