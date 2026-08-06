/**
 * Shared context for the Add Data dialog: cross-cutting services the dialog
 * shell exposes to every per-source subcomponent (the store layer list, the
 * map controller, submit-in-progress state, close handling, and the Martin
 * connection used by the PostgreSQL source).
 */

import type { AerynelLayer } from "@aryee/core";
import type { MapController } from "@aryee/map";
import { createContext, useContext, type RefObject } from "react";
import type { MartinConnection } from "./useMartinConnection";

export interface AddDataShellContextValue {
  mapControllerRef: RefObject<MapController | null>;
  addLayer: (layer: AerynelLayer, beforeLayerId?: string | null) => void;
  existingLayers: AerynelLayer[];
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  /** Run close cleanups (e.g. transient Martin shutdown) and close the dialog. */
  closeDialog: () => void;
  martin: MartinConnection;
}

const AddDataShellContext = createContext<AddDataShellContextValue | null>(null);

export const AddDataShellProvider = AddDataShellContext.Provider;

export function useAddDataShell(): AddDataShellContextValue {
  const value = useContext(AddDataShellContext);
  if (!value) {
    throw new Error("useAddDataShell must be used within an AddDataDialog.");
  }
  return value;
}
