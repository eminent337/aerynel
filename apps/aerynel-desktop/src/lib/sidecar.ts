import { invoke } from "@tauri-apps/api/core";
import { setSidecarAuthToken } from "@aryee/processing";
import { isTauri } from "./tauri-io";

export interface SidecarServerInfo {
  baseUrl: string;
  port: number;
  /** Per-launch auth token the sidecar client must send on every request. */
  token: string;
}

export async function startAerynelSidecar(): Promise<SidecarServerInfo> {
  assertTauri();
  const info = await invoke<SidecarServerInfo>("start_aerynel_sidecar");
  // Hand the per-launch token to the sidecar client so all subsequent requests
  // (which resolve the base URL themselves) are authenticated.
  setSidecarAuthToken(info.token);
  return info;
}

export async function stopAerynelSidecar(): Promise<void> {
  assertTauri();
  await invoke("stop_aerynel_sidecar");
  setSidecarAuthToken(null);
}

function assertTauri(): void {
  if (!isTauri()) {
    throw new Error("Starting the processing server requires Aerynel Desktop.");
  }
}
