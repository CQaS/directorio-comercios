import AsyncStorage from "@react-native-async-storage/async-storage";
import { peticionApi } from "./configuracionApi";

export interface Canje {
  id: string;
  promocionId: string;
  comercioId: string;
  codigo: string;
  fecha: string;
}

const CLAVE_CANJES = "@canjes";

export async function obtenerCanjes(): Promise<Canje[]> {
  const datos = await AsyncStorage.getItem(CLAVE_CANJES);

  if (datos === null) {
    return [];
  }

  return JSON.parse(datos) as Canje[];
}

export async function registrarCanje(
  promocionId: string,
  comercioId: string,
  codigo: string,
): Promise<boolean> {
  const canjes = await obtenerCanjes();

  const yaRegistrado = canjes.some((canje) => canje.codigo === codigo);

  if (yaRegistrado) {
    return false;
  }

  const nuevoCanje: Canje = {
    id: `${Date.now()}`,
    promocionId,
    comercioId,
    codigo,
    fecha: new Date().toISOString(),
  };

  canjes.push(nuevoCanje);

  await AsyncStorage.setItem(CLAVE_CANJES, JSON.stringify(canjes));

  return true;
}

export async function contarCanjesPorPromocion(
  promocionId: string,
): Promise<number> {
  const canjes = await obtenerCanjes();

  return canjes.filter((canje) => canje.promocionId === promocionId).length;
}

export async function generarCodigoPromocion(
  promocionId: string,
): Promise<string> {
  const token = await AsyncStorage.getItem("token");
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
  const token = await AsyncStorage.getItem("token");
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
  const token = await AsyncStorage.getItem("token");
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
