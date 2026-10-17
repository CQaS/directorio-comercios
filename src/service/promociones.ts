import { Promocion } from "../tipos";

export async function buscarPromocionesPorComercio(
  comercioId: string,
): Promise<Promocion[]> {
  // Implementación de la función asíncrona cuando tengamos la api real. Por ahora, devolvemos datos simulados.

  /* const respuesta = await fetch(
    `https://api/comercio/${comercioId}/promocion`,
  );

  if (!respuesta.ok) return null;

  const dato: Promocion = await respuesta.json();
  return dato; */

  return [
    {
      id: "promo-123",
      comercioId,
      titulo: "Promo 1",
      detalle: "Detalle de la promo 1",
      descuento: 10,
      desde: "2026-10-01",
      hasta: "2026-10-20",
      imagenUrl: null,
      soloApp: false,
      usos: 10,
      activa: true,
    },
    {
      id: "promo-456",
      comercioId,
      titulo: "Promo 2",
      detalle: "Detalle de la promo 2",
      descuento: 20,
      desde: "2026-10-06",
      hasta: "2026-10-31",
      imagenUrl: null,
      soloApp: false,
      usos: 10,
      activa: true,
    },
    {
      id: "promo-789",
      comercioId,
      titulo: "Promo 3",
      detalle: "Detalle de la promo 3",
      descuento: 30,
      desde: "2026-10-15",
      hasta: "2026-11-02",
      imagenUrl: null,
      soloApp: false,
      usos: 10,
      activa: true,
    },
  ];
}


export async function buscarPromociones(): Promise<Promocion[]> {

  return await
  buscarPromocionesPorComercio("");
}

export async function obtenerPromocionesPorId(id:string): Promise<Promocion | null> {
  const promociones = await
  buscarPromociones();
  const promocion = promociones.find((promocion) => promocion.id === id);

  if (promocion === undefined) {
    return null;
  }

  return promocion
  
}

export function
clasificarPromociones(promociones: Promocion[]) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const enSieteDias = new Date(hoy);
  enSieteDias.setDate(hoy.getDate() + 7);

  return {
    vigentes: promociones.filter((promo) => {
    const desde = new Date(promo.desde);
    const hasta = new Date(promo.hasta);

    return (
      promo.activa &&
      desde <= hoy &&
      hasta >= hoy
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

  porVencer: promociones.filter((promo) => {
    const hasta = new Date(promo.hasta);

    return (
      promo.activa &&
      new Date(promo.desde) <= hoy &&
      hasta >= hoy &&
      hasta <= enSieteDias
    );
  }),
}
}