import type { AerynelAppAPI, AerynelPlugin } from "../types";

const CARTO_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const cartoLightPlugin: AerynelPlugin = {
  id: "carto-light",
  name: "Carto Light Basemap",
  version: "0.1.0",
  activate: (app: AerynelAppAPI) => {
    app.setBasemap(CARTO_LIGHT);
  },
  deactivate: () => {},
};
