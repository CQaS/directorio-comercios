import { peticionApi } from "./configuracionApi";
import { leerToken } from "./sesion";
import { obtenerBaseDatos } from "./baseDatos";


export interface Canje {
  id: string;
  promocionId: string;
  comercioId: string;
  codigo: string;
  fecha: string;
}

export async function obtenerCanjes(): Promise<Canje[]> {
  const db = await obtenerBaseDatos();
  return db.getAllAsync<Canje>(
    `SELECT id, promocion_id AS promocionId,
      comercio_id AS comercioId, codigo, fecha
      FROM canjes ORDER BY fecha DESC`,
  );
}

export async function registrarCanje(
  promocionId: string,
  comercioId: string,
  codigo: string,
): Promise<boolean> {
  const db = await obtenerBaseDatos();
  const nuevoCanje: Canje = {
    id: `${Date.now()}`,
    promocionId,
    comercioId,
    codigo,
    fecha: new Date().toISOString(),
  };

  const resultado = await db.runAsync(
    `INSERT OR IGNORE INTO canjes
      (id, promocion_id, comercio_id, codigo, fecha)
      VALUES (?, ?, ?, ?, ?)`,
    nuevoCanje.id,
    nuevoCanje.promocionId,
    nuevoCanje.comercioId,
    nuevoCanje.codigo,
    nuevoCanje.fecha,
  );
  return resultado.changes > 0;
}

export async function contarCanjesPorPromocion(
  promocionId: string,
): Promise<number> {
  const db = await obtenerBaseDatos();
  const resultado = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM canjes WHERE promocion_id = ?",
    promocionId,
  );
  return resultado?.total ?? 0;
}

export async function generarCodigoPromocion(
  promocionId: string,
): Promise<string> {
  const token = await leerToken();
  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const resultado = await peticionApi<{ codigo: string }>(
    `/promociones/${promocionId}/usos`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return resultado.codigo;
}

export async function obtenerCanjesDeLaApi(): Promise<Canje[]> {
  const token = await leerToken();
  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const usos = await peticionApi<
    {
      id: string;
      promocionId: string;
      usuarioId: string;
      codigo: string;
      validadoEn: string | null;
    }[]
  >(`/yo/usos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return usos.map((uso) => ({
    id: uso.id,
    promocionId: uso.promocionId,
    comercioId: "",
    codigo: uso.codigo,
    fecha: uso.validadoEn ?? "",
  }));
}

export async function validarCanjeEnLaApi(codigo: string): Promise<void> {
  const token = await leerToken();
  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  await peticionApi(`/mi-comercio/usos/validar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ codigo }),
  });
}
