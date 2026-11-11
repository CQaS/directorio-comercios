import { Comercio } from "../tipos";
import { peticionApi } from "./configuracionApi";

interface RespuestaComercios {
  datos: Comercio[];
  meta: {
    total: number;
    pagina: number;
    porPagina: number;
  };
}

export async function buscarComercios(): Promise<Comercio[]> {
  try {
    const parametros = new URLSearchParams({
      pagina: "1",
      porPagina: "1000",
      orden: "nombre",
    });

    const datos = await peticionApi<Comercio[]>(
      `/comercios?${parametros.toString()}`,
    );

    return datos;
  } catch (error) {
    console.error("Error al cargar comercios:", error);
    throw new Error("No se pudieron cargar los comercios.");
  }
}
