import * as duckdb from "@duckdb/duckdb-wasm";

export async function selectDuckDbBundle(): Promise<duckdb.DuckDBBundle> {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  return duckdb.selectBundle(JSDELIVR_BUNDLES);
}
