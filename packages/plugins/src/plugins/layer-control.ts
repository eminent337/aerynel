import type { AerynelAppAPI, AerynelMapControlPosition, AerynelPlugin } from "../types";

let layerControlPosition: AerynelMapControlPosition = "top-right";

export const maplibreLayerControlPlugin: AerynelPlugin = {
  id: "maplibre-layer-control",
  name: "Layer Control",
  version: "0.16.0",
  activeByDefault: true,
  activate: (app: AerynelAppAPI) => app.setBuiltInMapControlVisible("layer-control", true),
  deactivate: (app: AerynelAppAPI) => {
    app.setBuiltInMapControlVisible("layer-control", false);
  },
  getMapControlPosition: () => layerControlPosition,
  setMapControlPosition: (app: AerynelAppAPI, position: AerynelMapControlPosition) => {
    layerControlPosition = position;
    return app.setBuiltInMapControlPosition("layer-control", position);
  },
};
