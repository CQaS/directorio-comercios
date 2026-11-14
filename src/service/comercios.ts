import type { Comercio } from "../tipos";
import { peticionApi } from "./configuracionApi";
import { obtenerBaseDatos } from "./baseDatos";

export async function buscarComercios(): Promise<Comercio[]> {
  const resultado = await buscarComerciosConEstado();
  return resultado.comercios;
}

export async function buscarComerciosConEstado(): Promise<{
  comercios: Comercio[];
  desdeCache: boolean;
}> {
  try {
    const parametros = new URLSearchParams({
      pagina: "1",
      porPagina: "1000",
      orden: "nombre",
    });

    const datos = await peticionApi<Comercio[]>(
      `/comercios?${parametros.toString()}`,
    );
    try {
      await guardarComerciosEnCache(datos);
    } catch (error) {
      console.error("No se pudieron guardar los comercios para uso offline:", error);
    }
    return { comercios: datos, desdeCache: false };
  } catch (error) {
    console.error("Error al cargar comercios:", error);
    const comerciosEnCache = await obtenerComerciosEnCache();
    if (comerciosEnCache.length > 0) {
      return { comercios: comerciosEnCache, desdeCache: true };
    }

    throw new Error("No hay conexión ni comercios guardados para ver offline.", {
      cause: error,
    });
  }
}

async function guardarComerciosEnCache(comercios: Comercio[]): Promise<void> {
  if (comercios.length === 0) {
    return;
  }

  const db = await obtenerBaseDatos();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM comercios_cache");
    for (const comercio of comercios) {
      await db.runAsync(
        `INSERT INTO comercios_cache
          (comercio_id, nombre, rubro_id, direccion, datos_json, actualizado_en)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(comercio_id) DO UPDATE SET
            nombre = excluded.nombre,
            rubro_id = excluded.rubro_id,
            direccion = excluded.direccion,
            datos_json = excluded.datos_json,
            actualizado_en = CURRENT_TIMESTAMP`,
        comercio.id,
        comercio.nombre,
        comercio.rubroId,
        comercio.direccion,
        JSON.stringify(comercio),
      );
    }
  });
}

async function obtenerComerciosEnCache(): Promise<Comercio[]> {
  const db = await obtenerBaseDatos();
  const filas = await db.getAllAsync<{ datos_json: string }>(
    "SELECT datos_json FROM comercios_cache ORDER BY nombre COLLATE NOCASE",
  );
  return filas.map((fila) => JSON.parse(fila.datos_json) as Comercio);
}
