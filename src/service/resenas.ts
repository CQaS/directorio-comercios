import { Resena } from "../app/comercio/[id]";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { peticionApi } from "./configuracionApi";
import { leerToken, leerUsuario  } from "./sesion";
import { buscarComercios } from "./comercios";

//const API_URL = "http://192.168.1.183:3000";

let resenasGuardadas: Resena[] = [];

export function obtenerMisResenas(usuarioId: string): Resena[] {
  return resenasGuardadas.filter((resena) => resena.usuarioId === usuarioId);
}

export function guardarResena(nuevaResena: Resena): void {
  const indice = resenasGuardadas.findIndex(
    (resena) => resena.id === nuevaResena.id,
  );

  if (indice >= 0) {
    resenasGuardadas[indice] = nuevaResena;
  } else {
    resenasGuardadas.push(nuevaResena);
  }

  console.log("Reseñas guardadas:", resenasGuardadas);
}

export function eliminarResenaGuardada(resenaId: string): void {
  resenasGuardadas = resenasGuardadas.filter(
    (resena) => resena.id !== resenaId,
  );

  console.log("Reseñas después de eliminar:", resenasGuardadas);
}

export async function obtenerMisResenasDeLaApi(): Promise<Resena[]> {
  const token = await leerToken();

  if (!token) {
    throw new Error("NO_AUTORIZADO: No se encontró el token de sesión.");
  }

  const usuario = await leerUsuario();

    if (!usuario) {
        throw new Error("No se encontró el usuario de sesión.");
    }

    const comercios = await buscarComercios();

    const resenasPorComercio = await Promise.all(
        comercios.map((comercio) => obtenerResenasDeComercio(comercio.id)),
    );

    return resenasPorComercio
        .flat()
        .filter((resena) => resena.usuarioId === usuario.id);
}

export async function obtenerResenasDeComercio(
  comercioId: string,
): Promise<Resena[]> {
  try {
    const resenas = await peticionApi<Resena[]>(
      `/comercios/${comercioId}/resenas`,
    );

    return resenas;
  } catch (error) {
    console.error(
      `Error al obtener las reseñas del comercio ${comercioId}:`,
      error,
    );
    return [];
  }
}

export async function publicarResenaEnLaApi(
  comercioId: string,
  estrellas: number,
  comentario: string,
): Promise<Resena> {
  const token = await leerToken();

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const resenaCreada = await peticionApi<Resena>(
    `/comercios/${comercioId}/resenas`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estrellas,
        comentario,
      }),
    },
  );

  return resenaCreada;
}

export async function editarResenaEnLaApi(
  resenaId: string,
  estrellas: number,
  comentario: string,
): Promise<Resena> {
  const token = await leerToken();

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  // peticionApi maneja la URL dinámica, inyecta el token y extrae .datos automáticamente
  const resenaActualizada = await peticionApi<Resena>(`/resenas/${resenaId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      estrellas,
      comentario,
    }),
  });

  return resenaActualizada;
}

export async function eliminarResenaDeLaApi(resenaId: string): Promise<void> {
  const token = await leerToken();

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  await peticionApi(`/resenas/${resenaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function reportarResenaEnLaApi(resenaId: string): Promise<void> {
  const token = await leerToken();

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  await peticionApi(`/resenas/${resenaId}/reportes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function responderResenaEnLaApi(
  resenaId: string,
  respuestaTexto: string,
): Promise<Resena> {
  const token = await leerToken();

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const resenaActualizada = await peticionApi<Resena>(
    `/resenas/${resenaId}/respuesta`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        respuesta: respuestaTexto,
      }),
    },
  );

  return resenaActualizada;
}
