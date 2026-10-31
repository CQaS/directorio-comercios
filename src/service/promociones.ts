
import { Promocion } from "../tipos";

const API_URL = "http://192.168.1.183:3000";

interface PromocionApi {
  id: string;
  comercioId: string;
  titulo: string;
  detalle: string;
  descuento: number | null;
  desde: string;
  hasta: string;
  imagenUrl: string | null;
  soloApp: boolean;
  usos: number;
  activa: boolean;
}

interface RespuestaPromociones {
  datos: PromocionApi[];
  meta: {
    total: number;
    pagina: number;
    porPagina: number;
  };
}

export async function buscarPromocionesPorComercio(
  comercioId: string,
): Promise<Promocion[]> {
  const parametros = new URLSearchParams({
    estado: "vigentes",
  });

  if (comercioId) {
    parametros.set("comercioId", comercioId);
  }

  const respuesta = await fetch(
    `${API_URL}/promociones?${parametros.toString()}`,
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron cargar las promociones.");
  }

  const resultado: RespuestaPromociones = await respuesta.json();

  return resultado.datos.map((promo) => ({
    ...promo,
    rubro: "",
    condiciones: "",
  }));
}

export async function buscarPromociones(): Promise<Promocion[]> {
  const estados = ["vigentes", "proximas", "por-vencer"];

  const resultados = await Promise.all(
    estados.map(async (estado) => {
      const respuesta = await fetch(
        `${API_URL}/promociones?estado=${estado}`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las promociones.");
      }

      const resultado: RespuestaPromociones = await respuesta.json();

      return resultado.datos.map((promo) => ({
        ...promo,
        rubro: "",
        condiciones: "",
      }));
    })
  );

  const unicas = new Map<string, Promocion>();

  resultados.flat().forEach((promo) => {
    unicas.set(promo.id, promo);
  });

  return Array.from(unicas.values());
}

export async function obtenerPromocionesPorId(
  id: string,
): Promise<Promocion | null> {
  const respuesta = await fetch(`${API_URL}/promociones/${id}`);

  if (!respuesta.ok) {
    return null;
  }

  const resultado: { datos: PromocionApi } = await respuesta.json();

  return {
    ...resultado.datos,
    rubro: "",
    condiciones: "",
  };
}

export function clasificarPromociones(promociones: Promocion[]) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

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
        hasta <= enSieteDias
      );
    }),

    proximas: promociones.filter((promo) => {
      const desde = new Date(promo.desde);

      return (
        promo.activa &&
        desde > hoy &&
        desde <= enSieteDias
      );
    }),
  };
}

export async function buscarPromocionesPorRubro(rubro: string): Promise<Promocion[]> {
  const rubros: Record<string, string> = {
    "Gastronomía": "rub-gastronomia",
    "Indumentaria": "rub-indumentaria",
    "Hogar": "rub-hogar",
    "Ferretería y construcción": "rub-ferreteria",
    "Salud y farmacia": "rub-salud",
    "Servicios": "rub-servicios",
    "Tecnología": "rub-tecnologia",
    "Librería": "rub-libreria",
    "Otros": "rub-otros",
  };

  const rubroId = rubros[rubro];

  if (!rubroId) return [];

  const parametros = new URLSearchParams({ rubroId });
  const respuesta = await fetch(`${API_URL}/promociones?${parametros.toString()}`);

  if (!respuesta.ok) {
    throw new Error("No se pudieron cargar las promociones.");
  }

  const resultado: RespuestaPromociones = await respuesta.json();

  return resultado.datos.map((promo) => ({
    ...promo,
    rubro,
    condiciones: "",
  }));
}
