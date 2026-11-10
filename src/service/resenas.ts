import { Resena } from "../app/comercio/[id]";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.183:3000";

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
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const respuesta = await fetch(`${API_URL}/yo/resenas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener tus reseñas.");
  }

  const resultado: { datos: Resena[] } = await respuesta.json();

  return resultado.datos;
}

export async function obtenerResenasDeComercio(
  comercioId: string,
): Promise<Resena[]> {
  const respuesta = await fetch(
    `${API_URL}/comercios/${comercioId}/resenas`,
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener las reseñas del comercio.");
  }

  const resultado: { datos: Resena[] } = await respuesta.json();

  return resultado.datos;
}

export async function publicarResenaEnLaApi(
  comercioId: string,
  estrellas: number,
  comentario: string,
): Promise<Resena> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const respuesta = await fetch(
    `${API_URL}/comercios/${comercioId}/resenas`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estrellas,
        comentario,
      }),
    },
  );

  if (!respuesta.ok) {
  const detalle = await respuesta.text();
  console.log("ERROR AL PUBLICAR:", respuesta.status, detalle);
  throw new Error(`Error ${respuesta.status}: ${detalle}`);
  }

  const resultado: { datos: Resena } = await respuesta.json();

  return resultado.datos;
}

export async function editarResenaEnLaApi(
  resenaId: string,
  estrellas: number,
  comentario: string,
): Promise<Resena> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const respuesta = await fetch(`${API_URL}/resenas/${resenaId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      estrellas,
      comentario,
    }),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo editar la reseña.");
  }

  const resultado: { datos: Resena } = await respuesta.json();

  return resultado.datos;
}

export async function eliminarResenaDeLaApi(
  resenaId: string,
): Promise<void> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const respuesta = await fetch(`${API_URL}/resenas/${resenaId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo eliminar la reseña.");
  }
}

export async function reportarResenaEnLaApi(
  resenaId: string,
): Promise<void> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const respuesta = await fetch(
    `${API_URL}/resenas/${resenaId}/reportes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo reportar la reseña.");
  }
}

export async function responderResenaEnLaApi(
  resenaId: string,
  respuestaTexto: string,
): Promise<Resena> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No se encontró el token de sesión.");
  }

  const respuesta = await fetch(
    `${API_URL}/resenas/${resenaId}/respuesta`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        respuesta: respuestaTexto,
      }),
    },
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo responder la reseña.");
  }

  const resultado: { datos: Resena } = await respuesta.json();

  return resultado.datos;
}