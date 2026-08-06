import type { AerynelAppAPI, AerynelPlugin } from "../types";

const OSM_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export const osmBasemapPlugin: AerynelPlugin = {
  id: "osm-basemap",
  name: "OpenStreetMap Basemap",
  version: "0.1.0",
  activate: (app: AerynelAppAPI) => {
    app.setBasemap(OSM_STYLE);
  },
  deactivate: () => {
    /* basemap remains until user changes it */
  },
};
