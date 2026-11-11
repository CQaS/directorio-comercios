import Constants from "expo-constants";
import { Platform } from "react-native";

function obtenerUrlApi(): string {
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:3000`;
  }

  return "http://localhost:3000";
}

export const API_URL = obtenerUrlApi();

export async function peticionApi<T>(
  ruta: string,
  opciones?: RequestInit,
): Promise<T> {
  const rutaLimpia = ruta.startsWith("/") ? ruta : `/${ruta}`;
  const urlCompleta = `${API_URL}${rutaLimpia}`;

  try {
    const respuesta = await fetch(urlCompleta, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        ...opciones?.headers,
      },
    });

    if (!respuesta.ok) {
      throw new Error(
        `Error en la API (${respuesta.status}): ${respuesta.statusText}`,
      );
    }

    const json = await respuesta.json();

    return (json.datos !== undefined ? json.datos : json) as T;
  } catch (error) {
    console.error(`[API Error] Falló la petición a ${urlCompleta}:`, error);
    throw error;
  }
}
