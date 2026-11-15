import { Promocion } from "../tipos";
import { peticionApi } from "./configuracionApi";
import { leerToken } from "./sesion";

export async function buscarPromocionesPorComercio(
  comercioId: string,
): Promise<Promocion[]> {
  const promociones = await buscarPromociones();

  return promociones.filter((promocion) => promocion.comercioId === comercioId);
}

export async function buscarPromociones(): Promise<Promocion[]> {
  try {
    const estados = ["vigentes", "proximas", "por-vencer"];

    const resultados = await Promise.all(
      estados.map(async (estado) => {
        const datos = await peticionApi<Promocion[]>(
          `/promociones?estado=${estado}`,
        );
        return datos;
      }),
    );

    const promocionesUnicas = new Map<string, Promocion>();

    resultados.flat().forEach((promo) => {
      promocionesUnicas.set(promo.id, promo);
    });

    return Array.from(promocionesUnicas.values());
  } catch (error) {
    console.error("Error al buscar promociones:", error);
    return [];
  }
}

export async function obtenerPromocionesPorId(
  id: string,
): Promise<Promocion | null> {
  const promociones = await buscarPromociones();
  const promocion = promociones.find((promocion) => promocion.id === id);

  if (promocion === undefined) {
    return null;
  }

  return promocion;
}

export function clasificarPromociones(promociones: Promocion[]) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const enTresDias = new Date(hoy);
  enTresDias.setDate(hoy.getDate() + 3);

  const enSieteDias = new Date(hoy);
  enSieteDias.setDate(hoy.getDate() + 7);

  return {
    vigentes: promociones.filter((promo) => {
      const desde = new Date(promo.desde);
      const hasta = new Date(promo.hasta);

      return promo.activa && desde <= hoy && hasta >= hoy;
    }),

    porVencer: promociones.filter((promo) => {
      const hasta = new Date(promo.hasta);

      return (
        promo.activa &&
        new Date(promo.desde) <= hoy &&
        hasta >= hoy &&
        hasta <= enTresDias
      );
    }),

    proximas: promociones.filter((promo) => {
      const desde = new Date(promo.desde);

      return promo.activa && desde > hoy && desde <= enSieteDias;
    }),
  };
}

export async function buscarPromocionesPorRubro(
  rubro: string,
): Promise<Promocion[]> {
  try {
    const rubros: Record<string, string> = {
      Gastronomía: "rub-gastronomia",
      "Ferretería y construcción": "rub-ferreteria",
      Indumentaria: "rub-indumentaria",
      Servicios: "rub-servicios",
      Hogar: "rub-hogar",
      "Salud y farmacia": "rub-salud",
      Tecnología: "rub-tecnologia",
      Librería: "rub-libreria",
      Otros: "rub-otros",
    };

    const rubroId = rubros[rubro];

    if (!rubroId) return [];

    const estados = ["vigentes", "proximas", "por-vencer"];

    const resultados = await Promise.all(
      estados.map(async (estado) => {
        const datos = await peticionApi<Promocion[]>(
          `/promociones?estado=${estado}&rubroId=${rubroId}`,
        );
        return datos;
      }),
    );

    const promocionesUnicas = new Map<string, Promocion>();

    resultados.flat().forEach((promo) => {
      promocionesUnicas.set(promo.id, promo);
    });

    return Array.from(promocionesUnicas.values());
  } catch (error) {
    console.error("Error al buscar promociones por rubro:", error);
    return [];
  }
}


export type DatosNuevaPromocion = {
  titulo: string;
  detalle: string;
  descuento: number | null;
  desde: string;
  hasta: string;
  imagenUrl: string | null;
  soloApp: boolean;
};

export type DatosEdicionPromocion = Partial<DatosNuevaPromocion>;

export async function obtenerMisPromociones(): Promise<Promocion[]> {
  const token = await leerToken();

  if (!token) {
    throw new Error("Tenés que iniciar sesión para ver tus promociones.");
  }

  return peticionApi<Promocion[]>("/mi-comercio/promociones", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function crearPromocion(
  datos: DatosNuevaPromocion,
): Promise<Promocion> {
  const token = await leerToken();

  if (!token) {
    throw new Error("Tenés que iniciar sesión para crear una promoción.");
  }

  return peticionApi<Promocion>("/mi-comercio/promociones", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
}

export async function editarPromocion(
  id: string,
  cambios: DatosEdicionPromocion,
): Promise<Promocion> {
  const token = await leerToken();

  if (!token) {
    throw new Error("Tenés que iniciar sesión para editar una promoción.");
  }

  return peticionApi<Promocion>(
    `/mi-comercio/promociones/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cambios),
    },
  );
}


export async function eliminarPromocion(id: string): Promise<void> {
  const token = await leerToken();

  if (!token) {
    throw new Error("Tenés que iniciar sesión para eliminar una promoción.");
  }

  await peticionApi<void>(
    `/mi-comercio/promociones/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

