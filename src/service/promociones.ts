import { Promocion } from "../tipos";
import { peticionApi } from "./configuracionApi";

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
