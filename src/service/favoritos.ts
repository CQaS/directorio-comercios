import { peticionApi } from "./configuracionApi";
import { obtenerBaseDatos } from "./baseDatos";

export async function obtenerFavoritos(): Promise<string[]> {
  const db = await obtenerBaseDatos();
  const filas = await db.getAllAsync<{ comercio_id: string }>(
    "SELECT comercio_id FROM favoritos ORDER BY creado_en DESC",
  );
  return filas.map((fila) => fila.comercio_id);
}

export async function agregarFavorito(id: string): Promise<void> {
  const db = await obtenerBaseDatos();
  await db.runAsync("INSERT OR IGNORE INTO favoritos (comercio_id) VALUES (?)", id);
}

export async function quitarFavorito(id: string): Promise<void> {
  const db = await obtenerBaseDatos();
  await db.runAsync("DELETE FROM favoritos WHERE comercio_id = ?", id);
}

export async function esFavorito(id: string): Promise<boolean> {
  const favoritos = await obtenerFavoritos();
  return favoritos.includes(id);
}

export async function limpiarFavoritosInvalidos(): Promise<void> {
  try {
    const comercios = await peticionApi<any[]>(
      `/comercios?pagina=1&porPagina=1000`,
    );

    const idsComercios = new Set(
      comercios.map((comercio: any) => comercio.id),
    );
    const db = await obtenerBaseDatos();
    const favoritos = await db.getAllAsync<{ comercio_id: string }>(
      "SELECT comercio_id FROM favoritos",
    );

    await db.withTransactionAsync(async () => {
      for (const { comercio_id: id } of favoritos) {
        if (!idsComercios.has(id)) {
          await db.runAsync(
            "DELETE FROM favoritos WHERE comercio_id = ?",
            id,
          );
        }
      }
    });
  } catch (error) {
    console.error("Error al limpiar favoritos:", error);
  }
}
