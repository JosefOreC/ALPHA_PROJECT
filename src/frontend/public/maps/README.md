# Lima pastel

`lima-pastel.json` adapts the [OpenFreeMap Liberty style](https://tiles.openfreemap.org/styles/liberty), derived from [OSM Liberty](https://github.com/maputnik/osm-liberty) and OSM Bright / Mapbox Open Styles. Changes: flat pastel colors from `src/shared/ui/tokens.css`, road hierarchy, Spanish names when available, fewer POIs, no relief or 3D buildings.

Source data remains OpenStreetMap, served by OpenFreeMap using the OpenMapTiles schema. This style is a visual reference for the application; it contains no Google tiles or Google Maps assets. Keep OpenFreeMap, OpenMapTiles and OpenStreetMap credit visible.

The upstream MIT and BSD notices and design attribution are retained in `LICENSE-OpenFreeMap.md` and `LICENSE-OSM-Liberty.md`. See those files for the complete upstream terms and credits. Modified on 09/10/2026.

To regenerate from `src/frontend` after changing the map palette:

```powershell
curl.exe --fail https://tiles.openfreemap.org/styles/liberty -o .test-deps/liberty-style.json
python scripts/generate-basemap-style.py .test-deps/liberty-style.json
```

Review the generated cartography after regeneration: upstream schema/style changes can affect the result.
